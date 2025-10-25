"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-24
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
"""
import os
from typing import Mapping, Sequence

import chromadb
from chromadb.config import Settings
from openai import OpenAI as OpenAIClient


class FinancialSituationMemory:
    APPROX_CHARS_PER_TOKEN = 3.5
    MAX_EMBED_TOKENS = 7800  # keep margin under 8K hard limit
    MAX_EMBED_CHARS = int(MAX_EMBED_TOKENS * APPROX_CHARS_PER_TOKEN)

    def __init__(self, name, config):
        self.config = config
        if config["backend_url"] == "http://localhost:11434/v1":
            self.embedding = "nomic-embed-text"
        else:
            self.embedding = "text-embedding-3-small"

        backend_url = config["backend_url"]
        client_kwargs = {}

        if backend_url.startswith("http://localhost"):
            # Local (Ollama-compatible) embeddings are expected to be served via the configured backend URL.
            client_kwargs["base_url"] = backend_url
            api_key = os.getenv("LOCAL_EMBEDDING_API_KEY")
            if api_key:
                client_kwargs["api_key"] = api_key
        else:
            # Always use OpenAI-hosted embeddings, even when OpenRouter is the chat provider.
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY must be set to generate embeddings. "
                    "Refer to .env.example for the required environment variables."
                )
            client_kwargs["api_key"] = api_key
            if not backend_url.startswith("https://api.openai.com"):
                # Override any non-OpenAI backend so embeddings hit OpenAI directly.
                client_kwargs["base_url"] = "https://api.openai.com/v1"

        self.client = OpenAIClient(**client_kwargs)
        self.chroma_client = chromadb.Client(Settings(allow_reset=True))
        self.situation_collection = self.chroma_client.create_collection(name=name)
        self._summarizer_client: OpenAIClient | None = None
        self._summarizer_model = self.config.get("quick_think_llm", "gpt-4o-mini")
        self._summarizer_enabled = self.config.get("llm_provider", "openai").lower() in ("openai", "openrouter")

    def _stringify(self, value) -> str:
        if value is None:
            return ""
        if isinstance(value, str):
            return value
        if isinstance(value, Mapping):
            parts = []
            for key, val in value.items():
                rendered = self._stringify(val)
                if rendered:
                    parts.append(f"{key}: {rendered}")
            return "\n".join(parts)
        if isinstance(value, Sequence) and not isinstance(value, (str, bytes, bytearray)):
            parts = [self._stringify(item) for item in value]
            return "\n".join(part for part in parts if part)
        return str(value)

    def _clip_to_token_limit(self, text: str) -> str:
        try:
            import tiktoken

            encoder = tiktoken.get_encoding("cl100k_base")
            tokens = encoder.encode(text)
            if len(tokens) <= self.MAX_EMBED_TOKENS:
                return text
            truncated_tokens = tokens[: self.MAX_EMBED_TOKENS]
            return encoder.decode(truncated_tokens)
        except Exception:
            return text[: self.MAX_EMBED_CHARS]

    def _ensure_summarizer_client(self) -> OpenAIClient | None:
        if not self._summarizer_enabled:
            return None
        if self._summarizer_client is not None:
            return self._summarizer_client

        provider = self.config.get("llm_provider", "openai").lower()
        backend_url = self.config.get("backend_url", "https://api.openai.com/v1")
        client_kwargs = {"base_url": backend_url}

        if provider == "openrouter":
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "OPENROUTER_API_KEY must be set to summarize content when using the OpenRouter backend."
                )
            client_kwargs["api_key"] = api_key
            client = OpenAIClient(**client_kwargs)
            referer = os.getenv("OPENROUTER_SITE_URL", "https://example.com")
            title = os.getenv("OPENROUTER_APP_TITLE", "TradingAgents")
            try:
                client._custom_headers = {
                    "HTTP-Referer": referer,
                    "X-Title": title,
                }
            except Exception:
                pass
        elif provider == "openai":
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY must be set to summarize content when using the OpenAI backend."
                )
            client_kwargs["api_key"] = api_key
            client = OpenAIClient(**client_kwargs)
        else:
            # Unsupported provider (e.g., local). Skip summarization.
            self._summarizer_enabled = False
            return None

        self._summarizer_client = client
        return client

    def _extract_summary_text(self, response) -> str:
        if response is None:
            return ""

        text = getattr(response, "output_text", None)
        if isinstance(text, str) and text.strip():
            return text.strip()

        try:
            data = response.model_dump()
        except AttributeError:
            data = response

        if isinstance(data, dict):
            for item in data.get("output", []):
                contents = item.get("content", []) or []
                for block in contents:
                    if isinstance(block, dict) and block.get("type") in {"output_text", "text"}:
                        value = block.get("text") or block.get("output_text")
                        if isinstance(value, str) and value.strip():
                            return value.strip()
        return ""

    def _summarize_for_embedding(self, text: str) -> str | None:
        client = self._ensure_summarizer_client()
        if client is None:
            return None

        provider = self.config.get("llm_provider", "openai").lower()
        reasoning_payload = None
        if provider == "openrouter" and self.config.get("enable_thinking_mode"):
            reasoning_payload = {
                "budget_tokens": self._resolve_reasoning_budget(
                    self.config.get(
                        "thinking_effort_quick",
                        self.config.get("thinking_effort"),
                    )
                )
            }

        instructions = (
            "Summarize the following report into a concise yet information-dense format. "
            "Preserve key figures, timeframes, tickers, risk factors, and actionable recommendations. "
            "Limit the summary to roughly 1200 tokens while retaining essential context."
        )

        try:
            response = client.responses.create(
                model=self._summarizer_model,
                input=[
                    {
                        "role": "system",
                        "content": [
                            {"type": "input_text", "text": instructions},
                        ],
                    },
                    {
                        "role": "user",
                        "content": [
                            {"type": "input_text", "text": text},
                        ],
                    },
                ],
                temperature=0.3,
                max_output_tokens=1500,
                reasoning=reasoning_payload,
            )
            summary = self._extract_summary_text(response)
            if summary:
                return summary
        except Exception:
            # Any failure falls back to truncation logic.
            return None

        return None

    def _normalize_for_embedding(self, text) -> str:
        normalized = self._stringify(text).strip()
        if len(normalized) <= self.MAX_EMBED_CHARS:
            return normalized

        summary = self._summarize_for_embedding(normalized)
        if summary:
            clipped_summary = self._clip_to_token_limit(summary)
            if len(clipped_summary) < len(summary) and not clipped_summary.endswith("[truncated after summarization]"):
                clipped_summary = f"{clipped_summary}\n\n[truncated after summarization]"
            return clipped_summary

        clipped = self._clip_to_token_limit(normalized)
        if len(clipped) < len(normalized) and not clipped.endswith("[truncated for embedding]"):
            clipped = f"{clipped}\n\n[truncated for embedding]"
        return clipped

    def _resolve_reasoning_budget(self, effort) -> int:
        default_budget = 800

        if effort is None:
            return default_budget

        if isinstance(effort, (int, float)):
            return max(1, int(effort))

        try:
            parsed = int(str(effort))
            return max(1, parsed)
        except (TypeError, ValueError):
            normalized = str(effort).strip().lower()

        effort_to_budget = {
            "minimal": 256,
            "low": 256,
            "short": 256,
            "lite": 256,
            "medium": 800,
            "balanced": 800,
            "default": 800,
            "high": 1200,
            "deep": 1200,
            "extended": 1600,
            "max": 2000,
        }

        return effort_to_budget.get(normalized, default_budget)

    def get_embedding(self, text):
        """Get OpenAI embedding for a text."""

        prepared = self._normalize_for_embedding(text)
        response = self.client.embeddings.create(
            model=self.embedding,
            input=prepared,
        )
        return response.data[0].embedding

    def add_situations(self, situations_and_advice):
        """Add financial situations and their corresponding advice. Parameter is a list of tuples (situation, rec)"""

        situations = []
        advice = []
        ids = []
        embeddings = []

        offset = self.situation_collection.count()

        for i, (situation, recommendation) in enumerate(situations_and_advice):
            situations.append(situation)
            advice.append(recommendation)
            ids.append(str(offset + i))
            embeddings.append(self.get_embedding(situation))

        self.situation_collection.add(
            documents=situations,
            metadatas=[{"recommendation": rec} for rec in advice],
            embeddings=embeddings,
            ids=ids,
        )

    def get_memories(self, current_situation, n_matches=1):
        """Find matching recommendations using OpenAI embeddings"""
        query_embedding = self.get_embedding(current_situation)

        results = self.situation_collection.query(
            query_embeddings=[query_embedding],
            n_results=n_matches,
            include=["metadatas", "documents", "distances"],
        )

        matched_results = []
        for i in range(len(results["documents"][0])):
            matched_results.append(
                {
                    "matched_situation": results["documents"][0][i],
                    "recommendation": results["metadatas"][0][i]["recommendation"],
                    "similarity_score": 1 - results["distances"][0][i],
                }
            )

        return matched_results


if __name__ == "__main__":
    # Example usage
    matcher = FinancialSituationMemory()

    # Example data
    example_data = [
        (
            "High inflation rate with rising interest rates and declining consumer spending",
            "Consider defensive sectors like consumer staples and utilities. Review fixed-income portfolio duration.",
        ),
        (
            "Tech sector showing high volatility with increasing institutional selling pressure",
            "Reduce exposure to high-growth tech stocks. Look for value opportunities in established tech companies with strong cash flows.",
        ),
        (
            "Strong dollar affecting emerging markets with increasing forex volatility",
            "Hedge currency exposure in international positions. Consider reducing allocation to emerging market debt.",
        ),
        (
            "Market showing signs of sector rotation with rising yields",
            "Rebalance portfolio to maintain target allocations. Consider increasing exposure to sectors benefiting from higher rates.",
        ),
    ]

    # Add the example situations and recommendations
    matcher.add_situations(example_data)

    # Example query
    current_situation = """
    Market showing increased volatility in tech sector, with institutional investors
    reducing positions and rising interest rates affecting growth stock valuations
    """

    try:
        recommendations = matcher.get_memories(current_situation, n_matches=2)

        for i, rec in enumerate(recommendations, 1):
            print(f"\nMatch {i}:")
            print(f"Similarity Score: {rec['similarity_score']:.2f}")
            print(f"Matched Situation: {rec['matched_situation']}")
            print(f"Recommendation: {rec['recommendation']}")

    except Exception as e:
        print(f"Error during recommendation: {str(e)}")
