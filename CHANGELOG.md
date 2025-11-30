<!-- ============================================================
Modified: See CHANGELOG.md for complete modification history
Last Updated: 2025-11-30
Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
============================================================ -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Mobile Search Bar UX Improvement

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-30

#### [5.2] - 2025-11-30 - Prevent mobile search bar from hiding while focused

- **Changed**: `web/app/_components/header.tsx` - Track search focus state to prevent sticky search bar from hiding on scroll when input is focused 🟢 Low
- **Changed**: `web/app/_components/ticker-search.tsx` - Add focus state propagation to improve mobile UX by keeping search input visible during interaction 🟢 Low
- **Changed**: `.gitignore` - Exclude local tool configurations and documentation files for cleaner repository state 🟢 Low

**Impact**: 🟢 Low - UX improvement for mobile users; no breaking changes

**Benefits**:
- Improved mobile search experience by preventing search bar collapse while user is typing
- Search input remains accessible and visible during interaction
- Better focus management for mobile accessibility

**Migration Notes**:
- No migration required - UX improvement only
- Applies to mobile browsers (responsive design)

---

### Ticker Search Feature

**Modified By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**Last Updated**: 2025-11-08

#### [5.1] - 2025-11-08 - Fix mobile Safari auto-zoom on input focus

- **Fixed**: `web/app/_components/ticker-search.tsx` - Add `text-base` class to input to prevent iOS Safari auto-zoom (16px minimum required) 🟢 Low

#### [5.0] - 2025-11-08 - Add ticker search functionality with autocomplete

##### Backend API Updates

- **Added**: `server/src/infrastructure/database/database.service.ts` - Add `searchTickers` method with case-insensitive prefix search using `ilike`
- **Added**: `server/src/tickers/tickers.controller.ts` - Add `GET /tickers/search` endpoint with query parameter support

##### Frontend Components

- **Added**: `web/app/_components/ticker-search.tsx` - New TickerSearch component with autocomplete dropdown
- **Added**: `web/app/_components/ticker-search.tsx` - Keyboard navigation support (Arrow keys, Enter, Escape)
- **Added**: `web/app/_components/ticker-search.tsx` - Global keyboard shortcut (Cmd/Ctrl+K) for quick access
- **Added**: `web/app/_components/ticker-search.tsx` - Throttled search with 450ms delay to reduce API calls
- **Added**: `web/app/_components/ticker-search.tsx` - Loading states and error handling

##### API Routes

- **Added**: `web/app/api/tickers/search/route.ts` - Next.js API route for ticker search with authentication middleware

##### Service Layer

- **Added**: `web/lib/services/backend-api.service.ts` - Add `searchTickers` method to BackendApiService

##### UI Improvements

- **Changed**: `web/app/_components/header.tsx` - Integrate TickerSearch component into header
- **Changed**: `web/app/_components/header.tsx` - Improve responsive layout with separate mobile/desktop search placement
- **Changed**: `web/app/_components/header.tsx` - Restructure header layout for better search integration

**Impact**: 🟢 Low - New feature addition; improves user experience for ticker navigation

**Benefits**:
- Quick access to ticker pages via search
- Keyboard-first navigation with global shortcut
- Responsive design for mobile and desktop
- Reduced API calls through throttling
- Accessible UI with ARIA attributes

**Migration Notes**:
- No migration required - new feature only
- Search requires authenticated session
- Desktop users can use Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open search

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

**Last Updated**: 2025-11-30
**Maintained By**: jimyungkoh<aqaqeqeq0511@gmail.com>
**License**: Apache License 2.0
