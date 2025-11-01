// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from 'next/server';

import { backendApiService, BackendApiError } from '@/lib/services/backend-api.service';
import { withAuth, withErrorHandler, composeMiddleware } from '@/lib/middleware/auth.middleware';

// ============================================================
// POST /api/runs - Run 생성
// ============================================================

const handler = async (request: Request): Promise<Response> => {
  const body = await request.json();
  try {
    const run = await backendApiService.createRun(body);
    return NextResponse.json(run);
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 409) {
      const payload =
        (error.payload as
          | { ticker?: string; tradeDate?: string; message?: string }
          | undefined) ?? {};
      return NextResponse.json(
        {
          conflict: true,
          ticker: payload.ticker,
          tradeDate: payload.tradeDate,
          error: payload.message ?? error.message,
        },
        { status: 409 },
      );
    }
    throw error;
  }
};

export const POST = composeMiddleware(withAuth, withErrorHandler)(handler);
