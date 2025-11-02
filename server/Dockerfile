# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-11-02
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app/server
ENV NODE_ENV=production

FROM base AS deps

WORKDIR /app
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY server/package.json ./server/package.json

WORKDIR /app/server
RUN pnpm install --frozen-lockfile

FROM deps AS build

WORKDIR /app/server

COPY server/tsconfig.json ./tsconfig.json
COPY server/tsconfig.build.json ./tsconfig.build.json
COPY server/drizzle.config.ts ./drizzle.config.ts
COPY server/config ./config
COPY server/scripts ./scripts
COPY server/src ./src
COPY server/migrations ./migrations

RUN pnpm run build

FROM deps AS prod-deps

WORKDIR /app
ENV CI=true
RUN pnpm install --prod --frozen-lockfile --filter tradingagents-server

FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app/server
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ../node_modules
COPY --from=prod-deps /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/config ./config
COPY --from=build /app/server/migrations ./migrations
COPY server/package.json ./package.json
COPY server/drizzle.config.ts ./drizzle.config.ts
EXPOSE 3001

CMD ["node", "dist/main.js"]
