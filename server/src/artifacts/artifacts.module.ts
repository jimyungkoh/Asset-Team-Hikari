// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ReportsModule } from '../reports/reports.module';
import { ArtifactsService } from './infrastructure/artifacts.service';

@Module({
  imports: [InfrastructureModule, ReportsModule],
  providers: [ArtifactsService],
  exports: [ArtifactsService],
})
export class ArtifactsModule {}
