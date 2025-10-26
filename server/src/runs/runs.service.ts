// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { Observable, ReplaySubject } from 'rxjs';

import { CreateRunDto } from './dto/create-run.dto';
import { PythonRunsClient, PythonRunEvent, PythonRunStatusResponse } from './python-runs.client';
import { RunStatus, RunSummary } from './run.types';

interface RunContext {
  id: string;
  ticker: string;
  tradeDate: string;
  status: RunStatus;
  createdAt: Date;
  updatedAt: Date;
  subject: ReplaySubject<MessageEvent>;
  result?: unknown;
  error?: {
    message: string;
    traceback?: string;
  };
  streamActive: boolean;
  stopStream?: () => void;
}

const TERMINAL_STATUSES = new Set<RunStatus>(['success', 'failed']);

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);
  private readonly runs = new Map<string, RunContext>();

  constructor(private readonly pythonRunsClient: PythonRunsClient) {}

  async startRun(dto: CreateRunDto): Promise<RunSummary> {
    const now = new Date();
    const createResponse = await this.pythonRunsClient.createRun(dto);
    const id = createResponse.id;

    let context = this.runs.get(id);
    if (!context) {
      context = {
        id,
        ticker: dto.ticker,
        tradeDate: dto.tradeDate,
        status: this.mapRemoteStatus(createResponse.status),
        createdAt: now,
        updatedAt: now,
        subject: new ReplaySubject<MessageEvent>(50),
        streamActive: false,
      };
      this.runs.set(id, context);
    } else {
      context.ticker = dto.ticker;
      context.tradeDate = dto.tradeDate;
      context.status = this.mapRemoteStatus(createResponse.status);
      context.updatedAt = now;
    }

    this.emit(context, {
      event: 'created',
      runId: id,
      status: context.status,
      timestamp: now.toISOString(),
    });

    this.ensureRemoteStream(context);

    return this.toSummary(context);
  }

  async getRun(id: string): Promise<RunSummary> {
    const context = await this.hydrateFromRemote(id);
    return this.toSummary(context);
  }

  stream(id: string): Observable<MessageEvent> {
    const context = this.runs.get(id);
    if (!context) {
      throw new NotFoundException(`Run ${id} was not found`);
    }

    this.ensureRemoteStream(context);
    return context.subject.asObservable();
  }

  private toSummary(context: RunContext): RunSummary {
    return {
      id: context.id,
      ticker: context.ticker,
      tradeDate: context.tradeDate,
      status: context.status,
      createdAt: context.createdAt.toISOString(),
      updatedAt: context.updatedAt.toISOString(),
      result: context.result,
      error: context.error,
    };
  }

  private ensureRemoteStream(context: RunContext): void {
    if (TERMINAL_STATUSES.has(context.status) || context.streamActive) {
      return;
    }

    context.stopStream?.();
    context.streamActive = true;

    context.stopStream = this.pythonRunsClient.streamRun(context.id, {
      onEvent: (event) => this.handleRemoteEvent(context, event),
      onError: (error) => this.handleRemoteError(context, error),
      onClose: () => this.handleRemoteClose(context),
    });
  }

  private handleRemoteEvent(context: RunContext, event: PythonRunEvent): void {
    const timestamp = event.timestamp ?? new Date().toISOString();
    const payload = event.payload ?? {};

    if (event.event === 'status') {
      const stateValue = typeof payload.state === 'string' ? payload.state : undefined;
      if (stateValue) {
        context.status = this.mapRemoteStatus(stateValue);
      }

      context.updatedAt = this.safeDate(timestamp);

      if (payload.result !== undefined) {
        context.result = payload.result;
      }

      if (payload.error) {
        context.error = {
          message: String(payload.error),
        };
      } else if (context.status !== 'failed') {
        context.error = undefined;
      }

      this.emit(context, {
        event: 'status',
        runId: context.id,
        status: context.status,
        payload,
        timestamp,
      });

      if (TERMINAL_STATUSES.has(context.status)) {
        void this.hydrateFromRemote(context.id)
          .catch((error) => {
            this.logger.error(`Failed to hydrate completed run ${context.id}`, error);
          })
          .finally(() => {
            this.complete(context);
          });
      }

      return;
    }

    this.emit(context, {
      event: event.event ?? 'message',
      runId: context.id,
      payload,
      timestamp,
    });
  }

  private handleRemoteError(context: RunContext, error: Error): void {
    this.logger.error(`Python stream error for run ${context.id}`, error);

    if (TERMINAL_STATUSES.has(context.status)) {
      return;
    }

    this.emit(context, {
      event: 'error',
      runId: context.id,
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    context.streamActive = false;

    const retry = setTimeout(() => {
      this.ensureRemoteStream(context);
    }, 1000);

    if (typeof (retry as NodeJS.Timeout).unref === 'function') {
      (retry as NodeJS.Timeout).unref();
    }
  }

  private handleRemoteClose(context: RunContext): void {
    if (TERMINAL_STATUSES.has(context.status)) {
      this.complete(context);
      return;
    }

    this.logger.warn(`Python stream closed for run ${context.id}, retrying connection`);
    context.streamActive = false;

    const retry = setTimeout(() => {
      this.ensureRemoteStream(context);
    }, 1000);

    if (typeof (retry as NodeJS.Timeout).unref === 'function') {
      (retry as NodeJS.Timeout).unref();
    }
  }

  private async hydrateFromRemote(id: string): Promise<RunContext> {
    let remote: PythonRunStatusResponse;
    try {
      remote = await this.pythonRunsClient.getRun(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('status 404')) {
        throw new NotFoundException(`Run ${id} was not found on the Python service`);
      }

      this.logger.error(`Failed to fetch run ${id} from Python service`, error as Error);

      const existing = this.runs.get(id);
      if (existing) {
        return existing;
      }

      throw error;
    }

    const context = this.getOrCreateContext(remote);
    this.updateContextFromRemote(context, remote);
    return context;
  }

  private getOrCreateContext(remote: PythonRunStatusResponse): RunContext {
    let context = this.runs.get(remote.id);
    if (!context) {
      context = {
        id: remote.id,
        ticker: remote.ticker,
        tradeDate: remote.trade_date,
        status: this.mapRemoteStatus(remote.status),
        createdAt: this.safeDate(remote.created_at),
        updatedAt: this.safeDate(remote.updated_at),
        subject: new ReplaySubject<MessageEvent>(50),
        streamActive: false,
      };
      this.runs.set(remote.id, context);
    }
    return context;
  }

  private updateContextFromRemote(context: RunContext, remote: PythonRunStatusResponse): void {
    context.ticker = remote.ticker;
    context.tradeDate = remote.trade_date;
    context.status = this.mapRemoteStatus(remote.status);
    context.createdAt = this.safeDate(remote.created_at);
    context.updatedAt = this.safeDate(remote.updated_at);
    context.result = remote.result;
    context.error = remote.error ? { message: remote.error } : undefined;
  }

  private mapRemoteStatus(status: string | undefined): RunStatus {
    switch ((status ?? '').toLowerCase()) {
      case 'running':
        return 'running';
      case 'success':
        return 'success';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private emit(context: RunContext, data: Record<string, unknown>): void {
    context.subject.next({ data });
  }

  private complete(context: RunContext): void {
    context.stopStream?.();
    context.stopStream = undefined;
    context.streamActive = false;

    if (!context.subject.closed) {
      context.subject.complete();
    }
  }

  private safeDate(value: string | undefined): Date {
    if (!value) {
      return new Date();
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return new Date();
    }

    return parsed;
  }
}
