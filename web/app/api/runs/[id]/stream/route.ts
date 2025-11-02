// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from "next/server";

import { auth } from "../../../../../lib/auth";

function getNestBase(): string {
  const base = process.env.NEST_API_BASE ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function GET(
  request: Request,
  context: any
): Promise<Response> {
  const params = await context.params;
  const id = (params.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
  }
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const internalToken = process.env.INTERNAL_API_TOKEN;
  const skipTokenAuth = process.env.SKIP_TOKEN_AUTH === "true";
  if (!internalToken && !skipTokenAuth) {
    return NextResponse.json(
      { error: "INTERNAL_API_TOKEN is not configured on Next.js server" },
      { status: 500 }
    );
  }

  const abortController = new AbortController();
  request.signal.addEventListener("abort", () => abortController.abort(), {
    once: true,
  });

  const upstream = await fetch(`${getNestBase()}/runs/${id}/stream`, {
    headers: {
      ...(internalToken ? { "X-Internal-Token": internalToken } : {}),
      Accept: "text/event-stream",
    },
    signal: abortController.signal,
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    const payload = await upstream.json().catch(() => ({
      error: `Failed to connect to upstream stream (${upstream.status})`,
    }));
    return NextResponse.json(payload, { status: upstream.status });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            controller.enqueue(value);
          }
        }
      } catch (error) {
        if (!(error instanceof DOMException) || error.name !== "AbortError") {
          throw error;
        }
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
    cancel() {
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked",
    },
  });
}
