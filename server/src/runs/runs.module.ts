// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InternalAuthService } from '../common/internal-auth.service';
import { ArtifactsService } from './artifacts.service';
import { RunConfigService } from './config/run-config.service';
import { PythonRunsClient } from './python-runs.client';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  controllers: [RunsController, ReportsController],
  providers: [
    RunsService,
    RunConfigService,
    ArtifactsService,
    InternalAuthService,
    PythonRunsClient,
    ReportsRepository,
    ReportsService,
  ],
  exports: [ArtifactsService],
})
export class RunsModule {}
