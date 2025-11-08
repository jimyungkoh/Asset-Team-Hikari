// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";

// ============================================================
// Auth Middleware
// ============================================================

export function withAuth<
  T extends { params: Promise<Record<string, string | string[] | undefined>> }
>(handler: (request: Request, context: T) => Promise<Response>) {
  return async (request: Request, context: T): Promise<Response> => {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.UNAUTHORIZED },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    return handler(request, context);
  };
}

// ============================================================
// Error Handler Middleware
// ============================================================

export function withErrorHandler<
  T extends { params: Promise<Record<string, string | string[] | undefined>> }
>(handler: (request: Request, context: T) => Promise<Response>) {
  return async (request: Request, context: T): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("[API Error]", error);

      const message =
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

      return NextResponse.json(
        { error: message },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  };
}

// ============================================================
// Compose Middleware
// ============================================================

export function composeMiddleware<
  T extends { params: Promise<Record<string, string | string[] | undefined>> }
>(
  ...middlewares: Array<
    (
      handler: (request: Request, context: T) => Promise<Response>
    ) => (request: Request, context: T) => Promise<Response>
  >
) {
  return (handler: (request: Request, context: T) => Promise<Response>) => {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    );
  };
}
