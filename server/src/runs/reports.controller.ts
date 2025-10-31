// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import {
  Controller,
  Get,
  Param,
  Headers,
  BadRequestException,
} from "@nestjs/common";

import { ReportsService, ReportListItem, ReportDetail } from "./reports.service";
import { InternalAuthService } from "../common/internal-auth.service";

@Controller("reports")
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly authService: InternalAuthService,
  ) {}

  /**
   * GET /reports/tickers/:ticker
   * 특정 ticker의 모든 리포트 목록을 반환합니다.
   */
  @Get("tickers/:ticker")
  async listReportsByTicker(
    @Headers("x-internal-token") token: string | undefined,
    @Param("ticker") ticker: string,
  ): Promise<{ reports: ReportListItem[] }> {
    this.authService.verify(token);

    const reports = await this.reportsService.listByTicker(ticker);

    return { reports };
  }

  /**
   * GET /reports/:id
   * 특정 리포트의 상세 내용을 반환합니다.
   */
  @Get(":id")
  async getReportDetail(
    @Headers("x-internal-token") token: string | undefined,
    @Param("id") id: string,
  ): Promise<ReportDetail> {
    this.authService.verify(token);

    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      throw new BadRequestException("Invalid report ID");
    }

    return await this.reportsService.getDetail(reportId);
  }
}

