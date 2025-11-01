// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { InternalAuthService } from '../common/internal-auth.service';
import { InternalAuthGuard } from '../common/guards/internal-auth.guard';
import { TickersController } from './tickers.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [TickersController],
  providers: [InternalAuthService, InternalAuthGuard],
})
export class TickersModule {}
