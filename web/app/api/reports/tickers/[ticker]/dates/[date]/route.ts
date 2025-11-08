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
import {
  BackendApiError,
  backendApiService,
} from "@/lib/services/backend-api.service";

const handler = async (
  _request: Request,
  context: { params: Promise<{ ticker: string; date: string }> }
): Promise<Response> => {
  const params = await context.params;
  const normalizedTicker = (params.ticker ?? "").trim().toUpperCase();
  const runDate = (params.date ?? "").trim();

  if (!normalizedTicker || !runDate) {
    return NextResponse.json(
      { error: "ticker와 date 파라미터는 필수입니다." },
      { status: 400 }
    );
  }

  try {
    const reports = await backendApiService.getReportsByTickerAndDate(
      normalizedTicker,
      runDate
    );
    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    throw error;
  }
};

export const GET = composeMiddleware(withAuth, withErrorHandler)(handler);
