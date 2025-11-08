// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/design/section";
import { MarkdownRenderer } from "@/components/markdown/markdown-renderer";
import { StatusBadge } from "@/components/reports/status-badge";
import { getInternalHeaders, getNestBase } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { surfaceClass } from "@/lib/design-system";
import type { ReportDetail } from "@/types/api";

interface ReportsByDateResponse {
  reports: ReportDetail[];
}

export default async function TickerDateDetailPage({
  params,
}: {
  params: Promise<{ ticker: string; date: string }>;
}) {
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
    <Section
      title={`${normalizedTicker} - ${formatDate(runDate)}`}
      description="자동 생성된 한국어 종합 리포트를 확인하세요."
      icon="📝"
    >
      {compositeReport ? (
        <article className={`${surfaceClass("base")} space-y-6 p-6 md:p-8 rounded-2xl`}>
          <MarkdownRenderer content={compositeReport.content} />
        </article>
      ) : (
        <div
          className={`${surfaceClass("soft")} p-6 md:p-10 text-center text-slate-600 rounded-xl`}
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
  );
}
