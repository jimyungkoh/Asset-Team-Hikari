"""
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-23
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

    def _normalize_for_embedding(self, text) -> str:
        normalized = self._stringify(text).strip()
        clipped = self._clip_to_token_limit(normalized)
        if clipped == normalized and len(clipped) > self.MAX_EMBED_CHARS:
            clipped = clipped[: self.MAX_EMBED_CHARS]
        if len(clipped) < len(normalized):
            if not clipped.endswith("[truncated for embedding]"):
                clipped = f"{clipped}\n\n[truncated for embedding]"
        return clipped

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
