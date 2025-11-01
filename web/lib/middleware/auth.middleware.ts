// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authConfig } from '@/auth.config';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants';

// ============================================================
// Auth Middleware
// ============================================================

export function withAuth(
  handler: (request: Request, context?: unknown) => Promise<Response>
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
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

export function withErrorHandler(
  handler: (request: Request, context?: unknown) => Promise<Response>
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('[API Error]', error);

      const message =
        error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

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

export function composeMiddleware(
  ...middlewares: Array<
    (
      handler: (request: Request, context?: unknown) => Promise<Response>
    ) => (request: Request, context?: unknown) => Promise<Response>
  >
) {
  return (handler: (request: Request, context?: unknown) => Promise<Response>) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
