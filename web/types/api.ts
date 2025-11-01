// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { z } from 'zod';

// ============================================================
// Common API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================
// Run Related Types
// ============================================================

export const RunStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export type RunStatus = z.infer<typeof RunStatusSchema>;

export interface Run {
  id: string;
  ticker: string;
  tradeDate: string;
  status: RunStatus;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface RunStreamEvent {
  type: 'progress' | 'log' | 'error' | 'complete';
  timestamp: string;
  data: unknown;
}

// ============================================================
// Report Related Types
// ============================================================

export interface Report {
  id: string;
  runId: string;
  ticker: string;
  tradeDate: string;
  content: string;
  createdAt: string;
}

// ============================================================
// Auth Related Types
// ============================================================

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  allowed: boolean;
}
