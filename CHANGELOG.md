<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-10-22
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

<!-- Trading graph thinking mode support added 2025-10-19 -->

### tradingagents/graph/trading_graph.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-22

#### [2.4] - 2025-10-22 - OpenRouter use_responses_api Handling

- **Changed**: Refactored LLM initialization to conditionally set `use_responses_api` parameter based on provider
- **Fixed**: Added logic to disable `use_responses_api` for OpenRouter compatibility, with warning message when thinking mode is requested
- **Changed**: Updated Last Updated date to 2025-10-22
- **Rationale**: Improve compatibility with OpenRouter while maintaining support for Anthropic's structured thinking mode

**Impact**: 🟡 Medium

---

### tradingagents/dataflows/local.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-22

#### [1.1] - 2025-10-22 - Import Optimization and File Header

- **Added**: File modification header block
- **Changed**: Moved `pandas` import from module level to function scope for optimized loading
- **Changed**: Localized pandas imports in `get_YFin_data_window`, `get_YFin_data`, and `get_simfin_*` functions
- **Rationale**: Reduce startup overhead by deferring pandas loading only when needed

**Impact**: 🟢 Low

---

### cli/main.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

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
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19 - Initial OpenRouter Model Catalog

- **Added**: Dedicated TOML file listing OpenRouter provider metadata plus quick/deep thinking model options.
- **Rationale**: Manage OpenRouter menu entries without editing Python sources.

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

### tradingagents/graph/trading_graph.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [2.2] - 2025-10-19 - Reasoning Budget Mapping For OpenRouter

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
**Last Updated**: 2025-10-19

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
