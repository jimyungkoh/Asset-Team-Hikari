# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

def test_get_news_gemini_web_summarizes(monkeypatch):
    import tradingagents.dataflows.gemini_browse as gb

    called = {}

    def fake_generate(prompt: str, model: str) -> str:
        called["prompt"] = prompt
        called["model"] = model
        return "GROUND:NEWS"

    monkeypatch.setattr(gb, "_generate_with_grounding", fake_generate)

    res = gb.get_news_gemini_web("AAPL", "2024-01-01", "2024-01-05")
    assert res == "GROUND:NEWS"
    assert "AAPL" in called["prompt"]


def test_get_global_news_gemini_web_empty_when_no_news(monkeypatch):
    import tradingagents.dataflows.gemini_browse as gb

    monkeypatch.setattr(gb, "_generate_with_grounding", lambda p, m: "")
    res = gb.get_global_news_gemini_web("2024-01-05", 7, 5)
    assert res == ""


def test_get_news_gemini_web_invalid_dates(monkeypatch):
    import tradingagents.dataflows.gemini_browse as gb

    res = gb.get_news_gemini_web("AAPL", "2024-02-01", "2024-01-01")
    assert res == ""

