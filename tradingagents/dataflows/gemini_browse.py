# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

import os
from datetime import datetime
from typing import Annotated

from langchain_google_genai import ChatGoogleGenerativeAI

from .google import get_google_news


def _summarize_with_gemini(model_name: str, content: str) -> str:
    """Summarize provided content using Gemini if GOOGLE_API_KEY is configured.

    Falls back to the original content if the key is missing or invocation fails.
    """
    try:
        if not os.getenv("GOOGLE_API_KEY"):
            return content
        chat = ChatGoogleGenerativeAI(model=model_name)
        prompt = (
            "You are a financial news analyst. Summarize the following news snippets into"
            " a concise, source-aware report with bullet points, keeping dates and titles when available."
            " Avoid speculation and do not fabricate sources."
        )
        response = chat.invoke(
            f"{prompt}\n\n=== NEWS SNIPPETS START ===\n{content}\n=== NEWS SNIPPETS END ==="
        )
        # LangChain message objects expose .content
        return getattr(response, "content", str(response))
    except Exception:
        return content


def get_news_gemini_web(
    ticker: Annotated[str, "Ticker symbol"],
    start_date: Annotated[str, "Start date in yyyy-mm-dd format"],
    end_date: Annotated[str, "End date in yyyy-mm-dd format"],
) -> str:
    """Retrieve company news using Google News, then summarize with Gemini.

    This avoids OpenAI web_search tools and leverages Gemini for summarization only.
    """
    # Compute look-back window in days
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        # Invalid date format; return empty result
        return ""

    look_back_days = max((end_dt - start_dt).days, 1)

    news_raw = get_google_news(ticker, end_date, look_back_days)
    if not news_raw:
        return ""

    model = os.getenv("GEMINI_WEB_MODEL", "gemini-2.0-flash")
    summarized = _summarize_with_gemini(model, news_raw)
    return summarized


def get_global_news_gemini_web(
    curr_date: Annotated[str, "Current date in yyyy-mm-dd format"],
    look_back_days: Annotated[int, "Number of days to look back"] = 7,
    limit: Annotated[int, "Maximum number of articles to return"] = 5,
) -> str:
    """Retrieve global/macroeconomic news via Google News, then summarize with Gemini.

    The `limit` parameter is advisory; Google News utility may not honor it strictly.
    """
    query = "global OR macroeconomics OR markets OR stocks"
    news_raw = get_google_news(query, curr_date, look_back_days)
    if not news_raw:
        return ""

    model = os.getenv("GEMINI_WEB_MODEL", "gemini-2.0-flash")
    summarized = _summarize_with_gemini(model, news_raw)
    return summarized


