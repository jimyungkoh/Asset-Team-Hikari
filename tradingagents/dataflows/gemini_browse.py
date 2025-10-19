# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

import os
from datetime import datetime
from typing import Annotated, Any, Callable, Dict, List

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover - handled gracefully at runtime
    genai = None
    types = None


def _response_as_dict(response: Any) -> Dict[str, Any]:
    """Best-effort conversion of Gemini response objects into dict form."""
    for attr in ("to_dict", "model_dump"):
        if hasattr(response, attr):
            method: Callable[[], Dict[str, Any]] = getattr(response, attr)
            try:
                return method()
            except Exception:
                continue
    return {}


def _extract_citations(response: Any) -> List[str]:
    """Pull citation information from Gemini grounding metadata when available."""
    payload = _response_as_dict(response)
    candidates = payload.get("candidates") or []
    citations: List[str] = []

    for candidate in candidates:
        metadata = candidate.get("grounding_metadata") or {}
        supports = metadata.get("grounding_supports") or []
        for support in supports:
            chunk = support.get("grounding_chunk") or {}
            web_source = chunk.get("web") or {}
            uri = web_source.get("uri")
            title = web_source.get("title") or ""
            if uri:
                display = title or uri
                citations.append(f"{display} - {uri}")
    return citations


def _format_grounded_output(response: Any) -> str:
    """Compose the final text response including optional citations."""
    text = getattr(response, "text", "") or ""
    text = text.strip()

    if not text:
        payload = _response_as_dict(response)
        candidates = payload.get("candidates") or []
        for candidate in candidates:
            content = candidate.get("content") or {}
            parts = content.get("parts") or []
            for part in parts:
                candidate_text = part.get("text")
                if candidate_text:
                    text += candidate_text.strip() + "\n"
        text = text.strip()

    citations = _extract_citations(response)
    if citations:
        sources_section = "\n".join(f"- {item}" for item in citations)
        if text:
            text = f"{text}\n\nSources:\n{sources_section}"
        else:
            text = f"Sources:\n{sources_section}"

    return text


def _generate_with_grounding(prompt: str, model_name: str) -> str:
    """Invoke Gemini with Google Search grounding."""
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key or genai is None or types is None:
        return ""

    try:
        client = genai.Client(api_key=api_key)
        grounding_tool = types.Tool(google_search=types.GoogleSearch())
        config = types.GenerateContentConfig(
            tools=[grounding_tool],
        )
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )
    except Exception:
        return ""

    formatted = _format_grounded_output(response)
    return formatted.strip()


def get_news_gemini_web(
    ticker: Annotated[str, "Ticker symbol"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"],
) -> str:
    """Retrieve company news using Gemini Google Search grounding."""
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        # Invalid date format; return empty result
        return ""

    if start_dt > end_dt:
        return ""

    prompt = (
        f"You are a financial research assistant. Retrieve and summarize key financial news for {ticker} "
        f"between {start_date} and {end_date}. Include precise dates and cite each source."
    )
    model = os.getenv("GEMINI_WEB_MODEL", "gemini-2.5-flash")
    grounded = _generate_with_grounding(prompt, model)
    return grounded


def get_global_news_gemini_web(
    curr_date: Annotated[str, "Current date in yyyy-mm-dd format"],
    look_back_days: Annotated[int, "Number of days to look back"] = 7,
    limit: Annotated[int, "Maximum number of articles to return"] = 5,
) -> str:
    """Retrieve global news using Gemini Google Search grounding.

    The `limit` parameter is retained for backward compatibility with existing call sites.
    """
    prompt = (
        "You are a macroeconomic analyst. Provide a concise, source-linked digest of major global market, "
        f"economy, and policy developments from the past {look_back_days} days leading up to {curr_date}. "
        "Group related items together and cite each source."
    )
    _ = limit  # Retained parameter for API compatibility

    model = os.getenv("GEMINI_WEB_MODEL", "gemini-2.5-flash")
    grounded = _generate_with_grounding(prompt, model)
    return grounded
