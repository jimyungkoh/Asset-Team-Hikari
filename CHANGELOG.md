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
