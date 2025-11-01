// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Controller, Get, Param, UseGuards } from '@nestjs/common';

import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { DatabaseService } from '../infrastructure/database/database.service';

/**
 * 티커 및 런 날짜 조회를 담당하는 컨트롤러
 * ArtifactsService에서 분리하여 책임을 명확히 함
 */
@Controller('tickers')
@UseGuards(InternalAuthGuard)
export class TickersController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  async listTickers(): Promise<{ tickers: string[] }> {
    const tickers = await this.databaseService.listTickers();
    return { tickers };
  }

  @Get(':ticker/dates')
  async listRunDates(
    @Param('ticker') ticker: string,
  ): Promise<{ dates: string[] }> {
    const dates = await this.databaseService.listRunDates(ticker);
    return { dates };
  }
}
