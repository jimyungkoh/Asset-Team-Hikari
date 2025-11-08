#!/usr/bin/env bash
# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-11-08
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================
# Simple helper that waits until the requested services are running.

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <compose-file> <stack-name> <service> [service ...]" >&2
  exit 1
fi

COMPOSE_FILE=$1
STACK_NAME=$2
shift 2
SERVICES=("$@")

READY_TIMEOUT=${SERVICE_READY_TIMEOUT:-180}
SLEEP_SECONDS=${SERVICE_READY_INTERVAL:-5}
DEADLINE=$((READY_TIMEOUT / SLEEP_SECONDS))

for service in "${SERVICES[@]}"; do
  attempt=0
  while true; do
    container_id=$(docker compose -p "$STACK_NAME" -f "$COMPOSE_FILE" ps -q "$service" | head -n 1 || true)
    if [ -n "$container_id" ]; then
      status=$(docker inspect -f '{{.State.Status}}' "$container_id")
      if [ "$status" = "running" ]; then
        break
      fi
    fi

    attempt=$((attempt + 1))
    if [ "$attempt" -ge "$DEADLINE" ]; then
      echo "[wait_for_services] $service in stack $STACK_NAME failed to become healthy" >&2
      exit 1
    fi
    sleep "$SLEEP_SECONDS"
  done
  echo "[wait_for_services] $service in stack $STACK_NAME is running"
done
