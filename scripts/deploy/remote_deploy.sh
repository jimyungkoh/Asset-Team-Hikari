#!/usr/bin/env bash
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-11-08
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
# Blue/green deployment helper for the Oracle Compute host.
# Spins up a new stack alongside the currently running one and only
# shuts down the previous stack after the new one is healthy.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

COMPOSE_FILE_REL=${COMPOSE_FILE_REL:-docker-compose.yml}
COMPOSE_FILE="$REPO_ROOT/$COMPOSE_FILE_REL"
STACK_PREFIX=${STACK_PREFIX:-asset-team-hikari}
APP_SERVICES=${APP_SERVICES:-"trading-agents server web"}
# infra는 한 번만 띄우면 되므로 기본값은 redis만 관리하고 traefik은 필요할 때만 지정
INFRA_SERVICES=${INFRA_SERVICES:-"redis"}
ACTIVE_STACK_FILE=${ACTIVE_STACK_FILE:-"$REPO_ROOT/.deploy/active_stack"}
DEPLOY_BRANCH=${DEPLOY_BRANCH:-origin/main}
SKIP_GIT_PULL=${SKIP_GIT_PULL:-false}
BUILD_IMAGES=${BUILD_IMAGES:-true}

ensure_env_file() {
  local rel_dir="$1"
  local dir_path="$REPO_ROOT/$rel_dir"
  local example="$dir_path/.env.example"
  local target="$dir_path/.env"

  if [ ! -d "$dir_path" ]; then
    return 0
  fi

  if [ -f "$example" ]; then
    # 예제가 있으면 기존 .env가 없을 때만 복사
    if [ ! -f "$target" ]; then
      cp "$example" "$target"
    fi
  else
    # 예제가 없어도 compose가 요구하므로 빈 .env 보장
    if [ ! -f "$target" ]; then
      : > "$target"
    fi
  fi
}

# 배포 대상 디렉터리들의 .env 플레이스홀더를 원격 호스트에서 직접 보장
for dir in server web TradingAgents traefik; do
  ensure_env_file "$dir"
done

mkdir -p "$(dirname "$ACTIVE_STACK_FILE")"

if [ "$SKIP_GIT_PULL" != "true" ]; then
  git fetch origin
  git checkout --force "${DEPLOY_BRANCH##*/}"
  git reset --hard "$DEPLOY_BRANCH"
fi

ensure_network() {
  local network_name=$1
  if ! docker network inspect "$network_name" >/dev/null 2>&1; then
    docker network create "$network_name"
  fi
}

ensure_volume() {
  local volume_name=$1
  if ! docker volume inspect "$volume_name" >/dev/null 2>&1; then
    docker volume create "$volume_name" >/dev/null
  fi
}

ensure_network "asset-team-hikari_proxy"
ensure_network "asset-team-hikari_infra"
ensure_volume "asset-team-hikari_redis_data"

if [ -n "$INFRA_SERVICES" ]; then
  COMPOSE_PROJECT_NAME="${STACK_PREFIX}-infra" docker compose -f "$COMPOSE_FILE" up -d $INFRA_SERVICES
fi

if [ -f "$ACTIVE_STACK_FILE" ]; then
  ACTIVE_STACK=$(cat "$ACTIVE_STACK_FILE" | tr -d '\n' )
else
  ACTIVE_STACK=""
fi

if [ "$ACTIVE_STACK" = "blue" ]; then
  NEXT_STACK="green"
else
  NEXT_STACK="blue"
fi

PULL_CMD=(docker compose -f "$COMPOSE_FILE" pull $APP_SERVICES)
if [ "$BUILD_IMAGES" = "true" ]; then
  UP_CMD=(docker compose -f "$COMPOSE_FILE" up -d --build $APP_SERVICES)
else
  UP_CMD=(docker compose -f "$COMPOSE_FILE" up -d $APP_SERVICES)
fi

COMPOSE_PROJECT_NAME="${STACK_PREFIX}-${NEXT_STACK}" "${PULL_CMD[@]}"
COMPOSE_PROJECT_NAME="${STACK_PREFIX}-${NEXT_STACK}" "${UP_CMD[@]}"

"$SCRIPT_DIR/wait_for_services.sh" "$COMPOSE_FILE" "${STACK_PREFIX}-${NEXT_STACK}" server web

if [ -n "$ACTIVE_STACK" ]; then
  COMPOSE_PROJECT_NAME="${STACK_PREFIX}-${ACTIVE_STACK}" docker compose -f "$COMPOSE_FILE" stop $APP_SERVICES
  COMPOSE_PROJECT_NAME="${STACK_PREFIX}-${ACTIVE_STACK}" docker compose -f "$COMPOSE_FILE" rm -f $APP_SERVICES >/dev/null
fi

echo -n "$NEXT_STACK" > "$ACTIVE_STACK_FILE"

echo "Deployment complete. Active stack: $NEXT_STACK"
