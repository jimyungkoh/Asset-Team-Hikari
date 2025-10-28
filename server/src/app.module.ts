// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { RunsModule } from './runs/runs.module';

@Module({
  imports: [InfrastructureModule, RunsModule],
})
export class AppModule {}
