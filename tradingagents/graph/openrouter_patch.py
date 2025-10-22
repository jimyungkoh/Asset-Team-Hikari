"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-22
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
from __future__ import annotations

from typing import Any, Dict, Iterable, List

from langchain_openai.chat_models import base as openai_base


def _stringify_tool_output(output: Any) -> str:
    if isinstance(output, str):
        return output
    if isinstance(output, list):
        parts: List[str] = []
        for block in output:
            if isinstance(block, dict):
                for key in ("text", "output_text", "content", "data"):
                    value = block.get(key)
                    if isinstance(value, str) and value.strip():
                        parts.append(value.strip())
                        break
        if parts:
            return "\n".join(parts)
    return str(output)


def _transform_function_call_output(items: Iterable[Dict[str, Any]]) -> List[Dict[str, Any]]:
    transformed: List[Dict[str, Any]] = []
    for idx, item in enumerate(items):
        if isinstance(item, dict) and item.get("type") == "function_call_output":
            call_id = item.get("call_id") or f"tool-output-{idx}"
            output_text = _stringify_tool_output(item.get("output"))
            transformed.append(
                {
                    "type": "message",
                    "role": "developer",
                    "id": f"{call_id}-message",
                    "status": "completed",
                    "content": [
                        {
                            "type": "input_text",
                            "text": output_text,
                        }
                    ],
                }
            )
        else:
            transformed.append(item)
    return transformed


def apply_openrouter_responses_patch() -> None:
    """Patch LangChain's Responses API payload builder for OpenRouter compatibility."""
    if getattr(openai_base, "_openrouter_patch_applied", False):
        return

    original_construct = openai_base._construct_responses_api_input

    def _patched_construct(messages: Iterable[Any]) -> List[Dict[str, Any]]:
        items = original_construct(messages)
        return _transform_function_call_output(items)

    openai_base._construct_responses_api_input = _patched_construct  # type: ignore[assignment]
    openai_base._openrouter_patch_applied = True

