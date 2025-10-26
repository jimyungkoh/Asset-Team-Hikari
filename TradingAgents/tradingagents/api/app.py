# ============================================================
# Modified: See CHANGELOG.md for complete modification history
# Last Updated: 2025-10-26
# Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
# ============================================================

from __future__ import annotations

import asyncio
import json
import os
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from functools import lru_cache
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from tradingagents.runner.run_graph import run_tradingagents


@dataclass
class Settings:
    """Environment-derived configuration for the API service."""

    internal_api_token: Optional[str]
    skip_token_auth: bool


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Load service settings from environment variables."""
    load_dotenv()
    skip_auth = os.getenv("SKIP_TOKEN_AUTH", "false").lower() == "true"
    token = os.getenv("INTERNAL_API_TOKEN")
    return Settings(internal_api_token=token, skip_token_auth=skip_auth)


async def require_token(
    authorization: Optional[str] = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    """Validate Bearer token when token authentication is enabled."""
    if settings.skip_token_auth:
        return

    if not settings.internal_api_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="INTERNAL_API_TOKEN is not configured on the Python service.",
        )

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header.",
        )

    supplied_token = authorization.split(" ", 1)[1]
    if supplied_token != settings.internal_api_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authorization token does not match the configured secret.",
        )


class RunCreateRequest(BaseModel):
    """Payload schema for creating a TradingAgents run."""

    ticker: str = Field(..., min_length=1)
    trade_date: str = Field(..., min_length=8, max_length=32)
    config: Optional[Dict[str, Any]] = None
    config_path: Optional[str] = Field(default=None, description="Optional path to a JSON config file.")
    result_path: Optional[str] = Field(default=None, description="Optional path to persist the final payload.")


class RunCreateResponse(BaseModel):
    """Simple acknowledgement returned after scheduling a run."""

    id: str
    status: str


class RunStatusResponse(BaseModel):
    """Current status and metadata for a run."""

    id: str
    ticker: str
    trade_date: str
    status: str
    created_at: datetime
    updated_at: datetime
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    events: List[Dict[str, Any]] = Field(default_factory=list)


@dataclass
class RunRecord:
    """In-memory representation of a TradingAgents execution."""

    id: str
    ticker: str
    trade_date: str
    status: str
    created_at: datetime
    updated_at: datetime
    events: List[Dict[str, Any]] = field(default_factory=list)
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    task: Optional[asyncio.Task[Any]] = None
    queue: asyncio.Queue[Dict[str, Any]] = field(default_factory=asyncio.Queue)


app = FastAPI(
    title="TradingAgents Service",
    version="0.1.0",
    description="HTTP interface for executing TradingAgents runs.",
)

_runs: Dict[str, RunRecord] = {}
_runs_lock = asyncio.Lock()
_TERMINAL_STATES = {"success", "failed"}


def _build_event(event: str, **payload: Any) -> Dict[str, Any]:
    """Compose a structured event payload."""
    body: Dict[str, Any] = {"event": event, "timestamp": datetime.utcnow().isoformat()}
    if payload:
        body["payload"] = payload
    return body


def _enqueue_event(run_id: str, event_payload: Dict[str, Any]) -> None:
    """Append an event to the run timeline and notify streaming consumers."""
    record = _runs.get(run_id)
    if not record:
        return

    event_with_id = {"id": uuid.uuid4().hex, **event_payload}
    record.events.append(event_with_id)
    record.updated_at = datetime.utcnow()
    try:
        record.queue.put_nowait(event_with_id)
    except asyncio.QueueFull:
        # Should not happen because the queue is unbounded, but defensive guard.
        pass


async def _get_record(run_id: str) -> RunRecord:
    """Fetch a run record by identifier."""
    async with _runs_lock:
        record = _runs.get(run_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run '{run_id}' was not found.",
            )
        return record


async def _update_record(run_id: str, **changes: Any) -> RunRecord:
    """Apply partial updates to a run record."""
    async with _runs_lock:
        record = _runs.get(run_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Run '{run_id}' was not found.",
            )
        for key, value in changes.items():
            setattr(record, key, value)
        record.updated_at = datetime.utcnow()
        return record


async def _execute_run(record: RunRecord, request: RunCreateRequest) -> None:
    """Background coroutine responsible for running TradingAgents."""
    loop = asyncio.get_running_loop()

    await _update_record(record.id, status="running")
    _enqueue_event(record.id, _build_event("status", state="running"))

    def emit(event: str, **payload: Any) -> None:
        """Adapter translating runner callbacks into structured events."""
        event_payload = _build_event(event, **payload)
        loop.call_soon_threadsafe(_enqueue_event, record.id, event_payload)

    config_overrides: Dict[str, Any] = {}
    if request.config:
        config_overrides = dict(request.config)

    memory_namespace = f"run_{record.id}"
    metadata = config_overrides.get("metadata")
    if isinstance(metadata, dict):
        metadata = dict(metadata)
    else:
        metadata = {}
    metadata.setdefault("run_id", record.id)
    metadata["memory_namespace"] = memory_namespace
    config_overrides["metadata"] = metadata
    config_overrides["memory_namespace"] = memory_namespace

    try:
        result = await asyncio.to_thread(
            run_tradingagents,
            ticker=request.ticker,
            trade_date=request.trade_date,
            config_overrides=config_overrides,
            config_json=None,
            config_path=request.config_path,
            result_path=request.result_path,
            event_callback=emit,
        )
    except Exception as exc:  # noqa: BLE001
        await _update_record(record.id, status="failed", error=str(exc))
        _enqueue_event(record.id, _build_event("status", state="failed", message=str(exc)))
        return

    await _update_record(record.id, status="success", result=result)
    _enqueue_event(record.id, _build_event("status", state="success"))


def _serialize_record(record: RunRecord) -> RunStatusResponse:
    """Convert an internal run record to an API response payload."""
    return RunStatusResponse(
        id=record.id,
        ticker=record.ticker,
        trade_date=record.trade_date,
        status=record.status,
        created_at=record.created_at,
        updated_at=record.updated_at,
        result=record.result,
        error=record.error,
        events=record.events,
    )


@app.post("/runs", response_model=RunCreateResponse, dependencies=[Depends(require_token)])
async def create_run(payload: RunCreateRequest) -> RunCreateResponse:
    """Schedule a new TradingAgents run and return its identifier."""
    run_id = uuid.uuid4().hex
    record = RunRecord(
        id=run_id,
        ticker=payload.ticker,
        trade_date=payload.trade_date,
        status="queued",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    async with _runs_lock:
        _runs[run_id] = record

    _enqueue_event(run_id, _build_event("status", state="queued"))
    record.task = asyncio.create_task(_execute_run(record, payload))

    return RunCreateResponse(id=run_id, status=record.status)


@app.get("/runs/{run_id}", response_model=RunStatusResponse, dependencies=[Depends(require_token)])
async def get_run(run_id: str) -> RunStatusResponse:
    """Retrieve the latest status and payload for a run."""
    record = await _get_record(run_id)
    return _serialize_record(record)


@app.get("/runs", response_model=List[RunStatusResponse], dependencies=[Depends(require_token)])
async def list_runs() -> List[RunStatusResponse]:
    """Enumerate all tracked runs (development-only helper endpoint)."""
    async with _runs_lock:
        return [_serialize_record(record) for record in _runs.values()]


def _event_to_sse(event: Dict[str, Any]) -> str:
    """Format a run event dictionary as an SSE data frame."""
    return f"data: {json.dumps(event, ensure_ascii=True)}\n\n"


@app.get("/runs/{run_id}/stream", dependencies=[Depends(require_token)])
async def stream_run(run_id: str) -> StreamingResponse:
    """Stream real-time run updates using Server-Sent Events."""
    record = await _get_record(run_id)

    async def event_generator() -> Any:
        # Yield historical events first.
        for event in record.events:
            yield _event_to_sse(event)

        # Drain any pending items already queued to avoid duplicate emission.
        try:
            while True:
                record.queue.get_nowait()
        except asyncio.QueueEmpty:
            pass

        # Continue streaming new events until the run reaches a terminal state.
        while True:
            if record.status in _TERMINAL_STATES and record.queue.empty():
                break
            try:
                next_event = await asyncio.wait_for(record.queue.get(), timeout=1.0)
            except asyncio.TimeoutError:
                continue
            yield _event_to_sse(next_event)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
