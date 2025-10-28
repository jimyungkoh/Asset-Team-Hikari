"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-29
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
import argparse
import json
import sys
import time
import traceback
from dataclasses import asdict, is_dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Dict, Optional, List, Tuple

from dotenv import load_dotenv

from tradingagents.default_config import DEFAULT_CONFIG
from tradingagents.graph.trading_graph import TradingAgentsGraph


def _emit(event: str, **payload: Any) -> None:
    """Print a JSON line formatted event to stdout."""
    record = {"event": event, **payload}
    sys.stdout.write(json.dumps(record, ensure_ascii=True) + "\n")
    sys.stdout.flush()


def _parse_args() -> argparse.Namespace:
    """Parse command line arguments for the runner."""
    parser = argparse.ArgumentParser(
        description="Run the TradingAgents graph and stream JSONL progress events."
    )
    parser.add_argument("--ticker", required=True, help="Ticker symbol to analyze.")
    parser.add_argument(
        "--date",
        required=True,
        help="Trading date in YYYY-MM-DD format to evaluate the ticker.",
    )
    parser.add_argument(
        "--config",
        help="Optional JSON string containing configuration overrides.",
    )
    parser.add_argument(
        "--config-file",
        help="Optional path to a JSON file with configuration overrides.",
    )
    parser.add_argument(
        "--result-path",
        help="Optional file path to persist the final result payload as JSON.",
    )
    return parser.parse_args()


def _load_config(
    config_json: Optional[str],
    config_path: Optional[str],
    config_overrides: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Hydrate configuration overrides while keeping defaults intact."""
    config: Dict[str, Any] = DEFAULT_CONFIG.copy()

    overrides: Dict[str, Any] = {}
    if config_path:
        file_path = Path(config_path).expanduser().resolve()
        with file_path.open("r", encoding="utf-8") as handle:
            file_overrides = json.load(handle)
        overrides.update(file_overrides)

    if config_json:
        overrides.update(json.loads(config_json))

    if config_overrides:
        overrides.update(config_overrides)

    if overrides:
        config.update(overrides)

    return config


def _to_serializable(value: Any) -> Any:
    """Best-effort serialization helper for dataclasses and complex types."""
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, dict):
        return {str(key): _to_serializable(val) for key, val in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [_to_serializable(item) for item in value]
    if is_dataclass(value):
        return _to_serializable(asdict(value))
    return str(value)


def _stringify_content(content: Any, *, separator: str = "\n\n") -> str:
    """Convert mixed structured content into a printable string."""
    if content is None:
        return ""

    if isinstance(content, str):
        return content

    if isinstance(content, (int, float, bool)):
        return str(content)

    if isinstance(content, dict):
        if "text" in content:
            return _stringify_content(content["text"], separator=separator)
        if "content" in content:
            return _stringify_content(content["content"], separator=separator)
        return json.dumps(content, ensure_ascii=False)

    if isinstance(content, (list, tuple, set)):
        parts: List[str] = []
        for item in content:
            normalized = _stringify_content(item, separator=separator)
            if normalized:
                parts.append(normalized)
        return separator.join(parts)

    return str(content)


_REPORT_SECTIONS: Tuple[str, ...] = (
    "market_report",
    "sentiment_report",
    "news_report",
    "fundamentals_report",
    "investment_plan",
    "trader_investment_plan",
    "final_trade_decision",
)


class _StreamAggregator:
    """Aggregate streaming updates for SSE consumers."""

    def __init__(self) -> None:
        self.reports: Dict[str, str] = {}
        self.messages: List[Dict[str, Any]] = []
        self.latest_state: Optional[Dict[str, Any]] = None
        self._last_message_signature: Optional[Tuple[str, str]] = None
        self._last_invest_state: Optional[str] = None
        self._last_risk_state: Optional[str] = None

    def process_chunk(self, chunk: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process a graph chunk and return a payload for emission if changed."""
        self.latest_state = chunk
        payload: Dict[str, Any] = {}

        message_info = self._extract_message(chunk)
        if message_info is not None:
            payload["message"] = message_info
            self.messages.append(message_info)

        report_updates = self._extract_reports(chunk)
        if report_updates:
            payload["reports"] = report_updates

        invest_state = chunk.get("investment_debate_state")
        if isinstance(invest_state, dict):
            serializable = _to_serializable(invest_state)
            digest = json.dumps(serializable, sort_keys=True)
            if digest != self._last_invest_state:
                payload["investment_debate_state"] = serializable
                self._last_invest_state = digest

        risk_state = chunk.get("risk_debate_state")
        if isinstance(risk_state, dict):
            serializable = _to_serializable(risk_state)
            digest = json.dumps(serializable, sort_keys=True)
            if digest != self._last_risk_state:
                payload["risk_debate_state"] = serializable
                self._last_risk_state = digest

        return payload or None

    def _extract_message(self, chunk: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        messages = chunk.get("messages")
        if not isinstance(messages, list) or not messages:
            return None

        last_message = messages[-1]
        content = _stringify_content(getattr(last_message, "content", last_message)).strip()
        if not content:
            return None

        role = getattr(last_message, "type", None)
        sender = getattr(last_message, "name", None) or getattr(last_message, "sender", None)
        signature = (role or "", content)
        if signature == self._last_message_signature:
            return None

        self._last_message_signature = signature

        tool_calls_payload: List[Dict[str, Any]] = []
        tool_calls = getattr(last_message, "tool_calls", None)
        if isinstance(tool_calls, list):
            for call in tool_calls:
                if isinstance(call, dict):
                    name = str(call.get("name", ""))
                    args = _to_serializable(call.get("args"))
                else:
                    name = str(getattr(call, "name", "") or getattr(call, "id", ""))
                    args = _to_serializable(getattr(call, "args", None))
                tool_calls_payload.append({"name": name, "args": args})

        message_payload: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "content": content,
        }
        if sender:
            message_payload["sender"] = sender
        if role:
            message_payload["role"] = role
        if tool_calls_payload:
            message_payload["tool_calls"] = tool_calls_payload

        return message_payload

    def _extract_reports(self, chunk: Dict[str, Any]) -> Dict[str, str]:
        updates: Dict[str, str] = {}
        for section in _REPORT_SECTIONS:
            if section not in chunk:
                continue
            normalized = _stringify_content(chunk.get(section)).strip()
            if not normalized:
                continue
            if self.reports.get(section) == normalized:
                continue
            self.reports[section] = normalized
            updates[section] = normalized
        return updates


def _build_result_payload(
    args: argparse.Namespace,
    final_state: Dict[str, Any],
    decision: Any,
    started_ts: float,
    duration_seconds: float,
    config: Dict[str, Any],
) -> Dict[str, Any]:
    """Compose the final result payload for downstream consumers."""
    log_file = (
        Path("eval_results")
        / args.ticker
        / "TradingAgentsStrategy_logs"
        / f"full_states_log_{args.date}.json"
    )

    payload: Dict[str, Any] = {
        "ticker": args.ticker,
        "trade_date": args.date,
        "decision": _to_serializable(decision),
        "final_trade_decision": _to_serializable(final_state.get("final_trade_decision")),
        "investment_plan": _to_serializable(final_state.get("investment_plan")),
        "trader_investment_plan": _to_serializable(final_state.get("trader_investment_plan")),
        "reports": {
            "market": _to_serializable(final_state.get("market_report")),
            "sentiment": _to_serializable(final_state.get("sentiment_report")),
            "news": _to_serializable(final_state.get("news_report")),
            "fundamentals": _to_serializable(final_state.get("fundamentals_report")),
        },
        "states": {
            "investment_debate": _to_serializable(final_state.get("investment_debate_state")),
            "risk_debate": _to_serializable(final_state.get("risk_debate_state")),
        },
        "log_path": str(log_file.resolve()),
        "project_dir": str(Path(config.get("project_dir", ".")).resolve()),
        "started_at": datetime.fromtimestamp(started_ts).isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
    }

    payload["duration_seconds"] = max(0.0, duration_seconds)
    return payload


def run_tradingagents(
    ticker: str,
    trade_date: str,
    *,
    config_overrides: Optional[Dict[str, Any]] = None,
    config_json: Optional[str] = None,
    config_path: Optional[str] = None,
    result_path: Optional[str] = None,
    event_callback: Optional[Callable[..., None]] = None,
) -> Dict[str, Any]:
    """Execute the TradingAgents graph with optional event callback emission."""
    load_dotenv()
    emitter = event_callback or _emit

    start_monotonic = time.perf_counter()
    start_wall_clock = time.time()

    emitter(
        "progress",
        message="Initializing TradingAgentsGraph",
        percent=5,
        ticker=ticker,
        trade_date=trade_date,
    )

    try:
        config = _load_config(
            config_json=config_json,
            config_path=config_path,
            config_overrides=config_overrides,
        )

        selected_analysts_override = config.get("selected_analysts")
        analysts_list: Optional[List[str]] = None
        if isinstance(selected_analysts_override, list):
            typed_values = [value for value in selected_analysts_override if isinstance(value, str)]
            if typed_values:
                analysts_list = typed_values

        graph: Optional[TradingAgentsGraph] = None
        final_state: Optional[Dict[str, Any]] = None
        decision: Any = None
        try:
            if analysts_list:
                graph = TradingAgentsGraph(
                    selected_analysts=analysts_list,
                    debug=False,
                    config=config,
                )
            else:
                graph = TradingAgentsGraph(
                    debug=False,
                    config=config,
                )

            emitter(
                "progress",
                message="Running propagation",
                percent=25,
            )

            aggregator = _StreamAggregator()

            graph.ticker = ticker
            initial_state = graph.propagator.create_initial_state(ticker, trade_date)
            graph_args = graph.propagator.get_graph_args()

            for chunk in graph.graph.stream(initial_state, **graph_args):
                final_state = chunk
                stream_payload = aggregator.process_chunk(chunk)
                if stream_payload:
                    emitter("state", **stream_payload)

            if final_state is None:
                raise RuntimeError("TradingAgents graph produced no state during propagation.")

            graph.curr_state = final_state
            graph._log_state(trade_date, final_state)

            final_trade_decision_raw = final_state.get("final_trade_decision")
            if isinstance(final_trade_decision_raw, str):
                final_trade_decision_text = final_trade_decision_raw.strip()
            else:
                final_trade_decision_text = _stringify_content(final_trade_decision_raw).strip()

            if not final_trade_decision_text:
                raise RuntimeError("TradingAgents graph did not produce a final trade decision.")

            final_state["final_trade_decision"] = final_trade_decision_text
            decision = graph.process_signal(final_trade_decision_text)
        finally:
            if graph is not None:
                graph.cleanup()

        if final_state is None or decision is None:
            raise RuntimeError("TradingAgents graph did not complete successfully.")

        emitter(
            "progress",
            message="Processing results",
            percent=80,
        )

        result_payload = _build_result_payload(
            args=argparse.Namespace(
                ticker=ticker,
                date=trade_date,
            ),
            final_state=final_state,
            decision=decision,
            started_ts=start_wall_clock,
            duration_seconds=time.perf_counter() - start_monotonic,
            config=config,
        )

        if result_path:
            output_path = Path(result_path).expanduser().resolve()
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with output_path.open("w", encoding="utf-8") as handle:
                json.dump(result_payload, handle, indent=2)

        emitter(
            "complete",
            status="success",
            result=result_payload,
        )
        return result_payload

    except Exception as exc:  # noqa: BLE001
        emitter(
            "error",
            status="failed",
            message=str(exc),
            traceback=traceback.format_exc(),
        )
        raise


def main() -> int:
    """Entry point for the TradingAgents JSONL runner."""
    args = _parse_args()
    try:
        run_tradingagents(
            ticker=args.ticker,
            trade_date=args.date,
            config_overrides=None,
            config_json=args.config,
            config_path=args.config_file,
            result_path=args.result_path,
            event_callback=_emit,
        )
        return 0
    except Exception:  # noqa: BLE001
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
