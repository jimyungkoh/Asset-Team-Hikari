// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InternalAuthService } from '../common/internal-auth.service';
import { ArtifactsService } from './artifacts.service';
import { PythonRunsClient } from './python-runs.client';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  controllers: [RunsController],
  providers: [RunsService, ArtifactsService, InternalAuthService, PythonRunsClient],
  exports: [ArtifactsService],
})
export class RunsModule {}
