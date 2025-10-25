// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { NextResponse } from "next/server";

import { auth } from "../../../../lib/auth";

function getNestBase(): string {
  const base = process.env.NEST_API_BASE ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
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

  const response = await fetch(`${getNestBase()}/runs/${id}`, {
    headers: {
      ...(internalToken ? { "X-Internal-Token": internalToken } : {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}
