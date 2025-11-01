// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { InternalAuthService } from '../common/internal-auth.service';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { ReportsController } from './presentation/reports.controller';
import { ReportsService } from './domain/reports.service';
import { ReportsRepository } from './infrastructure/reports.repository';

@Module({
  imports: [InfrastructureModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsRepository,
    InternalAuthService,
    InternalAuthGuard,
  ],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
