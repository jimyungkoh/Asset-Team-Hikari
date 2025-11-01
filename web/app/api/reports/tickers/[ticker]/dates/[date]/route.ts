// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from "next/server";

import {
  backendApiService,
  BackendApiError,
} from "@/lib/services/backend-api.service";
import {
  withAuth,
  withErrorHandler,
  composeMiddleware,
} from "@/lib/middleware/auth.middleware";

const handler = async (
  _request: Request,
  context: { params: Promise<{ ticker: string; date: string }> },
): Promise<Response> => {
  const { ticker, date } = await context.params;
  const normalizedTicker = ticker.trim().toUpperCase();
  const runDate = date.trim();

  if (!normalizedTicker || !runDate) {
    return NextResponse.json(
      { error: "ticker와 date 파라미터는 필수입니다." },
      { status: 400 },
    );
  }

  try {
    const reports = await backendApiService.getReportsByTickerAndDate(
      normalizedTicker,
      runDate,
    );
    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof BackendApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
};

export const GET = composeMiddleware(withAuth, withErrorHandler)(handler);
