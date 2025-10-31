// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";

import { DynamoDbService } from "../infrastructure/dynamodb/dynamodb.service";
import { DatabaseService } from "../infrastructure/database/database.service";
import { TickerArtifactDto, TickerRunSummaryDto } from "./dto/ticker-artifact.dto";
import { ReportsRepository } from "./reports.repository";

export interface TickerArtifact extends Record<string, unknown> {
  tickerDate: string; // PK: <TICKER>#<YYYY-MM-DD>
  artifactKey: string; // SK: <artifactNamespace>#<identifier>
  ticker: string; // GSI_TickerHistory PK
  runDate: string; // GSI_RunDate PK
  artifactNamespace: string;
  content: string;
  contentSize: number;
  contentType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TickerRunSummary extends Record<string, unknown> {
  tickerDate: string; // PK: <TICKER>#<YYYY-MM-DD>
  artifactKey: string; // SK: "summary#<runId>"
  ticker: string; // GSI_TickerHistory PK
  runDate: string; // GSI_RunDate PK
  runId: string;
  status: string;
  result?: Record<string, unknown>;
  error?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ArtifactsService {
  private readonly logger = new Logger(ArtifactsService.name);
  private readonly tableName: string;

  constructor(
    private readonly dynamoDbService: DynamoDbService,
    private readonly databaseService: DatabaseService,
    private readonly reportsRepository: ReportsRepository,
  ) {
    this.tableName =
      process.env.DYNAMODB_TABLE_NAME ?? "TickerDailyArtifacts";

    this.logger.log(`ArtifactsService initialized: table=${this.tableName}`);
  }

  /**
   * 아티팩트를 DynamoDB에 저장합니다.
   * @param dto 아티팩트 DTO
   * @returns 저장된 아티팩트 정보
   */
  async saveArtifact(dto: TickerArtifactDto): Promise<TickerArtifact> {
    const tickerDate = `${dto.ticker}#${dto.runDate}`;
    const now = new Date().toISOString();

    const artifact: TickerArtifact = {
      tickerDate,
      artifactKey: dto.artifactKey,
      ticker: dto.ticker,
      runDate: dto.runDate,
      artifactNamespace: dto.artifactNamespace,
      content: dto.content,
      contentSize: dto.contentSize,
      contentType: dto.contentType,
      metadata: dto.metadata,
      createdAt: now,
      updatedAt: now,
    };

    // 1. DynamoDB에 저장 (primary)
    await this.dynamoDbService.putItem({
      tableName: this.tableName,
      item: artifact,
    });

    // 2. PostgreSQL에 메타데이터 저장 (secondary, best-effort)
    await this.saveReportMetadataSafe(dto);

    // 3. ticker_runs 기록
    await this.recordTickerRunSafe(dto.ticker, dto.runDate);

    this.logger.log(
      `Artifact saved: ${dto.artifactKey} (${dto.contentSize} bytes)`
    );

    return artifact;
  }

  /**
   * 런 요약 정보를 저장합니다.
   * @param dto 런 요약 DTO
   */
  async saveRunSummary(dto: TickerRunSummaryDto): Promise<TickerRunSummary> {
    const tickerDate = `${dto.ticker}#${dto.runDate}`;
    const artifactKey = `summary#${dto.runId}`;
    const now = new Date().toISOString();

    const summary: TickerRunSummary = {
      tickerDate,
      artifactKey,
      ticker: dto.ticker,
      runDate: dto.runDate,
      runId: dto.runId,
      status: dto.status,
      result: dto.result,
      error: dto.error,
      durationSeconds: dto.durationSeconds,
      metadata: dto.metadata,
      createdAt: now,
      updatedAt: now,
    };

    await this.dynamoDbService.putItem({
      tableName: this.tableName,
      item: summary,
    });

    await this.recordTickerRunSafe(dto.ticker, dto.runDate);

    this.logger.log(
      `Run summary saved: ${tickerDate}/${artifactKey} (status: ${dto.status})`
    );

    return summary;
  }

  /**
   * 특정 티커의 특정 날짜의 아티팩트들을 조회합니다.
   * @param ticker 티커 심볼
   * @param runDate 실행 날짜 (YYYY-MM-DD)
   * @returns 아티팩트 목록
   */
  async getArtifactsByTickerAndDate(
    ticker: string,
    runDate: string
  ): Promise<TickerArtifact[]> {
    const tickerDate = `${ticker}#${runDate}`;

    const items = await this.dynamoDbService.queryItems<TickerArtifact>({
      tableName: this.tableName,
      keyConditionExpression: "tickerDate = :tickerDate",
      expressionAttributeValues: {
        ":tickerDate": tickerDate,
        ":summaryPrefix": "summary#",
      },
      filterExpression: "NOT begins_with(artifactKey, :summaryPrefix)",
    });

    return items;
  }

  async listTickers(): Promise<string[]> {
    try {
      return await this.databaseService.listTickers();
    } catch (error) {
      this.logger.error("Failed to list tickers from database", error as Error);
      return [];
    }
  }

  async listRunDates(ticker: string): Promise<string[]> {
    try {
      return await this.databaseService.listRunDates(ticker);
    } catch (error) {
      this.logger.error(
        `Failed to list run dates for ticker ${ticker}`,
        error as Error,
      );
      return [];
    }
  }

  /**
   * PostgreSQL에 리포트 메타데이터를 안전하게 저장합니다.
   * 실패 시 로그만 남기고 예외를 던지지 않습니다.
   */
  private async saveReportMetadataSafe(dto: TickerArtifactDto): Promise<void> {
    try {
      // artifactNamespace가 "reports"인 경우만 처리
      if (dto.artifactNamespace !== "reports") {
        return;
      }

      // artifactKey에서 reportType 추출
      // 예: "reports#market_report" → "market_report"
      const reportType = dto.artifactKey.split("#")[1] || "unknown";

      await this.reportsRepository.upsert({
        ticker: dto.ticker,
        runDate: dto.runDate,
        dynamoTickerDate: `${dto.ticker}#${dto.runDate}`,
        dynamoArtifactKey: dto.artifactKey,
        status: "success",
        reportType,
      });

      this.logger.log(
        `Report metadata saved: ${dto.ticker}/${dto.runDate}/${reportType}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to save report metadata for ${dto.ticker}/${dto.runDate}`,
        error as Error
      );
      // 예외를 던지지 않음 - best-effort
    }
  }

  private async recordTickerRunSafe(ticker: string, runDate: string): Promise<void> {
    try {
      await this.databaseService.recordTickerRun(ticker, runDate);
    } catch (error) {
      this.logger.error(
        `Failed to record ticker run for ${ticker} ${runDate}`,
        error as Error,
      );
    }
  }
}
