"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-23
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
from __future__ import annotations

from typing import Any, Dict, Iterable, List, Sequence

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


def _extract_text_blocks(blocks: Any) -> str:
    if isinstance(blocks, str):
        return blocks
    if isinstance(blocks, Sequence):
        parts: List[str] = []
        for block in blocks:
            if isinstance(block, dict):
                for key in ("text", "output_text", "content", "data"):
                    value = block.get(key)
                    if isinstance(value, str) and value.strip():
                        parts.append(value.strip())
                        break
            elif isinstance(block, str) and block.strip():
                parts.append(block.strip())
        if parts:
            return "\n".join(parts)
    return str(blocks)


def _collapse_items_to_string(items: Iterable[Dict[str, Any]]) -> str:
    lines: List[str] = []
    for item in items:
        if not isinstance(item, dict):
            lines.append(str(item))
            continue

        item_type = item.get("type")

        if item_type == "message":
            role = item.get("role", "assistant")
            content = _extract_text_blocks(item.get("content", ""))
            status = item.get("status")
            if status and status not in {"completed"}:
                lines.append(f"{role.upper()} ({status}): {content}")
            else:
                lines.append(f"{role.upper()}: {content}")
        elif item_type == "reasoning":
            summary = _extract_text_blocks(item.get("content", ""))
            lines.append(f"REASONING: {summary}")
        elif item_type == "function_call":
            name = item.get("name", "unknown_function")
            args = item.get("arguments", "")
            lines.append(f"FUNCTION_CALL {name}({args})")
        elif item_type == "function_call_output":
            output = _stringify_tool_output(item.get("output"))
            lines.append(f"FUNCTION_RESULT: {output}")
        else:
            lines.append(str(item))

    return "\n\n".join(line for line in lines if line.strip())


def apply_openrouter_responses_patch() -> None:
    """Patch LangChain's Responses API payload builder for OpenRouter compatibility."""
    if getattr(openai_base, "_openrouter_patch_applied", False):
        return

    original_construct = openai_base._construct_responses_api_input

    def _patched_construct(messages: Iterable[Any]) -> str:
        items = original_construct(messages)
        normalized = _transform_function_call_output(items)
        return _collapse_items_to_string(normalized)

    openai_base._construct_responses_api_input = _patched_construct  # type: ignore[assignment]
    openai_base._openrouter_patch_applied = True
