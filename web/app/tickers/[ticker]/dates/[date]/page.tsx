// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";

import type { ReportDetail } from "@/types/api";
import { PageShell } from "@/components/design/page-shell";
import { Section } from "@/components/design/section";
import { StatusBadge } from "@/components/reports/status-badge";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { surfaceClass } from "@/lib/design-system";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { ROUTES } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { getNestBase, getInternalHeaders } from "@/lib/api-helpers";

interface ReportsByDateResponse {
  reports: ReportDetail[];
}

export default async function TickerDateDetailPage({
  params,
}: {
  params: Promise<{ ticker: string; date: string }>;
}): Promise<JSX.Element> {
  const { ticker, date } = await params;
  const normalizedTicker = ticker.trim().toUpperCase();
  const runDate = date.trim();

  const session = await auth();
  if (!session) {
    notFound();
  }

  const response = await fetch(
    `${getNestBase()}/reports/tickers/${encodeURIComponent(
      normalizedTicker
    )}/dates/${encodeURIComponent(runDate)}`,
    {
      headers: getInternalHeaders(),
      cache: "no-store",
    }
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      `${normalizedTicker} ${runDate} 리포트를 불러오지 못했습니다.`
    );
  }

  const { reports } = (await response.json()) as ReportsByDateResponse;
  const compositeReport =
    reports.find(
      (report) =>
        report.reportType === "reports#result#ko" ||
        report.metadata?.artifactKey === "reports#result#ko"
    ) ??
    reports.find(
      (report) =>
        report.reportType === "result" &&
        (report.metadata?.summaryLanguage === "ko" ||
          report.metadata?.language === "ko")
    );

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null}>
      <Section
        title={`${normalizedTicker} - ${formatDate(runDate)}`}
        description="자동 생성된 한국어 종합 리포트를 확인하세요."
        icon="📝"
      >
        {compositeReport ? (
          <article
            className={`${surfaceClass(
              "base"
            )} space-y-6 p-8`}
          >
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {normalizedTicker}
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {formatDate(runDate)} 종합 리포트 (KO)
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  생성: {formatDateTime(compositeReport.createdAt)} · 업데이트:{" "}
                  {formatDateTime(compositeReport.updatedAt)}
                </p>
              </div>
              <StatusBadge status={compositeReport.status} />
            </header>

            <MarkdownRenderer content={compositeReport.content} />
          </article>
        ) : (
          <div
            className={`${surfaceClass(
              "soft"
            )} p-10 text-center text-slate-600`}
          >
            {formatDate(runDate)} 기준의 한국어 종합 리포트가 아직 준비되지
            않았습니다.
          </div>
        )}
        <div className="mt-12">
          <Link
            href={ROUTES.TICKERS.DETAIL(normalizedTicker)}
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← 날짜 목록으로 돌아가기
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
