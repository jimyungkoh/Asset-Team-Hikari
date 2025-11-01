// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger, NotFoundException } from "@nestjs/common";

import {
  ReportsRepository,
  ReportMetadata,
} from "../infrastructure/reports.repository";
import { DynamoDbService } from "../../infrastructure/dynamodb/dynamodb.service";
import { normalizeReportContent } from "../../common/utils/content-normalizer";

export interface ReportListItem {
  id: number;
  ticker: string;
  runDate: string;
  reportType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDetail extends ReportListItem {
  content: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly tableName: string;

  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly dynamoDbService: DynamoDbService,
  ) {
    this.tableName = process.env.DYNAMODB_TABLE_NAME ?? "TickerDailyArtifacts";
  }

  /**
   * 특정 ticker의 모든 리포트 목록을 반환합니다.
   */
  async listByTicker(ticker: string): Promise<ReportListItem[]> {
    const metadata = await this.reportsRepository.findByTicker(ticker);

    return metadata.map((m) => ({
      id: m.id,
      ticker: m.ticker,
      runDate: m.runDate,
      reportType: m.reportType,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));
  }

  /**
   * 특정 리포트의 상세 내용을 반환합니다.
   */
  async getDetail(reportId: number): Promise<ReportDetail> {
    // 1. PostgreSQL에서 메타데이터 조회
    const metadata = await this.reportsRepository.findById(reportId);
    if (!metadata) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    return this.buildReportDetail(metadata);
  }

  /**
   * 특정 ticker와 날짜에 해당하는 리포트 상세 목록을 반환합니다.
   */
  async listDetailsByTickerAndDate(
    ticker: string,
    runDate: string
  ): Promise<ReportDetail[]> {
    const metadataList = await this.reportsRepository.findByTickerAndDate(
      ticker,
      runDate
    );

    if (metadataList.length === 0) {
      return [];
    }

    const details = await Promise.all(
      metadataList.map(async (metadata) => {
        try {
          return await this.buildReportDetail(metadata);
        } catch (error) {
          if (error instanceof NotFoundException) {
            this.logger.warn(
              `Report content missing for ${metadata.ticker} ${metadata.runDate} (${metadata.id})`
            );
            return null;
          }
          throw error;
        }
      })
    );

    return details.filter(
      (report): report is ReportDetail => report !== null
    );
  }

  private async buildReportDetail(
    metadata: ReportMetadata
  ): Promise<ReportDetail> {
    const artifact = await this.dynamoDbService.getItem<{
      content?: string | null;
      contentType?: string | null;
      metadata?: Record<string, unknown>;
    }>({
      tableName: this.tableName,
      key: {
        tickerDate: metadata.dynamoTickerDate,
        artifactKey: metadata.dynamoArtifactKey,
      },
    });

    if (!artifact) {
      this.logger.warn(
        `Report content not found in DynamoDB for report ${metadata.id}`
      );
      throw new NotFoundException(
        `Report content not found for report ${metadata.id}`
      );
    }

    return {
      id: metadata.id,
      ticker: metadata.ticker,
      runDate: metadata.runDate,
      reportType: metadata.reportType,
      status: metadata.status,
      createdAt: metadata.createdAt.toISOString(),
      updatedAt: metadata.updatedAt.toISOString(),
      content: normalizeReportContent(artifact.content),
      contentType: artifact.contentType ?? "text/markdown",
      metadata: artifact.metadata,
    };
  }
}
