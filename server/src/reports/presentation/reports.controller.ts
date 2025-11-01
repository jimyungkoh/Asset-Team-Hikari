// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import {
  Controller,
  Get,
  Param,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";

import { InternalAuthGuard } from "../../common/guards/internal-auth.guard";
import { ReportsService, ReportListItem, ReportDetail } from "../domain/reports.service";

@Controller("reports")
@UseGuards(InternalAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /reports/tickers/:ticker
   * 특정 ticker의 모든 리포트 목록을 반환합니다.
   */
  @Get("tickers/:ticker")
  async listReportsByTicker(
    @Param("ticker") ticker: string,
  ): Promise<{ reports: ReportListItem[] }> {
    const reports = await this.reportsService.listByTicker(ticker);
    return { reports };
  }

  /**
   * GET /reports/:id
   * 특정 리포트의 상세 내용을 반환합니다.
   */
  @Get(":id")
  async getReportDetail(@Param("id") id: string): Promise<ReportDetail> {
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      throw new BadRequestException("Invalid report ID");
    }

    return await this.reportsService.getDetail(reportId);
  }
}