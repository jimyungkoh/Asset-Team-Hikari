// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from 'next/server';

import { backendApiService } from '@/lib/services/backend-api.service';
import {
  withAuth,
  withErrorHandler,
  composeMiddleware,
} from '@/lib/middleware/auth.middleware';

const handler = async (request: Request): Promise<Response> => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.trim() ?? '';

  if (!query) {
    return NextResponse.json({ tickers: [] });
  }

  const tickers = await backendApiService.searchTickers(query);
  return NextResponse.json({ tickers });
};

export const GET = composeMiddleware(withAuth, withErrorHandler)(handler);
