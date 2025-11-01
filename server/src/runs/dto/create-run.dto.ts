// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { IsDateString, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateRunDto {
  @IsString()
  readonly ticker!: string;

  @IsDateString()
  readonly tradeDate!: string;

  @IsOptional()
  @IsObject()
  readonly config?: Record<string, unknown>;
}
