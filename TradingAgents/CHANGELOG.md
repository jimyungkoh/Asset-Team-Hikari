<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-11-02
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

<!-- Trading graph thinking mode support added 2025-10-19 -->

### Infrastructure (Docker & Environment)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-02

#### [1.0] - 2025-11-02 - Compose 분리 및 컨테이너 환경정리

- **Changed**: `docker-compose.yml` - 프로덕션 스택을 `web`, `server`, `trading-agents` 3개 서비스로 재구성하고 외부 포트는 웹만 노출하도록 제한
- **Added**: `docker-compose.yml` - `traefik` 리버스 프록시 서비스를 추가해 80/443 단일 엔드포인트로 라우팅하고 HTTP 요청을 HTTPS로 리다이렉션하도록 구성
- **Added**: `docker-compose.dev.yml` - `trading-agents-dev` 전용 개발 설정을 별도 컴포즈 파일로 분리
- **Added**: `server/Dockerfile`, `web/Dockerfile` - pnpm 기반 멀티 스테이지 빌드로 NestJS/Next.js 프로덕션 이미지를 제공
- **Added**: `web/.env.example` - 컨테이너 환경에서 필요한 변수 명세를 신규 추가
- **Updated**: `TradingAgents/.env.example`, `server/.env.example`, `web/.env.local.example` - 내부 토큰 공유 및 docker-compose 호스트명 가이드를 반영

**Impact**: 🟡 Medium - 도커 환경 재정비로 배포/로컬 구성 분리가 명확해지며, 서비스 간 공유 토큰 관리가 용이해짐

### server/ (NestJS API) & web/ (Next.js Client)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-02

#### [1.10] - 2025-11-02 - Fix Report Existence Check for Analysis Restart

**web/**:
- **Fixed**: `web/components/runs/run-form.tsx` - 분석 시작 전 종합 리포트 존재 여부 확인 로직 개선. 중단된 리포트가 있어도 종합 리포트가 없으면 재분석이 시작되도록 수정. 단순히 `status === "success"`만 확인하던 것을 종합 리포트(composite report)가 실제로 존재하고 완료되었는지 확인하도록 변경하여 불완전한 리포트로 인한 재분석 방지 버그 해결
- **Fixed**: `web/components/runs/run-form.tsx` - 분석 진행 중(`pending` 또는 `running` 상태)일 때 중복 분석이 트리거되지 않도록 수정. 진행 중인 리포트가 있으면 리다이렉트만 하고 새 분석을 시작하지 않도록 로직 추가

**Impact**: 🟡 Medium - 분석 재시작 로직 개선, 불완전한 리포트 상태에서의 재분석 가능, 진행 중인 분석의 중복 실행 방지

#### [1.9] - 2025-11-02 - Web UI Polish & Script Maintenance

**web/**:
- **Changed**: `web/app/layout.tsx` - Updated file header (Last Updated: 2025-11-02)
- **Changed**: `web/app/tickers/page.tsx` - Updated file header (Last Updated: 2025-11-02)
- **Changed**: `web/app/tickers/[ticker]/page.tsx` - Fixed focus-visible className by removing duplicate `focus-visible:outline` property for cleaner CSS output
- **Changed**: `web/app/tickers/[ticker]/dates/[date]/page.tsx` - Updated file header (Last Updated: 2025-11-02)

**server/**:
- **Changed**: `server/scripts/backfill-run.ts` - Commented out entire script to temporarily disable backfill functionality pending review

**Impact**: 🟢 Low - Minor UI refinement and script maintenance, no functional changes

#### [1.8] - 2025-11-02 - Report Date Filtering and Ticker Navigation

**server/**:
- **Added**: `ReportsService.listDetailsByTickerAndDate()` method for filtering reports by ticker and date
- **Added**: `ReportMetadata` interface in reports repository for type safety
- **Added**: Enhanced error handling in report content retrieval with fallback mechanisms
- **Changed**: `reports.controller.ts` updated with date filtering endpoints
- **Changed**: `run.service.ts` improved metadata tracking for better report association
- **Changed**: `runs.module.ts` updated module configuration for better service organization

**Impact**: 🟡 Medium - New filtering capabilities, backward compatible

**web/**:
- **Added**: `web/app/tickers/page.tsx` - Main tickers list page for browsing all available tickers
- **Added**: `web/app/tickers/[ticker]/page.tsx` - Ticker details page showing ticker information
- **Added**: `web/app/tickers/[ticker]/dates/[date]/page.tsx` - Date-specific reports view page
- **Added**: `web/app/api/reports/tickers/[ticker]/dates/[date]/route.ts` - API route for fetching reports by ticker and date
- **Added**: `web/components/reports/daily-report-sections.tsx` - Component for organizing and displaying daily report sections
- **Added**: `web/components/reports/status-badge.tsx` - Component for visualizing report status indicators
- **Changed**: `web/components/reports/report-content.tsx` - Enhanced rendering with improved content organization
- **Changed**: `web/components/reports/reports-list.tsx` - Better list rendering and filtering capabilities
- **Changed**: `web/components/design/page-shell.tsx` - Improved layout and styling for consistent UI
- **Changed**: `web/components/runs/run-form.tsx` - Enhanced UX with better validation and error handling
- **Changed**: `web/lib/services/backend-api.service.ts` - Added report fetching endpoints and improved error handling
- **Changed**: `web/lib/constants.ts` - Added report-related API routes and parameters
- **Changed**: `web/types/api.ts` - Extended with new report and filtering interfaces
- **Changed**: `web/app/api/runs/route.ts` - Enhanced query handling for improved filtering
- **Changed**: `web/package.json` - Dependency synchronization
- **Changed**: `pnpm-lock.yaml` - Updated lock file with latest dependencies

**Impact**: 🟡 Medium - New navigation features, improved report browsing experience

#### [1.7] - 2025-11-01 - Module Architecture Refactoring

**server/**:
- **Removed**: server/src/runs/ 하위의 기존 구조 (artifacts.service.ts, reports.*.ts, runs.*.ts 삭제)
- **Added**: server/src/runs/domain/ - `RunService` (비즈니스 로직), `RunConfigService` (설정 관리) 분리
- **Added**: server/src/runs/infrastructure/ - `RunRepository` (데이터 접근), `PythonRunsClient` (외부 API 통신)
- **Added**: server/src/runs/presentation/ - `RunsController` (HTTP 엔드포인트)
- **Added**: server/src/artifacts/ - 독립 모듈로 분리 (ArtifactsModule, ArtifactsService, ArtifactsRepository)
- **Added**: server/src/reports/ - 독립 모듈로 분리 (ReportsModule, ReportsService, ReportsRepository, ReportsController)
- **Added**: server/src/tickers/ - 독립 모듈로 분리 (TickersModule, TickersService, TickersController)
- **Added**: server/src/common/guards/ - 인증 가드 분리 (InternalAuthGuard)
- **Changed**: server/src/app.module.ts - 새로운 모듈 구조 반영 (ArtifactsModule, ReportsModule, TickersModule 추가)
- **Changed**: server/src/runs/runs.module.ts - 계층화 구조 (domain, infrastructure, presentation) 적용

**web/**:
- **Added**: web/lib/api-client.ts - 백엔드 API 통신 클라이언트 라이브러리
- **Added**: web/lib/constants.ts - 애플리케이션 전역 상수 (API 엔드포인트, 기본값)
- **Added**: web/lib/config/env.config.ts - 환경 변수 설정 관리
- **Added**: web/lib/middleware/auth.middleware.ts - 인증 및 에러 처리 미들웨어
- **Added**: web/lib/services/backend-api.service.ts - 백엔드 서비스 통합 클라이언트
- **Added**: web/types/api.ts - API 응답 타입 정의
- **Added**: web/types/env.d.ts - 환경 변수 타입 정의
- **Changed**: web/auth.config.ts - NextAuth 설정 최신화
- **Changed**: web/tsconfig.json - 경로 매핑 및 타입 체크 개선
- **Changed**: web/app/api/runs/route.ts - 새로운 클라이언트 라이브러리 사용으로 개선
- **Changed**: web/app/api/runs/[id]/route.ts - 개별 run 조회 API 개선

**Impact**: 🔴 High - 주요 아키텍처 리팩토링 (계층화, 모듈 분리, 패키지 재구성)

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
**Last Updated**: 2025-11-01

#### [1.6] - 2025-11-01 - DynamoDB Artifact Persistence & Run Hydration

- **Added**: server/src/runs/artifacts.service.ts - `saveArtifact()` and `saveRunSummary()` methods for DynamoDB integration
- **Added**: Automatic table creation via `ensureTableExists()` method with PAY_PER_REQUEST billing mode
- **Added**: Safe database operations: `saveReportMetadataSafe()` for PostgreSQL metadata sync and `recordTickerRunSafe()` for ticker_runs tracking
- **Added**: Artifact type interfaces: `TickerArtifact` and `TickerRunSummary` with full DynamoDB schema definitions
- **Added**: server/src/runs/runs.service.ts - `persistRunArtifacts()` method for persisting run results post-completion
- **Added**: `buildArtifactsFromResult()` method to extract artifacts from trading run results (decisions, plans, reports)
- **Added**: `backfillRun()` method to enable artifact persistence for previously completed runs
- **Added**: Helper methods: `toContentString()`, `extractDurationSeconds()`, `extractSummaryMetadata()` for artifact data extraction
- **Changed**: server/src/runs/dto/create-run.dto.ts - Added optional `config?: Record<string, unknown>` field with validation
- **Changed**: server/src/runs/dto/create-run.dto.ts - Updated imports to include `IsObject` and `IsOptional` validators
- **Changed**: server/package.json - Updated `_metadata.lastUpdated` to 2025-11-01
- **Added**: npm script `backfill:run` to execute backfill operations via ts-node
- **Added**: ts-node to devDependencies (^10.9.2) for running TypeScript scripts

**Impact**: 🟡 Medium - Introduces new artifact persistence layer with DynamoDB and PostgreSQL metadata sync

#### [1.5] - 2025-11-01 - Schema Refactoring: ticker_runs → ticker

- **Changed**: server/src/infrastructure/database/schema.ts - `tickerRuns` 테이블을 `ticker`로 리네임
- **Changed**: server/src/infrastructure/database/database.service.ts - 모든 `tickerRuns` 참조를 `ticker`로 변경
- **Changed**: 외래 키 제약 조건 업데이트 (reports_ticker_run_fk)
- **Added**: server/migrations/rename_ticker_runs_to_ticker.sql - 안전한 테이블 리네임 마이그레이션 스크립트

**Impact**: 🟡 Medium - 데이터베이스 스키마 변경 필요

#### [1.4] - 2025-10-31 - Database Migration Tooling Setup

- **Added**: drizzle-kit 패키지 추가 (devDependencies)
- **Added**: drizzle.config.ts 설정 파일 생성 (PostgreSQL 연결 설정)
- **Added**: 데이터베이스 마이그레이션 스크립트 추가 (db:generate, db:migrate, db:push, db:studio)
- **Changed**: drizzle-orm 버전 업데이트 (0.34.0 → 0.44.7)

**Impact**: 🟢 Low

#### [1.3] - 2025-10-31 - Ticker Reports Integration

- **Added**: PostgreSQL `reports` 테이블 스키마 추가 (ticker, runDate, reportType 복합 unique 제약, 외래키, 인덱스 포함)
- **Added**: `ReportsRepository` - 리포트 메타데이터 CRUD 작업 담당
- **Added**: `ReportsService` - 리포트 목록 조회 및 상세 조회 비즈니스 로직
- **Added**: `ReportsController` - `GET /reports/tickers/:ticker`, `GET /reports/:id` 엔드포인트
- **Changed**: `ArtifactsService` - 리포트 저장 시 PostgreSQL 메타데이터 동기화 로직 추가 (best-effort 패턴)
- **Changed**: `DatabaseService` - reports 스키마 등록 및 db getter 추가
- **Changed**: `RunsModule` - ReportsRepository, ReportsService, ReportsController 등록

**Impact**: 🟡 Medium - 데이터베이스 마이그레이션 필요 (reports 테이블 생성)

#### [1.2] - 2025-10-31 - Database Schema Refactoring

- **Changed**: server/src/infrastructure/database/schema.ts - `allowed_users` 테이블명을 `users`로 변경
- **Changed**: server/src/infrastructure/database/schema.ts - `allowedUsers` export를 `users`로 변경
- **Changed**: server/src/infrastructure/database/database.service.ts - 모든 `allowedUsers` 참조를 `users`로 변경
- **Changed**: server/src/infrastructure/database/database.service.ts - DatabaseSchema 타입 정의 업데이트

**Impact**: 🟡 Medium - 데이터베이스 마이그레이션 필요 (테이블명 변경)

#### [1.1] - 2025-10-26 - API Service Updates

- **Changed**: Python 실행 클라이언트, 컨트롤러, 모듈, 서비스 파일들에서 타입 정의 및 인터페이스 개선

**Impact**: 🟢 Low

### web/ (Next.js UI)

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-01

#### [1.5] - 2025-11-01 - Next.js Best Practices Refactoring

- **Added**: web/types/env.d.ts - 환경 변수 타입 정의로 타입 안정성 확보
- **Added**: web/types/api.ts - API 응답 및 도메인 타입 정의 (Run, Report, ApiResponse 등)
- **Added**: web/lib/constants.ts - API 설정, 라우트 경로, HTTP 상태 코드, 에러 메시지 중앙 관리
- **Added**: web/lib/api-client.ts - 재사용 가능한 API 클라이언트 클래스 (향후 사용)
- **Added**: web/lib/config/env.config.ts - 환경 설정 중앙 관리 및 검증
- **Added**: web/lib/services/backend-api.service.ts - Backend API 통신 로직 서비스 레이어 분리
- **Added**: web/lib/middleware/auth.middleware.ts - 인증 및 에러 핸들링 미들웨어 패턴 도입
- **Changed**: web/tsconfig.json - Path aliases 추가 (@/components, @/lib, @/app, @/types)
- **Changed**: web/tsconfig.json - moduleResolution을 'bundler'로 변경
- **Changed**: web/app/api/runs/route.ts - 미들웨어 패턴 적용 및 서비스 레이어 사용
- **Changed**: web/app/api/runs/[id]/route.ts - 미들웨어 패턴 적용 및 서비스 레이어 사용
- **Changed**: web/auth.config.ts - 서비스 레이어 사용으로 코드 간소화 및 에러 핸들링 개선
- **Refactored**: API 라우트 핸들러에서 중복 코드 제거 (DRY 원칙)
- **Refactored**: 관심사 분리 (Separation of Concerns) - 인증, 에러 핸들링, 비즈니스 로직 분리

**Impact**: 🟢 Low - 내부 구조 개선, 기존 기능 유지, 타입 안정성 강화

#### [1.4] - 2025-10-31 - Ticker Reports Pages & Components

- **Added**: `/tickers/[ticker]/reports` - ticker별 리포트 목록 페이지
- **Added**: `/reports/[id]` - 리포트 상세 조회 페이지
- **Added**: `ReportsList` 컴포넌트 - 리포트 목록 표시 및 상태 배지
- **Added**: `ReportContent` 컴포넌트 - 리포트 상세 내용 마크다운 렌더링
- **Added**: `lib/api-helpers.ts` - `getNestBase()`, `getInternalHeaders()` 헬퍼 함수
- **Added**: `lib/date-utils.ts` - 날짜 포맷팅 및 리포트 타입 포맷팅 유틸리티

**Impact**: 🟢 Low

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
