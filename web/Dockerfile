# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-11-02
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app/web
ENV NODE_ENV=production

FROM base AS deps

WORKDIR /app
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY web/package.json ./web/package.json

WORKDIR /app/web
RUN pnpm install --frozen-lockfile

FROM deps AS build

WORKDIR /app/web

ENV NEXTAUTH_URL=http://localhost:3000 \
    NEXTAUTH_SECRET=placeholder-secret \
    INTERNAL_API_TOKEN=dummy-token \
    SKIP_TOKEN_AUTH=true \
    NEST_API_BASE=http://server:3001

COPY web/next.config.js ./next.config.js
COPY web/postcss.config.js ./postcss.config.js
COPY web/tailwind.config.ts ./tailwind.config.ts
COPY web/tsconfig.json ./tsconfig.json
COPY web/auth.config.ts ./auth.config.ts
COPY web/middleware.ts ./middleware.ts
COPY web/app ./app
COPY web/components ./components
COPY web/lib ./lib
COPY web/types ./types
RUN pnpm run build

FROM deps AS prod-deps

WORKDIR /app
ENV CI=true
RUN pnpm install --prod --frozen-lockfile --filter tradingagents-web

FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app/web
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=prod-deps /app/node_modules ../node_modules
COPY --from=prod-deps /app/web/node_modules ./node_modules
COPY --from=build /app/web/.next ./.next
COPY web/package.json ./package.json
EXPOSE 3000

CMD ["pnpm", "start"]
