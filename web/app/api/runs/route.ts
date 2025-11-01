// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from 'next/server';

import { backendApiService } from '@/lib/services/backend-api.service';
import { withAuth, withErrorHandler, composeMiddleware } from '@/lib/middleware/auth.middleware';

// ============================================================
// POST /api/runs - Run 생성
// ============================================================

const handler = async (request: Request): Promise<Response> => {
  const body = await request.json();
  const run = await backendApiService.createRun(body);
  return NextResponse.json(run);
};

export const POST = composeMiddleware(withAuth, withErrorHandler)(handler);
