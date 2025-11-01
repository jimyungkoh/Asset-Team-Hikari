// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Body, Controller, Get, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';

import { InternalAuthGuard } from '../../common/guards/internal-auth.guard';
import { CreateRunDto } from '../dto/create-run.dto';
import { RunService } from '../domain/run.service';
import { RunSummary } from '../run.types';

@Controller('runs')
@UseGuards(InternalAuthGuard)
export class RunsController {
  constructor(private readonly runService: RunService) {}

  @Post()
  async createRun(@Body() body: CreateRunDto): Promise<{ id: string }> {
    const run = await this.runService.startRun(body);
    return { id: run.id };
  }

  @Get(':id')
  async getRun(@Param('id') id: string): Promise<RunSummary> {
    return this.runService.getRun(id);
  }

  @Get(':id/stream')
  @Sse()
  streamRun(@Param('id') id: string): Observable<MessageEvent> {
    return this.runService.stream(id);
  }

  /**
   * 완료된 런의 아티팩트를 수동으로 재저장합니다.
   * 주로 디버깅이나 데이터 복구 용도로 사용됩니다.
   */
  @Post(':id/backfill')
  async backfillRun(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.runService.backfillRun(id);
    return { success: true };
  }
}