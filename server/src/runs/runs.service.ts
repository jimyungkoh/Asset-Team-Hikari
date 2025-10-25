// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import { resolve } from 'path';
import { Observable, ReplaySubject } from 'rxjs';

import { CreateRunDto } from './dto/create-run.dto';
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
}

@Injectable()
export class RunsService {
  private readonly logger = new Logger(RunsService.name);
  private readonly runs = new Map<string, RunContext>();
  private readonly stdoutBuffers = new Map<string, string>();

  startRun(dto: CreateRunDto): RunSummary {
    const id = randomUUID();
    const now = new Date();

    const subject = new ReplaySubject<MessageEvent>(50);
    const context: RunContext = {
      id,
      ticker: dto.ticker,
      tradeDate: dto.tradeDate,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      subject,
    };

    this.runs.set(id, context);
    subject.next({
      data: {
        event: 'created',
        runId: id,
        status: context.status,
        timestamp: now.toISOString(),
      },
    });

    this.launchRunProcess(context, dto);

    return this.toSummary(context);
  }

  getRun(id: string): RunSummary {
    const context = this.runs.get(id);
    if (!context) {
      throw new NotFoundException(`Run ${id} was not found`);
    }

    return this.toSummary(context);
  }

  stream(id: string): Observable<MessageEvent> {
    const context = this.runs.get(id);
    if (!context) {
      throw new NotFoundException(`Run ${id} was not found`);
    }
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

  private launchRunProcess(context: RunContext, dto: CreateRunDto): void {
    const repoRoot = process.env.PROJECT_ROOT
      ? resolve(process.env.PROJECT_ROOT)
      : resolve(process.cwd(), '../TradingAgents');
    const runnerPath = process.env.PYTHON_RUNNER_PATH
      ? resolve(process.env.PYTHON_RUNNER_PATH)
      : resolve(repoRoot, 'tradingagents/runner/run_graph.py');
    const pythonBin = process.env.PYTHON_BIN ?? 'python3';

    const args = [runnerPath, '--ticker', dto.ticker, '--date', dto.tradeDate];
    if (dto.config) {
      args.push('--config', JSON.stringify(dto.config));
    }

    this.logger.log(`Starting run ${context.id} for ${dto.ticker} on ${dto.tradeDate}`);

    const child = spawn(pythonBin, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        PYTHONUNBUFFERED: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    context.status = 'running';
    context.updatedAt = new Date();
    context.subject.next({
      data: {
        event: 'spawned',
        runId: context.id,
        status: context.status,
        timestamp: context.updatedAt.toISOString(),
      },
    });

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      this.handleStdout(context, chunk);
    });

    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      const message = chunk.trim();
      if (message) {
        this.logger.warn(`[${context.id}] ${message}`);
        context.subject.next({
          data: {
            event: 'stderr',
            runId: context.id,
            message,
            timestamp: new Date().toISOString(),
          },
        });
      }
    });

    child.on('close', (code) => {
      this.logger.log(`Run ${context.id} closed with code ${code}`);
      if (context.status === 'running') {
        if (code === 0) {
          context.status = 'success';
        } else {
          context.status = 'failed';
          if (!context.error) {
            context.error = {
              message: `Process exited with code ${code}`,
            };
          }
        }
        context.updatedAt = new Date();
        context.subject.next({
          data: {
            event: 'terminated',
            runId: context.id,
            status: context.status,
            exitCode: code,
            timestamp: context.updatedAt.toISOString(),
          },
        });
        context.subject.complete();
      }
    });

    child.on('error', (error) => {
      this.logger.error(`Failed to start python process for run ${context.id}`, error);
      context.status = 'failed';
      context.error = {
        message: error.message,
      };
      context.updatedAt = new Date();
      context.subject.next({
        data: {
          event: 'error',
          runId: context.id,
          message: error.message,
          timestamp: context.updatedAt.toISOString(),
        },
      });
      context.subject.complete();
    });
  }

  private handleStdout(context: RunContext, chunk: string): void {
    const buffer = (this.stdoutBuffers.get(context.id) ?? '') + chunk;
    const lines = buffer.split('\n');
    const remainder = lines.pop() ?? '';
    this.stdoutBuffers.set(context.id, remainder);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      this.dispatchPythonEvent(context, trimmed);
    }
  }

  private dispatchPythonEvent(context: RunContext, rawLine: string): void {
    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(rawLine);
    } catch (error) {
      this.logger.error(`Failed to parse runner output for run ${context.id}: ${rawLine}`, error as Error);
      context.subject.next({
        data: {
          event: 'parse_error',
          runId: context.id,
          raw: rawLine,
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    const event: Record<string, unknown> = {
      runId: context.id,
      ...payload,
    };
    const timestamp = new Date().toISOString();
    if (typeof event.timestamp !== 'string') {
      event.timestamp = timestamp;
    }

    if (event['event'] === 'complete') {
      context.status = 'success';
      context.result = event['result'];
      context.updatedAt = new Date();
      event.status = context.status;
      context.subject.next({
        data: event,
      });
      context.subject.complete();
      return;
    }

    if (event['event'] === 'error') {
      context.status = 'failed';
      context.error = {
        message: typeof event['message'] === 'string' ? (event['message'] as string) : 'Runner error',
        traceback: typeof event['traceback'] === 'string' ? (event['traceback'] as string) : undefined,
      };
      context.updatedAt = new Date();
      event.status = context.status;
      context.subject.next({
        data: event,
      });
      context.subject.complete();
      return;
    }

    context.updatedAt = new Date();
    event.status = context.status;
    context.subject.next({
      data: event,
    });
  }
}
