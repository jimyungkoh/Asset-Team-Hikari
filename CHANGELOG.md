<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-10-19
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

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

#### [1.1] - 2025-10-19

- **Added**: File modification header block
- **Added**: OpenRouter extended thinking mode support for deep and quick thinking models
- **Changed**: Dynamic model_kwargs generation based on LLM provider and thinking configuration
- **Changed**: Whitespace cleanup (trailing whitespace removed)
- **Note**: Allows separate thinking effort levels for deep vs quick analysis tasks

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
