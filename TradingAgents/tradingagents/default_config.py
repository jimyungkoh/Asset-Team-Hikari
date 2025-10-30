"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
import os

DEFAULT_CONFIG = {
    "project_dir": os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
    "results_dir": os.getenv("TRADINGAGENTS_RESULTS_DIR", "./results"),
    "data_dir": "/Users/yluo/Documents/Code/ScAI/FR1-data",
    "data_cache_dir": os.path.join(
        os.path.abspath(os.path.join(os.path.dirname(__file__), ".")),
        "dataflows/data_cache",
    ),
    # LLM settings
    "llm_provider": os.getenv("TRADINGAGENTS_LLM_PROVIDER", "openai"),
    "deep_think_llm": os.getenv("TRADINGAGENTS_DEEP_THINK_LLM", "o4-mini"),
    "quick_think_llm": os.getenv("TRADINGAGENTS_QUICK_THINK_LLM", "gpt-4o-mini"),
    "backend_url": os.getenv("TRADINGAGENTS_BACKEND_URL", "https://api.openai.com/v1"),
    # Reasoning / Thinking mode (primarily for OpenRouter)
    "enable_thinking_mode": os.getenv("TRADINGAGENTS_THINKING_MODE", "false").lower() in ("1", "true", "yes", "on"),
    "thinking_effort": os.getenv("TRADINGAGENTS_THINKING_EFFORT", "medium"),
    "thinking_effort_deep": os.getenv("TRADINGAGENTS_THINKING_EFFORT_DEEP", os.getenv("TRADINGAGENTS_THINKING_EFFORT", "medium")),
    "thinking_effort_quick": os.getenv("TRADINGAGENTS_THINKING_EFFORT_QUICK", os.getenv("TRADINGAGENTS_THINKING_EFFORT", "medium")),
    # Debate and discussion settings
    "max_debate_rounds": 1,
    "max_risk_discuss_rounds": 1,
    "max_recur_limit": 100,
    # Data vendor configuration
    # Category-level configuration (default for all tools in category)
    "data_vendors": {
        "core_stock_apis": "yfinance",       # Options: yfinance, alpha_vantage, local
        "technical_indicators": "yfinance",  # Options: yfinance, alpha_vantage, local
        "fundamental_data": "alpha_vantage", # Options: openai, alpha_vantage, local
        "news_data": "alpha_vantage,gemini", # Options: openai, alpha_vantage, google, gemini, local
    },
    # Tool-level configuration (takes precedence over category-level)
    "tool_vendors": {
        # Example: "get_stock_data": "alpha_vantage",  # Override category default
        # Example: "get_news": "openai",               # Override category default
    },
}
