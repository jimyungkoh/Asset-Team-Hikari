<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-11-09
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Web Application - Build Fixes & Component Refactoring

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-09

#### [5.1] - 2025-11-09 - Fix build errors and improve component structure

##### Build Fixes

- **Fixed**: Function declaration syntax errors - Remove incorrect arrow function syntax from async function declarations
- **Fixed**: Type safety improvements in design system - Replace unsafe type assertions with type guards
- **Fixed**: Card component loading prop type error

##### Component Refactoring

- **Removed**: Unused chart components (MetricChart, Sparkline, CompactSparkline)
- **Removed**: Unused design components (MetricGrid, MetricCard, PageShell)
- **Removed**: Unused report components (DailyReportSections, ReportsList)

##### Component Structure Improvements

- **Added**: Component index files for better export organization
- **Added**: New UI components (Icon, Loading, Skeleton)
- **Changed**: Export SectionProps interface from section component

**Impact**: 🟡 Medium - Resolves build errors and improves code maintainability

**Modified Files**:
- `web/app/layout.tsx` - Fix function declaration syntax
- `web/app/reports/[id]/page.tsx` - Fix function declaration syntax
- `web/app/runs/[id]/page.tsx` - Fix function declaration syntax
- `web/app/tickers/[ticker]/dates/[date]/page.tsx` - Fix function declaration syntax
- `web/app/tickers/[ticker]/page.tsx` - Fix function declaration syntax
- `web/app/tickers/[ticker]/reports/page.tsx` - Fix function declaration syntax
- `web/components/design/section.tsx` - Export SectionProps interface, fix syntax
- `web/components/markdown/markdown-renderer.tsx` - Fix function declaration syntax
- `web/components/providers/session-provider.tsx` - Fix function declaration syntax
- `web/components/reports/status-badge.tsx` - Fix function declaration syntax
- `web/components/runs/run-stream.tsx` - Fix function declaration syntax
- `web/components/ui/card.tsx` - Fix loading prop type error
- `web/lib/design-system.ts` - Improve type safety with type guards
- `web/components/charts/index.ts` - Add empty export for module
- `web/components/design/index.ts` - Update exports
- `web/components/reports/index.ts` - Update exports
- `web/components/index.ts` - Add main component exports
- `web/components/markdown/index.ts` - Add markdown component exports
- `web/components/providers/index.ts` - Add provider component exports
- `web/components/runs/index.ts` - Add run component exports
- `web/components/ui/index.ts` - Add UI component exports
- `web/components/ui/icon.tsx` - New icon component
- `web/components/ui/loading.tsx` - New loading components
- `web/components/ui/skeleton.tsx` - New skeleton components

---

### CI/CD & Deployment Infrastructure

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-08

#### [4.2] - 2025-11-08 - Move env file preparation to remote deploy script

##### GitHub Actions Workflow

- **Removed**: `.github/workflows/deploy.yml` - Remove "Prepare env placeholders" step from GitHub Actions workflow
- **Changed**: `.github/workflows/deploy.yml` - Update deployment path from `~/services/prod/asset-team-hikari` to `/home/ubuntu/services/prod/asset-team-hikari` for absolute path consistency

##### Deployment Scripts

- **Added**: `scripts/deploy/remote_deploy.sh` - Add `ensure_env_file()` function to handle .env file creation on remote host
- **Changed**: `scripts/deploy/remote_deploy.sh` - Move env file preparation logic from GitHub Actions to remote deploy script
- **Changed**: `scripts/deploy/remote_deploy.sh` - Ensure .env files are created before deployment starts (only if missing)

**Impact**: 🟢 Low - Improves deployment reliability by ensuring env files exist on remote host

**Benefits**:
- Env file preparation happens directly on the deployment target
- More reliable than preparing files in CI and transferring them
- Handles missing .env files gracefully during deployment
- Better separation of concerns between CI and deployment scripts

**Migration Notes**:
- No action required - env files are now automatically created during deployment
- Existing .env files are preserved (not overwritten)

---

#### [4.1] - 2025-11-08 - Optimize infrastructure services management in deployment script

##### Deployment Scripts

- **Changed**: `scripts/deploy/remote_deploy.sh` - Change INFRA_SERVICES default from "traefik redis" to "redis" only
- **Changed**: `scripts/deploy/remote_deploy.sh` - Add conditional check to only start infrastructure services when INFRA_SERVICES is not empty
- **Changed**: `scripts/deploy/remote_deploy.sh` - Add comment explaining that traefik should be started separately as it only needs to run once

**Impact**: 🟢 Low - Improves deployment flexibility by allowing traefik to be managed separately

**Benefits**:

- Traefik can be started once and reused across deployments
- More flexible infrastructure service management
- Prevents unnecessary traefik restarts during application deployments

**Migration Notes**:

- Traefik should be started separately before first deployment
- INFRA_SERVICES environment variable can be set to include traefik if needed: `INFRA_SERVICES="traefik redis"`

---

### Redis Integration & Distributed Locking

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-08

#### [3.0] - 2025-11-08 - Add Redis service and distributed locking for run concurrency control

##### Infrastructure Updates

- **Added**: `server/src/infrastructure/redis/redis.service.ts` - New RedisService with connection management and distributed lock support
- **Changed**: `server/src/infrastructure/infrastructure.module.ts` - Add RedisService to global providers and exports
- **Changed**: `server/src/runs/runs.module.ts` - Import InfrastructureModule to access RedisService

##### Run Service Updates

- **Changed**: `server/src/runs/domain/run.service.ts` - Replace in-memory duplicate run detection with Redis-based distributed locking
- **Changed**: `server/src/runs/domain/run.service.ts` - Add RedisService dependency injection
- **Changed**: `server/src/runs/domain/run.service.ts` - Implement lock acquisition/release for ticker+tradeDate combinations (20min TTL)
- **Changed**: `server/src/runs/domain/run.service.ts` - Update conflict detection logic to use Redis locks instead of in-memory Map

##### Docker Configuration

- **Changed**: `docker-compose.yml` - Add Redis service (redis:7.2-alpine) for production environment
- **Changed**: `docker-compose.yml` - Add REDIS_URL environment variable to server service
- **Changed**: `docker-compose.yml` - Add redis_data volume for persistence
- **Changed**: `docker-compose.dev.yml` - Add Redis service (redis:7.2-alpine) for development environment
- **Changed**: `docker-compose.dev.yml` - Add redis_dev_data volume
- **Changed**: `docker-compose.dev.yml` - Add pull_policy: build to trading-agents service

##### Configuration Updates

- **Changed**: `server/.env.example` - Add REDIS_URL configuration with example value
- **Changed**: `server/.env.example` - Reorganize and improve documentation for environment variables
- **Changed**: `server/package.json` - Add ioredis dependency (^5.3.2)

**Impact**: 🟡 Medium - Improves concurrency control across multiple server instances; requires Redis infrastructure

**Benefits**:

- Prevents duplicate runs across multiple server instances
- Distributed locking ensures only one run per ticker+tradeDate combination
- Automatic lock expiration (20 minutes) prevents deadlocks
- Better scalability for multi-instance deployments

**Migration Notes**:

- Redis must be running before starting the server
- Set REDIS_URL environment variable (default: redis://localhost:6379)
- For Docker deployments, Redis is automatically configured
- Existing in-memory duplicate detection replaced with Redis-based solution

---

### Next.js 16 Migration

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-08

#### [2.0] - 2025-11-08 - Upgrade to Next.js 16 and React 19

##### Package Updates

- **Changed**: `web/package.json` - Upgrade Next.js from 15.1.8 to ^16.0.1
- **Changed**: `web/package.json` - Upgrade React and React DOM from 18.3.1 to ^19.2.0
- **Changed**: `web/package.json` - Upgrade @types/react from ^18.3.8 to ^19.2.2
- **Changed**: `web/package.json` - Upgrade @types/react-dom from ^18.3.0 to ^19.2.2
- **Changed**: `web/package.json` - Upgrade eslint-config-next from 15.1.8 to ^16.0.1

##### Code Updates

- **Changed**: `web/app/api/runs/[id]/route.ts` - Update route handler context type from `any` to proper `{ params: Promise<{ id: string }> }` type for Next.js 16
- **Changed**: `web/app/api/runs/[id]/stream/route.ts` - Update route handler context type from `any` to proper `{ params: Promise<{ id: string }> }` type for Next.js 16
- **Changed**: `web/app/api/reports/tickers/[ticker]/dates/[date]/route.ts` - Update route handler context type from `any` to proper `{ params: Promise<{ ticker: string; date: string }> }` type for Next.js 16
- **Changed**: `web/lib/middleware/auth.middleware.ts` - Add generic type parameters to middleware functions (`withAuth`, `withErrorHandler`, `composeMiddleware`) for proper TypeScript typing with Next.js 16 route handlers

##### Configuration Updates

- **Removed**: `web/next.config.js` - Removed serverActions configuration (not supported in Next.js 16)
- **Changed**: `web/next.config.js` - Added turbopack.root configuration to silence workspace root warning
- **Changed**: `web/middleware.ts` → `web/proxy.ts` - Rename middleware file to proxy per Next.js 16 convention
- **Changed**: `web/tsconfig.json` - Updated by Next.js 16: jsx set to react-jsx, added .next/dev/types/\*_/_.ts to include
- **Changed**: `web/Dockerfile` - Updated COPY command to use proxy.ts instead of middleware.ts
- **Removed**: `web/package-lock.json` - Removed npm lockfile (using pnpm)
- **Note**: serverActions.bodySizeLimit configuration removed in Next.js 16 (use route-level handling if needed)
- **Note**: Next.js 16 deprecated "middleware" file convention in favor of "proxy" for clarity

**Impact**: 🔴 High - Major version upgrade with breaking changes; requires dependency updates and testing

**Breaking Changes**:

- React 19 introduces new features and deprecations
- serverActions configuration moved from experimental to stable
- Async Request APIs are now fully enforced (already implemented in v15)
- Route handler context types must be properly typed (updated in this migration)

**Migration Notes**:

- All dynamic route params were already using async/await pattern (Next.js 15 compatibility)
- Route handlers updated with proper TypeScript types for Next.js 16 compatibility
- Middleware functions updated with generic types for better type safety
- Run `pnpm install` to update dependencies (completed)
- Test all features thoroughly, especially authentication and streaming endpoints

---

### Next.js 15 & Type System Improvements

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-02

#### [1.0] - 2025-11-02 - Fix Next.js 15 Route Handler & Type Compatibility

##### Type Fixes

- **Fixed**: `web/lib/middleware/auth.middleware.ts` - Update middleware to work with Next.js 15 dynamic context.params (now returns Promise)
- **Fixed**: `web/app/api/reports/tickers/[ticker]/dates/[date]/route.ts` - Handle async context.params and add proper Route Handler typing
- **Fixed**: `web/app/api/runs/[id]/route.ts` - Fix context parameter handling for Next.js 15 Route Handlers
- **Fixed**: `web/app/api/runs/[id]/stream/route.ts` - Update GET handler to await context.params Promise
- **Fixed**: `web/app/runs/[id]/page.tsx` - Align RunSummary type definition with JsonValue for result property
- **Fixed**: `web/lib/api-client.ts` - Add generic type parameters to error handlers (handleErrorResponse<T>, handleError<T>) and fix errorMessage type narrowing
- **Fixed**: `web/lib/design-system.ts` - Add missing FinanceMetric interface export with proper type definition
- **Fixed**: `web/components/markdown/markdown-renderer.tsx` - Fix code component typing by handling implicit inline parameter with type casting

##### Configuration Updates

- **Fixed**: `web/tailwind.config.ts` - Update Tailwind v4 configuration to use proper Config type instead of deprecated defineConfig function

**Impact**: 🟡 Medium - Ensures TypeScript strict mode compliance and Next.js 15 compatibility; no breaking API changes

---

## Previous Changes

### Web API Routes

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-02

#### [1.0] - 2025-11-02 - Improve Runtime Parameter Handling in API Routes

- **Fixed**: `web/app/api/reports/tickers/[ticker]/dates/[date]/route.ts` - Add null-safety checks for dynamic route parameters and prevent runtime errors from undefined context
- **Fixed**: `web/app/api/runs/[id]/route.ts` - Add parameter type compatibility and null-safety validation; add 400 error response for missing run IDs
- **Fixed**: `web/app/api/runs/[id]/stream/route.ts` - Improve parameter extraction logic and add ID validation with proper error response
- **Changed**: Update file headers to 2025-11-02 for all modified API route files

**Impact**: 🟢 Low - Improves runtime stability and error handling without changing API contract

---

### Infrastructure & Docker (2025-11-02)

- Docker Compose configuration separated into production and development environments
- Traefik reverse proxy added for unified HTTPS routing with Cloudflare DNS-01 challenge support
- Multi-stage builds implemented for NestJS and Next.js services
- Development docker-compose.dev.yml added for isolated trading-agents development
- Updated: `docker-compose.yml` - set `NEXTAUTH_URL` to `https://sandboxlab.cloud` to ensure correct NextAuth callback origin behind Traefik

### Modern UI Redesign (2025-10-27)

- Implemented glassmorphism design patterns for modern financial UI
- Added gradient UI elements and semantic color schemes
- Simplified user interface by removing technical complexity
- Improved responsive design across all device sizes

---

**Last Updated**: 2025-11-02
**Maintained By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**License**: Apache License 2.0
