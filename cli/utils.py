"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-19
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import questionary
from rich.console import Console

from cli.models import AnalystType

try:
    import tomllib

    TOMLDecodeError = tomllib.TOMLDecodeError
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib  # type: ignore
    from tomli import TOMLDecodeError  # type: ignore

console = Console()

ANALYST_ORDER: List[Tuple[str, AnalystType]] = [
    ("Market Analyst", AnalystType.MARKET),
    ("Social Media Analyst", AnalystType.SOCIAL),
    ("News Analyst", AnalystType.NEWS),
    ("Fundamentals Analyst", AnalystType.FUNDAMENTALS),
]

OPENROUTER_CONFIG_PATH = Path(__file__).with_name("openrouter_llm.toml")
FALLBACK_OPENROUTER_SHALLOW: List[Tuple[str, str]] = [
    ("Meta: Llama 4 Scout", "meta-llama/llama-4-scout:free"),
    (
        "Meta: Llama 3.3 8B Instruct - A lightweight and ultra-fast variant of Llama 3.3 70B",
        "meta-llama/llama-3.3-8b-instruct:free",
    ),
    (
        "google/gemini-2.0-flash-exp:free - Gemini Flash 2.0 offers a significantly faster time to first token",
        "google/gemini-2.0-flash-exp:free",
    ),
]
FALLBACK_OPENROUTER_DEEP: List[Tuple[str, str]] = [
    ("DeepSeek V3 - a 685B-parameter, mixture-of-experts model", "deepseek/deepseek-chat-v3-0324:free"),
    (
        "Deepseek - latest iteration of the flagship chat model family from the DeepSeek team.",
        "deepseek/deepseek-chat-v3-0324:free",
    ),
]


@lru_cache(maxsize=1)
def load_openrouter_llm_config() -> Dict[str, Any]:
    """Load OpenRouter-specific configuration from TOML."""
    if not OPENROUTER_CONFIG_PATH.exists():
        raise FileNotFoundError(OPENROUTER_CONFIG_PATH)

    try:
        with OPENROUTER_CONFIG_PATH.open("rb") as fh:
            return tomllib.load(fh)
    except (OSError, TOMLDecodeError) as exc:  # pragma: no cover - IO or parse errors
        raise RuntimeError(f"Failed to load OpenRouter config: {exc}") from exc


def _build_choices(items: List[Tuple[str, str]]) -> Tuple[List[questionary.Choice], Optional[str]]:
    choices = [questionary.Choice(label, value=value) for label, value in items]
    default_value = items[0][1] if items else None
    return choices, default_value


def _resolve_openrouter_model_options(section: str) -> Tuple[List[questionary.Choice], Optional[str]]:
    """Build Questionary choices for OpenRouter models, with fallback warnings."""
    fallback_items = FALLBACK_OPENROUTER_SHALLOW if section == "quick_thinking" else FALLBACK_OPENROUTER_DEEP

    try:
        data = load_openrouter_llm_config()
        entries = data.get(section, [])
        prepared: List[Tuple[str, str]] = []
        default_value: Optional[str] = None
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            label = entry.get("label")
            value = entry.get("value")
            if label and value:
                prepared.append((label, value))
                if entry.get("default") and not default_value:
                    default_value = value
        if not prepared:
            raise ValueError(f"OpenRouter config contains no entries for section '{section}'.")
        choices = [questionary.Choice(label, value=value) for label, value in prepared]
        if default_value is None:
            default_value = prepared[0][1]
        return choices, default_value
    except (FileNotFoundError, RuntimeError, ValueError) as exc:
        console.print(
            f"[yellow]Warning:[/] Falling back to built-in OpenRouter {section.replace('_', ' ')} options. Reason: {exc}"
        )
        return _build_choices(fallback_items)


def get_openrouter_provider_metadata() -> Dict[str, Any]:
    """Return OpenRouter provider metadata with sensible fallbacks."""
    try:
        data = load_openrouter_llm_config()
        provider = data.get("provider", {})
    except (FileNotFoundError, RuntimeError):
        provider = {}

    display = provider.get("display_name", "OpenRouter")
    identifier = provider.get("identifier", "openrouter").lower()
    backend_url = provider.get("backend_url", "https://openrouter.ai/api/v1")

    allowed_settings = {
        "enable_thinking_mode",
        "default_thinking_effort",
        "thinking_effort_deep",
        "thinking_effort_quick",
    }
    settings = {key: provider[key] for key in allowed_settings if key in provider}

    # If config toggles Gemini browsing support, propagate flag
    if provider.get("use_gemini_browse_for_news") is not None:
        settings["use_gemini_browse_for_news"] = provider["use_gemini_browse_for_news"]

    return {
        "display": display,
        "identifier": identifier,
        "url": backend_url,
        "settings": settings,
    }


def select_analysts() -> List[AnalystType]:
    """Select analysts using an interactive checkbox UI."""
    choices = questionary.checkbox(
        "Select Your [Analysts Team]:",
        choices=[questionary.Choice(display, value=value) for display, value in ANALYST_ORDER],
        instruction="\n- Press Space to select/unselect analysts\n- Press 'a' to select/unselect all\n- Press Enter when done",
        validate=lambda x: len(x) > 0 or "You must select at least one analyst.",
        style=questionary.Style(
            [
                ("checkbox-selected", "fg:ansibrightcyan"),
                ("selected", "fg:ansibrightcyan noinherit"),
                ("highlighted", "noinherit"),
                ("pointer", "noinherit"),
            ]
        ),
    ).ask()

    if not choices:
        console.print("\n[red]No analysts selected. Exiting...[/red]")
        raise SystemExit(1)

    return list(choices)


def select_research_depth() -> int:
    """Prompt for research depth level."""
    depth_options: List[Tuple[str, int]] = [
        ("Shallow - Quick research, few debate and strategy discussion rounds", 1),
        ("Medium - Middle ground, moderate debate rounds and strategy discussion", 3),
        ("Deep - Comprehensive research, in depth debate and strategy discussion", 5),
    ]

    choice = questionary.select(
        "Select Your [Research Depth]:",
        choices=[questionary.Choice(display, value=value) for display, value in depth_options],
        instruction="\n- Use arrow keys to navigate\n- Press Enter to select",
        style=questionary.Style(
            [
                ("selected", "fg:ansibrightmagenta noinherit"),
                ("highlighted", "fg:ansibrightmagenta noinherit"),
                ("pointer", "fg:ansibrightmagenta noinherit"),
            ]
        ),
    ).ask()

    if choice is None:
        console.print("\n[red]No research depth selected. Exiting...[/red]")
        raise SystemExit(1)

    return int(choice)


def select_llm_provider() -> Dict[str, Any]:
    """Select LLM provider and return a structured provider descriptor."""
    openrouter_meta = get_openrouter_provider_metadata()
    providers: List[Dict[str, Any]] = [
        {
            "identifier": "openai",
            "display": "OpenAI (Responses API)",
            "url": "https://api.openai.com/v1",
            "settings": {},
        },
        {
            "identifier": openrouter_meta["identifier"],
            "display": openrouter_meta["display"],
            "url": openrouter_meta["url"],
            "settings": openrouter_meta.get("settings", {}),
        },
        {
            "identifier": "local",
            "display": "Local (Ollama-compatible)",
            "url": "http://localhost:11434/v1",
            "settings": {},
        },
    ]

    provider_map = {p["identifier"]: p for p in providers}
    default_provider = os.getenv("TRADINGAGENTS_LLM_PROVIDER", "openai").lower()
    default_value = provider_map.get(default_provider, providers[0])

    selection = questionary.select(
        "Select your LLM Provider:",
        choices=[questionary.Choice(p["display"], value=p) for p in providers],
        instruction="\n- Use arrow keys to navigate\n- Press Enter to select",
        style=questionary.Style(
            [
                ("selected", "fg:ansibrightmagenta noinherit"),
                ("highlighted", "fg:ansibrightmagenta noinherit"),
                ("pointer", "fg:ansibrightmagenta noinherit"),
            ]
        ),
        default=default_value,
    ).ask()

    if selection is None:
        console.print("\n[red]No LLM provider selected. Exiting...[/red]")
        raise SystemExit(1)

    return selection


def _provider_model_choices(provider: str) -> Dict[str, Tuple[List[questionary.Choice], Optional[str]]]:
    provider_key = (provider or "").lower()
    if provider_key == "openai":
        shallow = _build_choices([
            ("GPT-4o-mini", "gpt-4o-mini"),
            ("GPT-4.1-mini", "gpt-4.1-mini"),
            ("o4-mini", "o4-mini"),
        ])
        deep = _build_choices([
            ("o4-mini", "o4-mini"),
            ("GPT-4o", "gpt-4o"),
            ("o3", "o3"),
        ])
        return {"shallow": shallow, "deep": deep}
    if provider_key == "openrouter":
        shallow = _resolve_openrouter_model_options("quick_thinking")
        deep = _resolve_openrouter_model_options("deep_thinking")
        return {"shallow": shallow, "deep": deep}
    if provider_key in {"local", "ollama"}:
        shallow = _build_choices([
            ("llama3.1 (8B)", "llama3.1"),
            ("qwen2.5 (7B)", "qwen2.5:7b"),
            ("mistral (7B)", "mistral:7b-instruct"),
        ])
        deep = _build_choices([
            ("llama3.1 (70B)", "llama3.1:70b"),
            ("mixtral (8x7B)", "mixtral:8x7b"),
            ("qwen2.5 (14B)", "qwen2.5:14b"),
        ])
        return {"shallow": shallow, "deep": deep}
    raise ValueError(f"Unsupported provider '{provider}'.")


def select_shallow_thinking_agent(provider: str) -> str:
    """Select a shallow/fast thinking model for the given provider."""
    model_bundle = _provider_model_choices(provider)
    choices, default_value = model_bundle["shallow"]
    choice = questionary.select(
        "Select Your [Quick-Thinking LLM Engine]:",
        choices=choices,
        instruction="\n- Use arrow keys to navigate\n- Press Enter to select",
        style=questionary.Style(
            [
                ("selected", "fg:ansibrightcyan noinherit"),
                ("highlighted", "fg:ansibrightcyan noinherit"),
                ("pointer", "fg:ansibrightcyan noinherit"),
            ]
        ),
        default=default_value,
    ).ask()
    if choice is None:
        console.print("\n[red]No shallow model selected. Exiting...[/red]")
        raise SystemExit(1)
    return str(choice)


def select_deep_thinking_agent(provider: str) -> str:
    """Select a deep/reflective thinking model for the given provider."""
    model_bundle = _provider_model_choices(provider)
    choices, default_value = model_bundle["deep"]
    choice = questionary.select(
        "Select Your [Deep-Thinking LLM Engine]:",
        choices=choices,
        instruction="\n- Use arrow keys to navigate\n- Press Enter to select",
        style=questionary.Style(
            [
                ("selected", "fg:ansibrightmagenta noinherit"),
                ("highlighted", "fg:ansibrightmagenta noinherit"),
                ("pointer", "fg:ansibrightmagenta noinherit"),
            ]
        ),
        default=default_value,
    ).ask()
    if choice is None:
        console.print("\n[red]No deep model selected. Exiting...[/red]")
        raise SystemExit(1)
    return str(choice)
