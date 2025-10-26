# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-26
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
# TradingAgents/graph/trading_graph.py

import os
from pathlib import Path
import json
import uuid
from datetime import date
from typing import Dict, Any, Tuple, List, Optional

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI

from langgraph.prebuilt import ToolNode

from tradingagents.agents import *
from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.agents.utils.memory import FinancialSituationMemory
from tradingagents.agents.utils.agent_states import (
    AgentState,
    InvestDebateState,
    RiskDebateState,
)
from tradingagents.dataflows.config import set_config
from .openrouter_patch import apply_openrouter_responses_patch

# Import the new abstract tool methods from agent_utils
from tradingagents.agents.utils.agent_utils import (
    get_stock_data,
    get_indicators,
    get_fundamentals,
    get_balance_sheet,
    get_cashflow,
    get_income_statement,
    get_news,
    get_insider_sentiment,
    get_insider_transactions,
    get_global_news
)

from .conditional_logic import ConditionalLogic
from .setup import GraphSetup
from .propagation import Propagator
from .reflection import Reflector
from .signal_processing import SignalProcessor


class TradingAgentsGraph:
    """Main class that orchestrates the trading agents framework."""

    def __init__(
        self,
        selected_analysts: Optional[List[str]] = None,
        debug=False,
        config: Dict[str, Any] = None,
        memory_namespace: Optional[str] = None,
    ):
        """Initialize the trading agents graph and components.

        Args:
            selected_analysts: List of analyst types to include
            debug: Whether to run in debug mode
            config: Configuration dictionary. If None, uses default config
        """
        if selected_analysts is None:
            selected_analysts = ["market", "social", "news", "fundamentals"]

        self.debug = debug
        self.config = config or DEFAULT_CONFIG
        self.memory_namespace = self._resolve_memory_namespace(memory_namespace)

        # Update the interface's config
        set_config(self.config)

        # Create necessary directories
        os.makedirs(
            os.path.join(self.config["project_dir"], "dataflows/data_cache"),
            exist_ok=True,
        )

        # Initialize LLMs
        llm_provider = self.config["llm_provider"].lower()
        openrouter_api_key = None
        if llm_provider == "openrouter":
            openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
            if not openrouter_api_key:
                raise RuntimeError(
                    "OPENROUTER_API_KEY must be set when llm_provider is OpenRouter. "
                    "Check your .env (see .env.example) or export the key before running the CLI."
                )
            apply_openrouter_responses_patch()

        if llm_provider in ("openai", "ollama", "openrouter"):
            deep_model_kwargs: dict = {}
            quick_model_kwargs: dict = {}
            deep_reasoning = None
            quick_reasoning = None

            if llm_provider == "openrouter":
                deep_reasoning = self._build_reasoning_config(
                    self.config.get("deep_think_llm", ""),
                    self.config.get("thinking_effort_deep", self.config.get("thinking_effort")),
                )
                quick_reasoning = self._build_reasoning_config(
                    self.config.get("quick_think_llm", ""),
                    self.config.get("thinking_effort_quick", self.config.get("thinking_effort")),
                )
                # OpenRouter Responses API는 reasoning 필드를 필수로 요구하므로
                # thinking mode가 비활성화된 경우에도 최소 설정을 적용한다.
                if not self.config.get("enable_thinking_mode"):
                    deep_reasoning = deep_reasoning or {"effort": "medium"}
                    quick_reasoning = quick_reasoning or {"effort": "medium"}

            chat_kwargs = {"base_url": self.config["backend_url"]}
            if llm_provider == "openrouter":
                chat_kwargs["api_key"] = openrouter_api_key

            deep_kwargs = {}
            if deep_model_kwargs:
                deep_kwargs["model_kwargs"] = deep_model_kwargs
            if deep_reasoning:
                deep_kwargs["reasoning"] = deep_reasoning

            quick_kwargs = {}
            if quick_model_kwargs:
                quick_kwargs["model_kwargs"] = quick_model_kwargs
            if quick_reasoning:
                quick_kwargs["reasoning"] = quick_reasoning

            self.deep_thinking_llm = ChatOpenAI(
                model=self.config["deep_think_llm"],
                **deep_kwargs,
                **chat_kwargs,
            )
            self.quick_thinking_llm = ChatOpenAI(
                model=self.config["quick_think_llm"],
                **quick_kwargs,
                **chat_kwargs,
            )
        elif llm_provider == "anthropic":
            self.deep_thinking_llm = ChatAnthropic(model=self.config["deep_think_llm"], base_url=self.config["backend_url"])
            self.quick_thinking_llm = ChatAnthropic(model=self.config["quick_think_llm"], base_url=self.config["backend_url"])
        elif llm_provider == "google":
            self.deep_thinking_llm = ChatGoogleGenerativeAI(model=self.config["deep_think_llm"])
            self.quick_thinking_llm = ChatGoogleGenerativeAI(model=self.config["quick_think_llm"])
        else:
            raise ValueError(f"Unsupported LLM provider: {self.config['llm_provider']}")

        # Initialize memories
        self.bull_memory = FinancialSituationMemory(self._memory_name("bull_memory"), self.config)
        self.bear_memory = FinancialSituationMemory(self._memory_name("bear_memory"), self.config)
        self.trader_memory = FinancialSituationMemory(self._memory_name("trader_memory"), self.config)
        self.invest_judge_memory = FinancialSituationMemory(self._memory_name("invest_judge_memory"), self.config)
        self.risk_manager_memory = FinancialSituationMemory(self._memory_name("risk_manager_memory"), self.config)
        self._memories = [
            self.bull_memory,
            self.bear_memory,
            self.trader_memory,
            self.invest_judge_memory,
            self.risk_manager_memory,
        ]

        # Create tool nodes
        self.tool_nodes = self._create_tool_nodes()

        # Initialize components
        self.conditional_logic = ConditionalLogic()
        self.graph_setup = GraphSetup(
            self.quick_thinking_llm,
            self.deep_thinking_llm,
            self.tool_nodes,
            self.bull_memory,
            self.bear_memory,
            self.trader_memory,
            self.invest_judge_memory,
            self.risk_manager_memory,
            self.conditional_logic,
        )

        self.propagator = Propagator()
        self.reflector = Reflector(self.quick_thinking_llm)
        self.signal_processor = SignalProcessor(self.quick_thinking_llm)

        # State tracking
        self.curr_state = None
        self.ticker = None
        self.log_states_dict = {}  # date to full state dict

        # Set up the graph
        self.graph = self.graph_setup.setup_graph(selected_analysts)

    def _resolve_memory_namespace(self, provided: Optional[str]) -> str:
        """Determine a per-run namespace for Chroma collections."""

        def _normalize(value: str) -> str:
            cleaned = value.strip()
            if not cleaned:
                return ""
            return "".join(ch if ch.isalnum() or ch in {"-", "_"} else "_" for ch in cleaned)

        if isinstance(provided, str):
            normalized = _normalize(provided)
            if normalized:
                return normalized

        config_namespace = self.config.get("memory_namespace")
        if isinstance(config_namespace, str):
            normalized = _normalize(config_namespace)
            if normalized:
                return normalized

        metadata = self.config.get("metadata")
        if isinstance(metadata, dict):
            for key in ("memory_namespace", "memoryNamespace", "run_id", "runId"):
                candidate = metadata.get(key)
                if isinstance(candidate, str):
                    normalized = _normalize(candidate)
                    if normalized:
                        return normalized

        return f"ta_run_{uuid.uuid4().hex}"

    def _memory_name(self, base: str) -> str:
        """Compose a namespaced collection identifier for this run."""
        return f"{self.memory_namespace}_{base}"

    def cleanup(self) -> None:
        """Tear down any Chroma collections created for this run."""
        for memory in getattr(self, "_memories", []):
            try:
                memory.cleanup()
            except Exception:
                # Best-effort cleanup: ignore backend-specific errors.
                pass

    def _create_tool_nodes(self) -> Dict[str, ToolNode]:
        """Create tool nodes for different data sources using abstract methods."""
        return {
            "market": ToolNode(
                [
                    # Core stock data tools
                    get_stock_data,
                    # Technical indicators
                    get_indicators,
                ]
            ),
            "social": ToolNode(
                [
                    # News tools for social media analysis
                    get_news,
                ]
            ),
            "news": ToolNode(
                [
                    # News and insider information
                    get_news,
                    get_global_news,
                    get_insider_sentiment,
                    get_insider_transactions,
                ]
            ),
            "fundamentals": ToolNode(
                [
                    # Fundamental analysis tools
                    get_fundamentals,
                    get_balance_sheet,
                    get_cashflow,
                    get_income_statement,
                ]
            ),
        }

    @staticmethod
    def _model_prefers_reasoning_tokens(model_id: str) -> bool:
        """Return True if the target model expects explicit token budgets."""
        if not model_id:
            return False
        lowered = model_id.lower()
        return lowered.startswith("anthropic/")

    @classmethod
    def _build_reasoning_config(
        cls,
        model_id: str,
        effort: Optional[Any],
    ) -> Dict[str, Any]:
        """Return a reasoning payload compatible with OpenRouter Responses API."""
        # 기본값은 medium effort
        if effort is None or (isinstance(effort, str) and not effort.strip()):
            effort_value: Optional[str] = "medium"
            tokens_override: Optional[int] = None
        elif isinstance(effort, (int, float)):
            effort_value = None
            tokens_override = max(1, int(effort))
        else:
            text_value = str(effort).strip()
            if text_value.isdigit():
                effort_value = None
                tokens_override = max(1, int(text_value))
            else:
                normalized = text_value.lower()
                aliases = {
                    "minimal": "minimal",
                    "min": "minimal",
                    "low": "low",
                    "lite": "low",
                    "short": "low",
                    "quick": "low",
                    "medium": "medium",
                    "balanced": "medium",
                    "default": "medium",
                    "standard": "medium",
                    "high": "high",
                    "deep": "high",
                    "extended": "high",
                    "max": "high",
                }
                effort_value = aliases.get(normalized, normalized)
                tokens_override = None

        allowed_efforts = {"minimal", "low", "medium", "high"}
        if effort_value and effort_value not in allowed_efforts:
            effort_value = "medium"

        if cls._model_prefers_reasoning_tokens(model_id):
            token_defaults = {
                "minimal": 256,
                "low": 256,
                "medium": 800,
                "high": 1200,
            }
            max_tokens = tokens_override or token_defaults.get(effort_value or "medium", 800)
            return {"max_tokens": max_tokens}

        if tokens_override is not None:
            return {"max_tokens": tokens_override}

        return {"effort": effort_value or "medium"}

    def propagate(self, company_name, trade_date):
        """Run the trading agents graph for a company on a specific date."""

        self.ticker = company_name

        # Initialize state
        init_agent_state = self.propagator.create_initial_state(
            company_name, trade_date
        )
        args = self.propagator.get_graph_args()

        if self.debug:
            # Debug mode with tracing
            trace = []
            for chunk in self.graph.stream(init_agent_state, **args):
                if len(chunk["messages"]) == 0:
                    pass
                else:
                    chunk["messages"][-1].pretty_print()
                    trace.append(chunk)

            final_state = trace[-1]
        else:
            # Standard mode without tracing
            final_state = self.graph.invoke(init_agent_state, **args)

        # Store current state for reflection
        self.curr_state = final_state

        # Log state
        self._log_state(trade_date, final_state)

        # Return decision and processed signal
        return final_state, self.process_signal(final_state["final_trade_decision"])

    def _log_state(self, trade_date, final_state):
        """Log the final state to a JSON file."""
        self.log_states_dict[str(trade_date)] = {
            "company_of_interest": final_state["company_of_interest"],
            "trade_date": final_state["trade_date"],
            "market_report": final_state["market_report"],
            "sentiment_report": final_state["sentiment_report"],
            "news_report": final_state["news_report"],
            "fundamentals_report": final_state["fundamentals_report"],
            "investment_debate_state": {
                "bull_history": final_state["investment_debate_state"]["bull_history"],
                "bear_history": final_state["investment_debate_state"]["bear_history"],
                "history": final_state["investment_debate_state"]["history"],
                "current_response": final_state["investment_debate_state"][
                    "current_response"
                ],
                "judge_decision": final_state["investment_debate_state"][
                    "judge_decision"
                ],
            },
            "trader_investment_decision": final_state["trader_investment_plan"],
            "risk_debate_state": {
                "risky_history": final_state["risk_debate_state"]["risky_history"],
                "safe_history": final_state["risk_debate_state"]["safe_history"],
                "neutral_history": final_state["risk_debate_state"]["neutral_history"],
                "history": final_state["risk_debate_state"]["history"],
                "judge_decision": final_state["risk_debate_state"]["judge_decision"],
            },
            "investment_plan": final_state["investment_plan"],
            "final_trade_decision": final_state["final_trade_decision"],
        }

        # Save to file
        directory = Path(f"eval_results/{self.ticker}/TradingAgentsStrategy_logs/")
        directory.mkdir(parents=True, exist_ok=True)

        with open(
            f"eval_results/{self.ticker}/TradingAgentsStrategy_logs/full_states_log_{trade_date}.json",
            "w",
        ) as f:
            json.dump(self.log_states_dict, f, indent=4)

    def reflect_and_remember(self, returns_losses):
        """Reflect on decisions and update memory based on returns."""
        self.reflector.reflect_bull_researcher(
            self.curr_state, returns_losses, self.bull_memory
        )
        self.reflector.reflect_bear_researcher(
            self.curr_state, returns_losses, self.bear_memory
        )
        self.reflector.reflect_trader(
            self.curr_state, returns_losses, self.trader_memory
        )
        self.reflector.reflect_invest_judge(
            self.curr_state, returns_losses, self.invest_judge_memory
        )
        self.reflector.reflect_risk_manager(
            self.curr_state, returns_losses, self.risk_manager_memory
        )

    def process_signal(self, full_signal):
        """Process a signal to extract the core decision."""
        return self.signal_processor.process_signal(full_signal)
