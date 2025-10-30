// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class TickerArtifactDto {
  @IsString()
  readonly ticker!: string;

  @IsString()
  readonly runDate!: string; // YYYY-MM-DD

  @IsString()
  readonly artifactKey!: string; // artifactNamespace#identifier

  @IsString()
  readonly artifactNamespace!: string; // 예: "reports", "logs"

  @IsString()
  readonly content!: string; // 콘텐츠 본문

  @IsNumber()
  readonly contentSize!: number; // 바이트 단위

  @IsOptional()
  @IsString()
  readonly contentType?: string;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;
}

export class TickerRunSummaryDto {
  @IsString()
  readonly ticker!: string;

  @IsString()
  readonly runDate!: string; // YYYY-MM-DD

  @IsString()
  readonly runId!: string;

  @IsString()
  readonly status!: string; // "success", "failed", "running"

  @IsOptional()
  @IsObject()
  readonly result?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  readonly error?: string;

  @IsOptional()
  @IsNumber()
  readonly durationSeconds?: number;

  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, unknown>;
}

