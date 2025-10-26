// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { notFound } from "next/navigation";

import { RunStream } from "../../../components/runs/run-stream";
import { PageShell } from "../../../components/design/page-shell";
import { Section } from "../../../components/design/section";
import { auth } from "../../../lib/auth";

interface RunSummary {
  id: string;
  status: "pending" | "running" | "success" | "failed";
  createdAt: string;
  updatedAt: string;
  ticker: string;
  tradeDate: string;
  result?: unknown;
  error?: {
    message: string;
    traceback?: string;
  };
}

function getNestBase(): string {
  const base = process.env.NEST_API_BASE ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
  const { id } = await params;
  const session = await auth();
  if (!session) {
    notFound();
  }

  const internalToken = process.env.INTERNAL_API_TOKEN;
  const skipTokenAuth = process.env.SKIP_TOKEN_AUTH === "true";
  if (!internalToken && !skipTokenAuth) {
    throw new Error(
      "INTERNAL_API_TOKEN must be configured in Next.js environment"
    );
  }

  const response = await fetch(`${getNestBase()}/runs/${id}`, {
    headers: internalToken ? { "X-Internal-Token": internalToken } : undefined,
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to load run ${id}: ${response.statusText}`);
  }

  const run = (await response.json()) as RunSummary;

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null}>
      <Section
        title={`런 ${run.id}`}
        description="실시간 스트리밍 로그와 최종 리포트를 확인하세요."
        variant="soft"
      >
        <RunStream run={run} />
      </Section>
    </PageShell>
  );
}
