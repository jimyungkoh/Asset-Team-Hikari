<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-10-27
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

<!-- Trading graph thinking mode support added 2025-10-19 -->

### TradingAgents/ (Python Core)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-26

#### [1.3] - 2025-10-26 - Core System Improvements

- **Added**: TradingAgents/main.py에 Apache License compliance header 추가 및 cleanup() 호출을 위한 try/finally 블록 구현
- **Changed**: CLI 인터페이스(run_analysis 함수)에서 실시간 디스플레이 레이아웃 및 메시지 버퍼링 로직 개선
- **Changed**: 메모리 유틸리티(memory.py)에서 ChromaDB 설정 및 OpenAI 클라이언트 초기화 최적화
- **Changed**: API 서비스(app.py)에서 비동기 처리 및 UUID 생성 로직 개선
- **Changed**: 트레이딩 그래프(trading_graph.py)에서 노드 연결 및 신호 처리 로직 강화
- **Changed**: 러너 모듈(run_graph.py)에서 인자 파싱 및 실행 흐름 개선

**Impact**: 🟢 Low

### server/ (NestJS API)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-26

#### [1.1] - 2025-10-26 - API Service Updates

- **Changed**: Python 실행 클라이언트, 컨트롤러, 모듈, 서비스 파일들에서 타입 정의 및 인터페이스 개선

**Impact**: 🟢 Low

### web/ (Next.js UI)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-26

#### [1.3] - 2025-10-26 - UI Component Refinements

- **Changed**: UI_REDESIGN.md에서 헤더 블록 제거 및 문서 구조 간소화
- **Changed**: RunForm 컴포넌트에서 모델 선택 로직 및 기본값 처리 개선
- **Changed**: RunStream 컴포넌트에서 실시간 데이터 처리 및 표시 로직 최적화
- **Changed**: Button 컴포넌트에서 스타일링 및 상호작용 개선
- **Changed**: run-config.ts에서 구성 관리 및 타입 정의 강화

**Impact**: 🟢 Low

### web/ (root-level)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-27

#### [1.2] - 2025-10-27 - Design System & CLI Parity UI

- **Added**: Finance-focused design 시스템(`web/lib/design-system.ts`)과 페이지 셸/섹션/메트릭 컴포넌트로 일관된 레이아웃을 구축.
- **Changed**: 홈 런처 페이지를 현대적인 금융 대시보드 스타일로 개편하고, CLI 선택지(애널리스트·연구 심도·LLM 스택)를 그대로 반영한 RunForm으로 교체.
- **Changed**: Apple Human Interface Guidelines 원칙을 적용해 밝은 톤, 여백 중심의 UI로 재구성하고 핵심 상호작용을 명료하게 정리.
- **Added**: 향후 DB 영속화를 고려한 `metadata` 구성 및 구성 미리보기 패널을 제공하여 운영 투명성 확보.
- **Changed**: Node.js 엔진 요구 버전을 최신 LTS(>=20.11.0)로 상향해 lint/build 명령이 Next.js 요구사항과 일치하도록 조정.
- **Note**: OpenRouter Thinking Mode, 모델 선택, 추가 JSON override 등 CLI 가용 기능을 전면 지원.

#### [1.1] - 2025-10-24 - Tailwind 4 & Root Layout Alignment

- **Changed**: Upgraded Next.js stack to Tailwind CSS 4 + Next 15 with the new `@tailwindcss/postcss` pipeline and refreshed Radix/Lucide dependencies.
- **Changed**: Moved the `web/` package alongside `TradingAgents/` at the repository root per deployment layout requirements.
- **Note**: CSS entrypoint now imports the unified Tailwind 4 bundle and configures plugins via ESM-aware `tailwind.config.ts`.

**Impact**: 🟡 Medium

#### [1.0] - 2025-10-24 - Next.js Web Console Foundation

- **Added**: App Router-based UI with protected routes for run orchestration (`/`, `/runs/[id]`) backed by NextAuth Google/GitHub sign-in plus email allowlist.
- **Added**: Tailwind + shadcn-inspired component library (Button, Card, Input, Progress, Textarea) and streaming log viewer that connects to proxy SSE endpoint.
- **Added**: API route proxies for `/api/runs` CRUD + `/api/runs/:id/stream` to bridge browser clients with NestJS while enforcing `X-Internal-Token`.
- **Note**: Establishes authenticated web surface without altering existing Python CLI logic.

**Impact**: 🟡 Medium

### server/ (root-level)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-27

#### [1.2] - 2025-10-27 - Node LTS Alignment

- **Changed**: `package.json`의 Node.js 엔진 범위를 최신 LTS(>=20.11.0)로 고정해 NestJS 개발 서버와 빌드 단계가 동일한 런타임을 사용하도록 통일.

#### [1.1] - 2025-10-24 - Dependency Refresh & Root Relocation

- **Changed**: Updated NestJS packages to 10.4.9 with TypeScript 5.6 / Node 22 typings and aligned default project root discovery for the sibling TradingAgents repo.
- **Changed**: Moved the `server/` package adjacent to `TradingAgents/` to satisfy deployment layout guidance.
- **Note**: `RunsService` now resolves the Python workspace via the shared parent directory when `PROJECT_ROOT` is unset.

**Impact**: 🟢 Low

#### [1.0] - 2025-10-24 - NestJS Orchestration Service

- **Added**: Runs module with POST `/runs`, GET `/runs/:id`, and SSE `/runs/:id/stream` endpoints secured by internal token guard.
- **Added**: Python runner process management that parses JSONL output into replayable SSE streams and caches run summaries in-memory.
- **Added**: TypeScript build tooling (`package.json`, tsconfig) and env-driven bootstrap (`main.ts`) including configurable CORS + port.
- **Note**: Provides thin Node orchestration layer to call existing TradingAgents Python workflow.

**Impact**: 🟡 Medium

### tradingagents/runner/run_graph.py

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-10-27

#### [1.1] - 2025-10-27 - Selected Analysts Config Bridge

- **Added**: `selected_analysts` 목록을 config override에서 추출해 TradingAgentsGraph 초기화 시 전달, 웹 UI와 CLI 간 에이전트 선택 기능을 정렬.
- **Note**: 리스트가 비어있거나 문자열이 아닐 경우 기존 기본값을 그대로 유지해 역호환성 보장.

#### [1.0] - 2025-10-24 - JSONL Runner Wrapper

- **Added**: Standalone runner that loads TradingAgentsGraph, streams structured progress/error events, and serializes final outputs for SSE consumers.
- **Added**: Config override support via JSON payloads, optional result persistence, and defensive serialization of complex LangGraph state.
- **Note**: Keeps existing CLI untouched by introducing a dedicated process entrypoint for web orchestration.

**Impact**: 🟡 Medium

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
**Last Updated**: 2025-10-24

#### [1.2] - 2025-10-24 - Web UI & Orchestrator Settings

- **Added**: NextAuth (NEXTAUTH_SECRET/URL) and OAuth provider placeholders (Google/GitHub) plus ALLOWED_EMAILS whitelist.
- **Added**: Shared INTERNAL_API_TOKEN + NEST_API_BASE alongside NestJS runtime variables (NEST_PORT, NEST_CORS_ORIGINS, PYTHON_BIN, PROJECT_ROOT, PYTHON_RUNNER_PATH).
- **Note**: Documents environment contract for new web and backend services.

**Impact**: 🟡 Medium

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
**Last Updated**: 2025-10-24

#### [1.2] - 2025-10-24 - Node Build Artifacts

- **Added**: Ignore rules for `node_modules/`, `web/.next/`, and `server/dist/` generated by new web/server stacks.
- **Note**: Prevents frontend/backend dependencies from polluting version control.

**Impact**: 🟢 Low

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
