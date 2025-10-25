// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Body, Controller, Get, Headers, Param, Post, Sse } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common/interfaces';
import { Observable } from 'rxjs';

import { InternalAuthService } from '../common/internal-auth.service';
import { CreateRunDto } from './dto/create-run.dto';
import { RunsService } from './runs.service';
import { RunSummary } from './run.types';

@Controller('runs')
export class RunsController {
  constructor(
    private readonly runsService: RunsService,
    private readonly authService: InternalAuthService,
  ) {}

  @Post()
  createRun(
    @Headers('x-internal-token') token: string | undefined,
    @Body() body: CreateRunDto,
  ): { id: string } {
    this.authService.verify(token);
    const run = this.runsService.startRun(body);
    return { id: run.id };
  }

  @Get(':id')
  getRun(
    @Headers('x-internal-token') token: string | undefined,
    @Param('id') id: string,
  ): RunSummary {
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
