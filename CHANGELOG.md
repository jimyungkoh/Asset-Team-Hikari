<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-10-23
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

<!-- Trading graph thinking mode support added 2025-10-19 -->

### cli/main.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-23

#### [2.3] - 2025-10-23 - Markdown Safety Guard

- **Fixed**: Wrapped rich Markdown rendering with `_as_markdown()` to coerce structured content into strings before parsing, preventing `TypeError: Input data should be a string`.
- **Rationale**: Ensure analyst and debate reports render reliably even when upstream agents return list-structured payloads.

**Impact**: 🟢 Low

#### [2.2] - 2025-10-19 - Report Serialization For Structured Reasoning Output

- **Fixed**: Normalized list-based reasoning payloads into markdown strings before logging and saving report sections to prevent `TypeError: write() argument must be str`.
- **Changed**: Centralized message content stringification for live display and tooling logs so Anthropic/OpenRouter style blocks render cleanly.
- **Rationale**: Maintain thinking-mode compatibility while ensuring CLI reporting handles structured response formats.

**Impact**: 🟡 Medium

#### [2.1] - 2025-10-19 - OpenRouter Config Integration

- **Added**: Provider metadata handoff (identifier/url/settings) from CLI selection pipeline.
- **Changed**: Applied OpenRouter default thinking options to runtime config when relevant.
- **Fixed**: Ensured CLI lowercases provider identifiers consistently for downstream usage.
- **Rationale**: Allow OpenRouter-specific presets to flow from external config into analysis without manual overrides.

**Impact**: 🟡 Medium

---

### cli/utils.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [2.1] - 2025-10-19 - Config-Driven OpenRouter Model Options

- **Added**: TOML loader with caching for OpenRouter provider metadata and model menus.
- **Changed**: Questionary provider/model prompts to honor config-defined defaults.
- **Changed**: Respected `TRADINGAGENTS_LLM_PROVIDER` env var when pre-selecting providers.
- **Fixed**: Added fallbacks when the OpenRouter config file is missing or malformed (with inline warnings).
- **Fixed**: Aligned Questionary default values with choice payloads to avoid `Invalid default value` errors.
- **Fixed**: Replaced unsupported prompt_toolkit color tokens with ANSI-safe variants to avoid CLI color parsing errors.
- **Rationale**: Centralize OpenRouter menu data in configuration files while keeping the CLI resilient.

**Impact**: 🟡 Medium

---

### cli/openrouter_llm.toml

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-24

#### [1.1] - 2025-10-24 - Extended Model Options

- **Added**: DeepSeek-V3.1-Terminus as secondary quick thinking model option.
- **Added**: DeepSeek-R1-0528 as secondary deep thinking model option.
- **Changed**: Updated Grok-4 Fast quick thinking default to `false`.
- **Changed**: Updated DeepSeek-V3.1-Terminus deep thinking default to `false`.
- **Rationale**: Expand LLM provider choices while maintaining DeepSeek models as primary defaults for both thinking modes.

**Impact**: 🟢 Low

---

### .env.example

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Added**: LLM provider configuration variables (TRADINGAGENTS_LLM_PROVIDER, TRADINGAGENTS_DEEP_THINK_LLM, TRADINGAGENTS_QUICK_THINK_LLM, TRADINGAGENTS_BACKEND_URL)
- **Added**: Thinking mode configuration variables (TRADINGAGENTS_THINKING_MODE, TRADINGAGENTS_THINKING_EFFORT, TRADINGAGENTS_THINKING_EFFORT_DEEP, TRADINGAGENTS_THINKING_EFFORT_QUICK)
- **Note**: Supports OpenRouter's extended thinking capabilities for trading analysis

**Impact**: 🟡 Medium

---

### tradingagents/default_config.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Added**: File modification header block
- **Changed**: LLM provider settings now use environment variables with fallback defaults (os.getenv)
- **Added**: Thinking mode configuration support (enable_thinking_mode, thinking_effort, thinking_effort_deep, thinking_effort_quick)
- **Note**: Enables flexible LLM provider switching and extended thinking mode for trading analysis

**Impact**: 🟡 Medium

---

### tradingagents/graph/openrouter_patch.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-23

#### [1.1] - 2025-10-23 - Improved Response Serialization

- **Added**: `_extract_text_blocks()` function to safely extract strings from structured response blocks.
- **Added**: `_collapse_items_to_string()` function to convert message items into human-readable string format.
- **Changed**: Patched `_construct_responses_api_input` to return string instead of list for OpenRouter compatibility.
- **Changed**: Added Sequence type import for proper type hints.
- **Rationale**: Enable OpenRouter Responses API to properly serialize complex message structures with reasoning, function calls, and outputs.

**Impact**: 🟡 Medium

---

### tradingagents/graph/trading_graph.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-23

#### [2.2] - 2025-10-23 - Reasoning Budget Mapping For OpenRouter

- **Changed**: Translated thinking effort presets into OpenRouter `reasoning.budget_tokens` values instead of unsupported `effort` strings.
- **Added**: Defensive parsing for numeric configuration inputs to let operators override token budgets precisely.
- **Rationale**: Align thinking mode requests with OpenRouter's reasoning token contract to prevent schema validation failures while keeping deep/quick modes enabled.

**Impact**: 🟡 Medium

#### [2.1] - 2025-10-19 - OpenRouter Credential Handling

- **Fixed**: Passed `OPENROUTER_API_KEY` into `ChatOpenAI` initialization to avoid missing-auth errors.
- **Fixed**: Added explicit validation for absent OpenRouter credentials with actionable messaging.
- **Changed**: Reused provider-aware kwargs when constructing deep/quick thinking chat models.
- **Rationale**: Prevent runtime 401 errors when the CLI selects the OpenRouter backend.

**Impact**: 🟡 Medium

#### [1.1] - 2025-10-19

- **Added**: File modification header block
- **Added**: OpenRouter extended thinking mode support for deep and quick thinking models
- **Changed**: Dynamic model_kwargs generation based on LLM provider and thinking configuration
- **Changed**: Whitespace cleanup (trailing whitespace removed)
- **Note**: Allows separate thinking effort levels for deep vs quick analysis tasks

**Impact**: 🟡 Medium

---

### tradingagents/agents/utils/memory.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-24

#### [3.2] - 2025-10-24 - Reasoning Budget Resolution

- **Added**: `_resolve_reasoning_budget()` method to map human-readable effort strings ("minimal", "low", "high", "deep", etc.) to token budgets for OpenRouter extended thinking.
- **Added**: Integration of reasoning payload into `responses.create()` call when OpenRouter provider is configured with thinking mode enabled.
- **Rationale**: Enable flexible reasoning budget configuration while maintaining backward compatibility with existing embedding and summarization workflows.

**Impact**: 🟡 Medium

#### [1.4] - 2025-10-23 - LLM Summaries Before Embedding

- **Added**: Summarized lengthy reports with the configured `quick_think_llm` before generating embeddings to minimize context loss.
- **Improved**: Applied precise token clipping to summary results via tiktoken and annotated any residual truncation.
- **Rationale**: Keep homing in on salient details without blindly truncating to fit the 8K embedding limit.

**Impact**: 🟢 Low

#### [1.3] - 2025-10-23 - Large Input Normalization For Embeddings

- **Fixed**: Normalized structured texts into plain strings and truncated inputs before embedding to stay within the 8K token limit.
- **Rationale**: Prevent OpenAI `text-embedding-3-small` requests from failing when reports exceed the model’s maximum context length.

**Impact**: 🟢 Low

#### [1.2] - 2025-10-22 - OpenAI-Only Embedding Routing

- **Fixed**: Forced embeddings to use OpenAI credentials/endpoints even when the chat provider is OpenRouter, while preserving local (Ollama) routing.
- **Rationale**: Match project intent where embeddings always come from OpenAI, avoiding unexpected OpenRouter HTML responses.

**Impact**: 🟢 Low

#### [1.1] - 2025-10-19 - OpenRouter API Key Propagation for Embeddings

- **Added**: File modification header block
- **Fixed**: Ensured the embeddings client forwards `OPENROUTER_API_KEY` when using the OpenRouter backend

**Impact**: 🟡 Medium

#### [1.0] - 2025-10-19 - OpenRouter Embedding Client Support

- **Added**: File modification header block.
- **Fixed**: Ensured the embeddings client forwards `OPENROUTER_API_KEY` when using the OpenRouter backend.
- **Rationale**: Align memory embeddings with CLI OpenRouter selections and eliminate 401 errors.

**Impact**: 🟡 Medium

---

### .pre-commit-config.yaml

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Pre-commit hook to enforce file header and CHANGELOG presence
- **Note**: Blocks commits if headers are missing or outdated

**Impact**: 🟡 Medium

---

### scripts/validate_commit_headers.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Changed**: Enforce 'Modified By' equals git identity (name<email>)
- **Changed**: Added CHANGELOG staged check when code/docs modified

**Impact**: 🟡 Medium

---

### requirements.txt

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.2] - 2025-10-19

- **Changed**: Added modification header block at top of file

**Impact**: 🟢 Low

#### [1.1] - 2025-10-19

- **Added**: pre-commit dependency for local hook execution

**Impact**: 🟢 Low

---

### .gitignore

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Changed**: Added modification header block at top of file

**Impact**: 🟢 Low

#### [1.0] - 2025-10-19

- **Changed**: Added AGENTS.md and CRUSH.md to ignored files
- **Changed**: Added .cursor/ and .idea/ IDE directories to gitignore
- **Changed**: Organized gitignore sections with descriptive comments
- **Note**: Prevents generated documentation and IDE configuration files from being tracked in repository

**Impact**: 🟢 Low

---

## Versioning

This project follows Semantic Versioning (MAJOR.MINOR.PATCH):

- MAJOR: Incompatible API changes
- MINOR: New functionality (backward compatible)
- PATCH: Bug fixes (backward compatible)

## Contributors

- jimyungkoh<aqaqeqeq0511@gmail.com>

**License**: Apache License 2.0
