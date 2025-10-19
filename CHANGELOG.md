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

#### [1.2] - 2025-10-19

- **Refactored**: Improved Gemini API integration with google-generativeai SDK
- **Added**: Grounding citations extraction from web sources
- **Added**: Helper functions `_response_as_dict()`, `_extract_citations()`, `_format_grounded_output()`, `_generate_with_grounding()`
- **Changed**: Enhanced response parsing with fallback mechanisms
- **Changed**: Graceful ImportError handling when google.genai is unavailable
- **Note**: Maintains backward compatibility; refactors API integration pattern

**Impact**: 🟡 Medium

---

### tests/dataflows/test_gemini_browse.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Changed**: Updated test mocking to align with refactored gemini_browse.py functions
- **Changed**: Improved test coverage for citation extraction and response handling

**Impact**: 🟡 Medium

---

### .env.example

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.1] - 2025-10-19

- **Changed**: Improved environment variable documentation
- **Note**: Documentation enhancement only, no functional impact

**Impact**: 🟢 Low

---

### requirements.txt

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-19

#### [1.3] - 2025-10-19

- **Changed**: Updated dependencies for Gemini API integration

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
