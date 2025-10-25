// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Module } from '@nestjs/common';

import { RunsModule } from './runs/runs.module';

@Module({
  imports: [RunsModule],
})
export class AppModule {}
