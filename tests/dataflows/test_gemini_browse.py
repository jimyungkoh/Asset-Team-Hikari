# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

import importlib
import types


def test_get_news_gemini_web_summarizes(monkeypatch):
    import tradingagents.dataflows.gemini_browse as gb

    # Stub google news fetcher
    monkeypatch.setattr(gb, "get_google_news", lambda q, d, n: "RAW_NEWS")
    # Stub summarizer
    monkeypatch.setattr(gb, "_summarize_with_gemini", lambda m, c: f"SUM:{c}")

    res = gb.get_news_gemini_web("AAPL", "2024-01-01", "2024-01-05")
    assert res == "SUM:RAW_NEWS"


def test_get_global_news_gemini_web_empty_when_no_news(monkeypatch):
    import tradingagents.dataflows.gemini_browse as gb

    # No news case
    monkeypatch.setattr(gb, "get_google_news", lambda q, d, n: "")
    res = gb.get_global_news_gemini_web("2024-01-05", 7, 5)
    assert res == ""


