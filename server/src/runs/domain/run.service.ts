// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { Observable, ReplaySubject } from 'rxjs';

import { CreateRunDto } from '../dto/create-run.dto';
import { RunStatus, RunSummary } from '../run.types';
import { RunRepository } from '../infrastructure/run.repository';
import { RunConfigService } from '../config/run-config.service';
import { ArtifactsService } from '../../artifacts/infrastructure/artifacts.service';
import { ReportsRepository } from '../../reports/infrastructure/reports.repository';
import { ReportsService } from '../../reports/domain/reports.service';
import { ReportSummaryService } from '../../reports/domain/report-summary.service';
import { stringifyStructuredContent } from '../../common/utils/content-normalizer';

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
  persisted: boolean;
  stopStream?: () => void;
}

const TERMINAL_STATUSES = new Set<RunStatus>(['success', 'failed']);

@Injectable()
export class RunService {
  private readonly logger = new Logger(RunService.name);
  private readonly runs = new Map<string, RunContext>();

  constructor(
    private readonly runRepository: RunRepository,
    private readonly runConfigService: RunConfigService,
    private readonly artifactsService: ArtifactsService,
    private readonly reportsRepository: ReportsRepository,
    private readonly reportsService: ReportsService,
    private readonly reportSummaryService: ReportSummaryService,
  ) {}

  async startRun(dto: CreateRunDto): Promise<RunSummary> {
    const normalizedTicker = dto.ticker.trim().toUpperCase();
    const normalizedTradeDate = dto.tradeDate.trim();

    const inFlight = [...this.runs.values()].find(
      (context) =>
        context.ticker === normalizedTicker &&
        context.tradeDate === normalizedTradeDate &&
        !TERMINAL_STATUSES.has(context.status),
    );

    if (inFlight) {
      this.logger.log(
        `Skipping run for ${normalizedTicker} ${normalizedTradeDate} (run ${inFlight.id} in progress)`,
      );
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Run already in progress for ${normalizedTicker} on ${normalizedTradeDate}`,
        ticker: normalizedTicker,
        tradeDate: normalizedTradeDate,
      });
    }

    const existingReports =
      await this.reportsRepository.findByTickerAndDate(
        normalizedTicker,
        normalizedTradeDate,
      );

    const successfulMetadata = existingReports.filter(
      (metadata) => metadata.status === 'success',
    );
    let hasCompletedReport = false;

    if (successfulMetadata.length > 0) {
      try {
        const detailedReports =
          await this.reportsService.listDetailsByTickerAndDate(
            normalizedTicker,
            normalizedTradeDate,
          );

        hasCompletedReport = detailedReports.some((report) => {
          if (report.status !== 'success') {
            return false;
          }

          const content =
            typeof report.content === 'string' ? report.content.trim() : '';
          return content.length > 0;
        });

        if (!hasCompletedReport) {
          this.logger.warn(
            `Report metadata exists without accessible content for ${normalizedTicker} ${normalizedTradeDate}; rerun will be allowed.`,
          );
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to verify existing reports for ${normalizedTicker} ${normalizedTradeDate}: ${message}`,
        );
        hasCompletedReport = true;
      }
    }

    if (hasCompletedReport) {
      this.logger.log(
        `Skipping run for ${normalizedTicker} ${normalizedTradeDate} (reports already exist)`,
      );
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: `Reports already exist for ${normalizedTicker} on ${normalizedTradeDate}`,
        ticker: normalizedTicker,
        tradeDate: normalizedTradeDate,
      });
    }

    const now = new Date();

    // 템플릿 config 병합
    const config = this.runConfigService.buildRunConfig(
      normalizedTicker,
      normalizedTradeDate,
    );
    const enrichedDto = {
      ...dto,
      ticker: normalizedTicker,
      tradeDate: normalizedTradeDate,
      config,
    };

    const createResponse = await this.runRepository.createRun(enrichedDto);
    const id = createResponse.id;

    let context = this.runs.get(id);
    if (!context) {
      context = {
        id,
        ticker: normalizedTicker,
        tradeDate: normalizedTradeDate,
        status: this.mapRemoteStatus(createResponse.status),
        createdAt: now,
        updatedAt: now,
        subject: new ReplaySubject<MessageEvent>(50),
        streamActive: false,
        persisted: false,
      };
      this.runs.set(id, context);
    } else {
      context.ticker = normalizedTicker;
      context.tradeDate = normalizedTradeDate;
      context.status = this.mapRemoteStatus(createResponse.status);
      context.updatedAt = now;
      context.persisted = false;
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

    context.stopStream = this.runRepository.streamRun(context.id, {
      onEvent: (event: any) => this.handleRemoteEvent(context, event),
      onError: (error: Error) => this.handleRemoteError(context, error),
      onClose: () => this.handleRemoteClose(context),
    });
  }

  private handleRemoteEvent(context: RunContext, event: any): void {
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
          .then((latest) => this.persistRunArtifacts(latest))
          .catch((error) => {
            this.logger.error(`Failed to hydrate completed run ${context.id}`, error as Error);
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
    let remote: any;
    try {
      remote = await this.runRepository.getRun(id);
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

  private getOrCreateContext(remote: any): RunContext {
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
        persisted: false,
      };
      this.runs.set(remote.id, context);
    } else if (typeof context.persisted === 'undefined') {
      context.persisted = false;
    }
    return context;
  }

  private updateContextFromRemote(context: RunContext, remote: any): void {
    context.ticker = remote.ticker;
    context.tradeDate = remote.trade_date;
    context.status = this.mapRemoteStatus(remote.status);
    context.createdAt = this.safeDate(remote.created_at);
    context.updatedAt = this.safeDate(remote.updated_at);
    context.result = remote.result;
    context.error = remote.error ? { message: remote.error } : undefined;
  }

  async backfillRun(runId: string): Promise<void> {
    const context = await this.hydrateFromRemote(runId);
    await this.persistRunArtifacts(context);
  }

  private async persistRunArtifacts(context: RunContext): Promise<void> {
    if (context.persisted) {
      return;
    }
    context.persisted = true;

    if (!context.tradeDate) {
      this.logger.warn(`Run ${context.id} is missing trade date; skipping artifact persistence.`);
      return;
    }

    const resultRecord = this.asRecord(context.result);
    const durationSeconds = this.extractDurationSeconds(resultRecord);
    const metadata = this.extractSummaryMetadata(resultRecord);

    try {
      await this.artifactsService.saveRunSummary({
        ticker: context.ticker,
        runDate: context.tradeDate,
        runId: context.id,
        status: context.status,
        result: resultRecord,
        error: context.error?.message,
        durationSeconds,
        metadata,
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist run summary for ${context.ticker} ${context.tradeDate} (${context.id})`,
        error as Error,
      );
    }

    if (!resultRecord) {
      return;
    }

    const artifacts = await this.buildArtifactsFromResult(context, resultRecord);
    for (const artifact of artifacts) {
      try {
        await this.artifactsService.saveArtifact(artifact);
      } catch (error) {
        this.logger.error(
          `Failed to persist artifact ${artifact.artifactKey} for ${context.ticker} ${context.tradeDate}`,
          error as Error,
        );
      }
    }
  }

  private async buildArtifactsFromResult(
    context: RunContext,
    result: Record<string, unknown>,
  ): Promise<Parameters<ArtifactsService['saveArtifact']>[0][]> {
    const artifacts: Parameters<ArtifactsService['saveArtifact']>[0][] = [];
    const runDate = context.tradeDate;
    const ticker = context.ticker;
    const reportsContent: Record<string, string> = {};

    const addArtifact = (namespace: string, key: string, value: unknown): void => {
      const content = this.toContentString(value);
      if (!content) {
        return;
      }
      const artifactKey = `${namespace}#${key}`;
      artifacts.push({
        ticker,
        runDate,
        artifactNamespace: namespace,
        artifactKey,
        content,
        contentSize: Buffer.byteLength(content, 'utf8'),
        metadata: {
          runId: context.id,
          status: context.status,
        },
      });

      if (namespace === 'reports') {
        reportsContent[key] = content;
      }
    };

    addArtifact('reports', 'decision', result['decision']);
    addArtifact('reports', 'final_trade_decision', result['final_trade_decision']);
    addArtifact('plans', 'investment_plan', result['investment_plan']);
    addArtifact('plans', 'trader_investment_plan', result['trader_investment_plan']);

    const reports = this.asRecord(result['reports']);
    if (reports) {
      for (const [section, value] of Object.entries(reports)) {
        addArtifact('reports', section, value);
      }
    }

    const summaryLanguage = this.reportSummaryService.getDefaultLanguage();
    const decisionContent =
      reportsContent['decision'] ?? this.toContentString(result['decision']) ?? null;
    const finalDecisionContent =
      reportsContent['final_trade_decision'] ??
      this.toContentString(result['final_trade_decision']) ??
      null;

    const summary = await this.reportSummaryService.generateCompositeReport({
      ticker,
      runDate,
      language: summaryLanguage,
      decision: decisionContent,
      finalDecision: finalDecisionContent,
      sections: {
        market: reportsContent['market'] ?? null,
        sentiment: reportsContent['sentiment'] ?? null,
        news: reportsContent['news'] ?? null,
        fundamentals: reportsContent['fundamentals'] ?? null,
        decision: decisionContent,
        final_trade_decision: finalDecisionContent,
      },
    });

    if (summary?.content) {
      const language = summary.language || summaryLanguage;
      const artifactKey = `reports#result#${language}`;
      artifacts.push({
        ticker,
        runDate,
        artifactNamespace: 'reports',
        artifactKey,
        content: summary.content,
        contentSize: Buffer.byteLength(summary.content, 'utf8'),
        metadata: {
          runId: context.id,
          status: context.status,
          summaryLanguage: language,
        },
      });
    }

    return artifacts;
  }

  private asRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    return value as Record<string, unknown>;
  }

  private toContentString(value: unknown): string | null {
    if (value === null || typeof value === 'undefined') {
      return null;
    }
    const stringified =
      typeof value === 'string'
        ? value
        : stringifyStructuredContent(value);
    const trimmed = stringified.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private extractDurationSeconds(result: Record<string, unknown> | undefined): number | undefined {
    if (!result) {
      return undefined;
    }
    const value = result['duration_seconds'] ?? result['durationSeconds'];
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  }

  private extractSummaryMetadata(result: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!result) {
      return undefined;
    }
    const metadata: Record<string, unknown> = {};
    const fields: Array<[string, unknown]> = [
      ['log_path', result['log_path']],
      ['project_dir', result['project_dir']],
      ['started_at', result['started_at']],
      ['completed_at', result['completed_at']],
    ];
    for (const [key, value] of fields) {
      if (typeof value === 'string' && value.trim()) {
        metadata[key] = value;
      }
    }
    return Object.keys(metadata).length > 0 ? metadata : undefined;
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
