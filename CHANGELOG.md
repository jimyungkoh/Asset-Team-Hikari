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

### tradingagents/dataflows/gemini_browse.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: New module for Gemini-powered news browsing and summarization
- **Added**: get_news_gemini_web() function for company-specific news with Gemini summarization
- **Added**: get_global_news_gemini_web() function for macroeconomic news with Gemini summarization
- **Added**: \_summarize_with_gemini() helper for leveraging Gemini API
- **Added**: Graceful fallback when GOOGLE_API_KEY not configured
- **Note**: Uses Google News as source and Gemini (gemini-2.0-flash by default) for summarization
- **Note**: Integrates with OpenRouter provider for web browsing capabilities

**Impact**: 🟡 Medium

---

### tests/dataflows/test_gemini_browse.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: New test module for gemini_browse dataflow
- **Added**: test_get_news_gemini_web_summarizes() for company news summarization
- **Added**: test_get_global_news_gemini_web_empty_when_no_news() for empty result handling
- **Note**: Uses monkeypatch for stub testing without external API calls
- **Note**: Achieves deterministic test execution without GOOGLE_API_KEY

**Impact**: 🟢 Low

---

### cli/main.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Added**: OpenRouter environment variable validation with warnings
- **Added**: GOOGLE_API_KEY validation for Gemini news browsing
- **Fixed**: Trailing whitespace issues throughout file
- **Note**: Provides user feedback when required environment variables are missing

**Impact**: 🟡 Medium

---

### tradingagents/dataflows/interface.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Added**: Gemini news browsing integration (get_news_gemini_web, get_global_news_gemini_web)
- **Added**: Provider-aware vendor routing for OpenRouter + Gemini
- **Added**: Automatic fallback from gemini to google/local when GOOGLE_API_KEY missing
- **Changed**: Enhanced vendor routing logic with OpenRouter detection
- **Note**: When OpenRouter provider selected and news vendor is 'openai', automatically switches to 'gemini'

**Impact**: 🟡 Medium

---

### tradingagents/dataflows/openai.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Added**: OpenRouter API client initialization with proper header injection
- **Added**: Support for HTTP-Referer and X-Title headers required by OpenRouter policy
- **Changed**: Enhanced get_stock_news_openai() to support both OpenAI and OpenRouter backends
- **Changed**: Enhanced get_global_news_openai() to support both OpenAI and OpenRouter backends
- **Changed**: Enhanced get_fundamentals_openai() to support both OpenAI and OpenRouter backends
- **Note**: Gracefully handles header injection failures for backward compatibility

**Impact**: 🟡 Medium

---

### .env.example

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Changed**: Replaced placeholder values with descriptive format (your-xxx-api-key)
- **Added**: Comprehensive documentation for Core APIs section
- **Added**: OpenRouter integration variables (OPENROUTER_API_KEY, OPENROUTER_SITE_URL, OPENROUTER_APP_TITLE)
- **Added**: Gemini API key variable for news browsing support
- **Added**: Optional local providers comment for Ollama
- **Added**: Security note clarifying this is documentation-only file
- **Note**: Comprehensive guide for all supported API providers and configurations

**Impact**: 🟢 Low

---

### README.md

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Added**: New section for OpenRouter + Gemini News Browsing configuration
- **Added**: Documentation for GOOGLE_API_KEY environment variable
- **Added**: Explanation of automatic fallback behavior when GOOGLE_API_KEY not set
- **Added**: Code examples for required OpenRouter environment variables
- **Fixed**: Trailing spaces and formatting inconsistencies throughout document
- **Changed**: Improved formatting and readability with consistent spacing

**Impact**: 🟢 Low

---

### requirements.txt

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.0] - 2025-10-19

- **Added**: Modification header block at top of file
- **Added**: google-generativeai dependency for Gemini integration

**Impact**: 🟢 Low

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
