// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-26
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from '@nestjs/common';
import { IncomingMessage, RequestOptions, request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

import { CreateRunDto } from './dto/create-run.dto';

interface PythonRunCreateResponse {
  id: string;
  status: string;
}

export interface PythonRunStatusResponse {
  id: string;
  ticker: string;
  trade_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  result?: unknown;
  error?: string | null;
}

export interface PythonRunEvent {
  id?: string;
  event?: string;
  timestamp?: string;
  payload?: Record<string, unknown>;
}

interface StreamHandlers {
  onEvent: (event: PythonRunEvent) => void;
  onError: (error: Error) => void;
  onClose: () => void;
}

@Injectable()
export class PythonRunsClient {
  private readonly logger = new Logger(PythonRunsClient.name);
  private readonly baseUrl: URL;
  private readonly internalToken: string | undefined;

  constructor() {
    const baseUrl = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000';
    try {
      this.baseUrl = new URL(baseUrl);
    } catch {
      throw new Error(`Invalid PYTHON_SERVICE_URL: ${baseUrl}`);
    }

    this.internalToken = process.env.INTERNAL_API_TOKEN;
  }

  async createRun(dto: CreateRunDto): Promise<PythonRunCreateResponse> {
    const body = JSON.stringify({
      ticker: dto.ticker,
      trade_date: dto.tradeDate,
      config: dto.config ?? undefined,
    });

    return this.request<PythonRunCreateResponse>('POST', '/runs', body);
  }

  async getRun(runId: string): Promise<PythonRunStatusResponse> {
    return this.request<PythonRunStatusResponse>('GET', `/runs/${runId}`);
  }

  streamRun(runId: string, handlers: StreamHandlers): () => void {
    const url = new URL(`/runs/${runId}/stream`, this.baseUrl);
    const isHttps = url.protocol === 'https:';
    const requestOptions: RequestOptions = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: `${url.pathname}${url.search}`,
      headers: {
        Accept: 'text/event-stream',
        Connection: 'keep-alive',
        ...this.buildAuthHeader(),
      },
    };

    const req = (isHttps ? httpsRequest : httpRequest)(requestOptions, (res) => {
      this.handleStreamResponse(res, handlers);
    });

    req.on('error', (error) => {
      handlers.onError(error);
    });

    req.end();

    return () => {
      req.destroy();
    };
  }

  private handleStreamResponse(res: IncomingMessage, handlers: StreamHandlers): void {
    if (res.statusCode && res.statusCode >= 400) {
      const error = new Error(`Python service stream responded with status ${res.statusCode}`);
      handlers.onError(error);
      res.resume();
      return;
    }

    res.setEncoding('utf8');

    let buffer = '';
    res.on('data', (chunk: string) => {
      buffer += chunk;

      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';

      for (const rawEvent of events) {
        const parsed = this.parseSseEvent(rawEvent);
        if (parsed) {
          handlers.onEvent(parsed);
        }
      }
    });

    res.on('end', () => {
      handlers.onClose();
    });

    res.on('close', () => {
      handlers.onClose();
    });

    res.on('error', (error: Error) => {
      handlers.onError(error);
    });
  }

  private parseSseEvent(rawEvent: string): PythonRunEvent | undefined {
    const lines = rawEvent.split('\n');
    const dataLines: string[] = [];
    let eventName: string | undefined;
    let eventId: string | undefined;

    for (const line of lines) {
      if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trim());
      } else if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('id:')) {
        eventId = line.slice(3).trim();
      }
    }

    if (dataLines.length === 0) {
      return {
        id: eventId,
        event: eventName,
      };
    }

    try {
      const parsed = JSON.parse(dataLines.join('\n')) as Record<string, unknown>;
      return {
        id: eventId,
        event: typeof parsed.event === 'string' ? parsed.event : eventName,
        timestamp: typeof parsed.timestamp === 'string' ? parsed.timestamp : undefined,
        payload: this.ensureRecord(parsed.payload),
      };
    } catch (error) {
      this.logger.warn(`Failed to parse SSE data: ${(error as Error).message}`);
      return undefined;
    }
  }

  private ensureRecord(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
    return undefined;
  }

  private async request<T>(method: string, path: string, body?: string): Promise<T> {
    const url = new URL(path, this.baseUrl);
    const isHttps = url.protocol === 'https:';
    const options: RequestOptions = {
      method,
      hostname: url.hostname,
      port: url.port ? Number(url.port) : isHttps ? 443 : 80,
      path: `${url.pathname}${url.search}`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.buildAuthHeader(),
      },
    };

    return new Promise<T>((resolve, reject) => {
      const transport = isHttps ? httpsRequest : httpRequest;
      const req = transport(options, (res) => {
        this.consumeResponse<T>(res, resolve, reject);
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (body) {
        req.setHeader('Content-Length', Buffer.byteLength(body));
        req.write(body);
      }

      req.end();
    });
  }

  private consumeResponse<T>(res: IncomingMessage, resolve: (value: T) => void, reject: (error: Error) => void): void {
    const statusCode = res.statusCode ?? 0;
    const chunks: string[] = [];

    res.setEncoding('utf8');
    res.on('data', (chunk: string) => {
      chunks.push(chunk);
    });

    res.on('end', () => {
      const rawBody = chunks.join('');

      if (statusCode >= 400) {
        reject(new Error(`Python service responded with status ${statusCode}: ${rawBody}`));
        return;
      }

      if (!rawBody) {
        // @ts-expect-error - allow resolving empty bodies (e.g., 204)
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(rawBody) as T);
      } catch (error) {
        reject(new Error(`Failed to parse Python service response: ${(error as Error).message}`));
      }
    });

    res.on('error', (error: Error) => {
      reject(error);
    });
  }

  private buildAuthHeader(): Record<string, string> {
    if (!this.internalToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${this.internalToken}`,
    };
  }
}
