// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { TickerArtifactDto, TickerRunSummaryDto } from "../dto/ticker-artifact.dto";

export interface TickerArtifact extends Record<string, unknown> {
  tickerDate: string;
  artifactKey: string;
  ticker: string;
  runDate: string;
  artifactNamespace: string;
  content: string;
  contentSize: number;
  contentType?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TickerRunSummary extends Record<string, unknown> {
  tickerDate: string;
  artifactKey: string;
  ticker: string;
  runDate: string;
  runId: string;
  status: string;
  result?: Record<string, unknown> | null;
  error?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactsServiceInterface {
  saveArtifact(dto: TickerArtifactDto): Promise<TickerArtifact>;
  saveRunSummary(dto: TickerRunSummaryDto): Promise<TickerRunSummary>;
  getArtifactsByTickerAndDate(ticker: string, runDate: string): Promise<TickerArtifact[]>;
  listTickers(): Promise<string[]>;
  listRunDates(ticker: string): Promise<string[]>;
}
