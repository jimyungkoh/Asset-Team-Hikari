// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from "next/server";

import {
  composeMiddleware,
  withAuth,
  withErrorHandler,
} from "@/lib/middleware/auth.middleware";
import { backendApiService } from "@/lib/services/backend-api.service";

// ============================================================
// GET /api/runs/[id] - Run 상세 조회
// ============================================================

const handler = async (
  _: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> => {
  const params = await context.params;
  const id = (params.id ?? "").trim();

  if (!id) {
    return NextResponse.json({ error: "Run ID is required." }, { status: 400 });
  }

  const run = await backendApiService.getRun(id);
  return NextResponse.json(run);
};

export const GET = composeMiddleware(withAuth, withErrorHandler)(handler);
