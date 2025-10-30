// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-26
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Body, Controller, Get, Headers, Param, Post, Sse } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';

import { InternalAuthService } from '../common/internal-auth.service';
import { ArtifactsService } from './artifacts.service';
import { CreateRunDto } from './dto/create-run.dto';
import { RunsService } from './runs.service';
import { RunSummary } from './run.types';

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService,
    private readonly authService: InternalAuthService,
    private readonly artifactsService: ArtifactsService,
  ) {}

  @Post()
  async createRun(
    @Headers('x-internal-token') token: string | undefined,
    @Body() body: CreateRunDto,
  ): Promise<{ id: string }> {
    this.authService.verify(token);
    const run = await this.runsService.startRun(body);
    return { id: run.id };
  }

  @Get('tickers')
  async listTickers(
    @Headers('x-internal-token') token: string | undefined,
  ): Promise<{ tickers: string[] }> {
    this.authService.verify(token);
    const tickers = await this.artifactsService.listTickers();
    return { tickers };
  }

  @Get(':ticker/dates')
  async listRunDates(
    @Headers('x-internal-token') token: string | undefined,
    @Param('ticker') ticker: string,
  ): Promise<{ dates: string[] }> {
    this.authService.verify(token);
    const dates = await this.artifactsService.listRunDates(ticker);
    return { dates };
  }

  @Get(':id')
  async getRun(
    @Headers('x-internal-token') token: string | undefined,
    @Param('id') id: string,
  ): Promise<RunSummary> {
    this.authService.verify(token);
    return this.runsService.getRun(id);
  }

  @Get(':id/stream')
  @Sse()
  streamRun(
    @Headers('x-internal-token') token: string | undefined,
    @Param('id') id: string,
  ): Observable<MessageEvent> {
    this.authService.verify(token);
    return this.runsService.stream(id);
  }
}
