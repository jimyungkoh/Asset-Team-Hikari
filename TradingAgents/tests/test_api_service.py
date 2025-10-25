# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-25
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

import importlib
import os
import time
from typing import Any, Dict, Optional

from fastapi.testclient import TestClient

api_app_module = importlib.import_module("tradingagents.api.app")
from tradingagents.api.app import app


def _fake_run_tradingagents(
    ticker: str,
    trade_date: str,
    *,
    config_overrides: Optional[Dict[str, Any]] = None,
    config_json: Optional[str] = None,
    config_path: Optional[str] = None,
    result_path: Optional[str] = None,
    event_callback: Optional[Any] = None,
) -> Dict[str, Any]:
    """Deterministic stand-in for the heavy TradingAgents pipeline."""
    payload = {
        "ticker": ticker,
        "trade_date": trade_date,
        "config_overrides": config_overrides,
        "config_json": config_json,
        "config_path": config_path,
        "result_path": result_path,
    }
    if event_callback is not None:
        event_callback("progress", message="stubbed progress update", percent=10)
        event_callback("complete", status="success", result=payload)
    return payload


def test_create_run_and_poll_success(monkeypatch) -> None:
    """Runs endpoint schedules a job and surfaces the completion payload."""
    # Ensure we reload settings and start with a clean slate.
    api_app_module.get_settings.cache_clear()
    api_app_module._runs.clear()  # type: ignore[attr-defined]

    os.environ["SKIP_TOKEN_AUTH"] = "true"
    os.environ.pop("INTERNAL_API_TOKEN", None)

    monkeypatch.setattr(api_app_module, "run_tradingagents", _fake_run_tradingagents)

    with TestClient(app) as client:
        response = client.post(
            "/runs",
            json={
                "ticker": "NVDA",
                "trade_date": "2024-01-01",
                "config": {"foo": "bar"},
            },
        )
        assert response.status_code == 200
        run_id = response.json()["id"]

        # Poll for completion; the stub completes almost immediately.
        final_state: Dict[str, Any] = {}
        for _ in range(20):
            poll_response = client.get(f"/runs/{run_id}")
            assert poll_response.status_code == 200
            final_state = poll_response.json()
            if final_state["status"] == "success":
                break
            time.sleep(0.05)

        assert final_state["status"] == "success"
        assert final_state["result"]["ticker"] == "NVDA"
        assert any(event["event"] == "progress" for event in final_state["events"])
