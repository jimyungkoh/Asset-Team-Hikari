// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './auth/auth.module';
import { RunsModule } from './runs/runs.module';
import { ArtifactsModule } from './artifacts/artifacts.module';
import { ReportsModule } from './reports/reports.module';
import { TickersModule } from './tickers/tickers.module';

@Module({
  imports: [
    InfrastructureModule, 
    AuthModule, 
    RunsModule,
    ArtifactsModule,
    ReportsModule,
    TickersModule,
  ],
})
export class AppModule {}