// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export type RunStatus = 'pending' | 'running' | 'success' | 'failed';

export interface RunSummary {
  id: string;
  ticker: string;
  tradeDate: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  result?: unknown;
  error?: {
    message: string;
    traceback?: string;
  };
}
