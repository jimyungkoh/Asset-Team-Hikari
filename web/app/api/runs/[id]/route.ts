// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from 'next/server';

import { backendApiService } from '@/lib/services/backend-api.service';
import { withAuth, withErrorHandler, composeMiddleware } from '@/lib/middleware/auth.middleware';

// ============================================================
// GET /api/runs/[id] - Run 상세 조회
// ============================================================

const handler = async (
  _: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const { id } = await params;
  const run = await backendApiService.getRun(id);
  return NextResponse.json(run);
};

export const GET = composeMiddleware(withAuth, withErrorHandler)(handler);
