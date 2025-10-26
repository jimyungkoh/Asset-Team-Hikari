"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-26
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
from typing import Any, Callable, Dict, Optional, List

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

            final_state, decision = graph.propagate(ticker, trade_date)
        finally:
            if graph is not None:
                graph.cleanup()

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
