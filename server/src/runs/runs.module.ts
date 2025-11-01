// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InternalAuthService } from '../common/internal-auth.service';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { ArtifactsModule } from '../artifacts/artifacts.module';
import { RunConfigService } from './config/run-config.service';
import { RunService } from './domain/run.service';
import { RunRepository } from './infrastructure/run.repository';
import { PythonRunsClient } from './python-runs.client';
import { RunsController } from './presentation/runs.controller';
import { ReportsRepository } from '../reports/infrastructure/reports.repository';

@Module({
  imports: [ArtifactsModule],
  controllers: [RunsController],
  providers: [
    // Domain
    RunService,
    
    // Infrastructure
    RunRepository,
    PythonRunsClient,
    ReportsRepository,
    
    // Config
    RunConfigService,
    
    // Auth
    InternalAuthService,
    InternalAuthGuard,
  ],
  exports: [RunService],
})
export class RunsModule {}
