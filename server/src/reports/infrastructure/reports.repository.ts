// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import { asc, desc, eq, and } from "drizzle-orm";

import { DatabaseService } from "../../infrastructure/database/database.service";
import { reports } from "../../infrastructure/database/schema";

export interface ReportMetadata {
  id: number;
  ticker: string;
  runDate: string;
  dynamoTickerDate: string;
  dynamoArtifactKey: string;
  status: string;
  reportType: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ReportsRepository {
  private readonly logger = new Logger(ReportsRepository.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * 리포트 메타데이터를 저장하거나 업데이트합니다.
   */
  async upsert(params: {
    ticker: string;
    runDate: string;
    dynamoTickerDate: string;
    dynamoArtifactKey: string;
    status: string;
    reportType: string;
  }): Promise<ReportMetadata> {
    if (!this.databaseService.isEnabled) {
      throw new Error("Database is not enabled");
    }

    const db = this.databaseService.db;
    if (!db) {
      throw new Error("Database connection is not available");
    }

    const now = new Date();

    const [result] = await db
      .insert(reports)
      .values({
        ticker: params.ticker.toUpperCase(),
        runDate: params.runDate,
        dynamoTickerDate: params.dynamoTickerDate,
        dynamoArtifactKey: params.dynamoArtifactKey,
        status: params.status,
        reportType: params.reportType,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [reports.ticker, reports.runDate, reports.reportType],
        set: {
          status: params.status,
          dynamoTickerDate: params.dynamoTickerDate,
          dynamoArtifactKey: params.dynamoArtifactKey,
          updatedAt: now,
        },
      })
      .returning();

    return result;
  }

  /**
   * 특정 ticker의 모든 리포트 메타데이터를 조회합니다.
   */
  async findByTicker(ticker: string): Promise<ReportMetadata[]> {
    if (!this.databaseService.isEnabled) {
      return [];
    }

    const db = this.databaseService.db;
    if (!db) {
      return [];
    }

    const normalizedTicker = ticker.toUpperCase();

    return await db
      .select()
      .from(reports)
      .where(eq(reports.ticker, normalizedTicker))
      .orderBy(desc(reports.runDate), asc(reports.reportType));
  }

  /**
   * 리포트 ID로 메타데이터를 조회합니다.
   */
  async findById(reportId: number): Promise<ReportMetadata | null> {
    if (!this.databaseService.isEnabled) {
      return null;
    }

    const db = this.databaseService.db;
    if (!db) {
      return null;
    }

    const [result] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    return result ?? null;
  }

  /**
   * 특정 ticker와 runDate의 리포트들을 조회합니다.
   */
  async findByTickerAndDate(
    ticker: string,
    runDate: string
  ): Promise<ReportMetadata[]> {
    if (!this.databaseService.isEnabled) {
      return [];
    }

    const db = this.databaseService.db;
    if (!db) {
      return [];
    }

    const normalizedTicker = ticker.toUpperCase();

    return await db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.ticker, normalizedTicker),
          eq(reports.runDate, runDate)
        )
      )
      .orderBy(asc(reports.reportType));
  }
}