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
import { DailyReportSections } from "@/components/reports/daily-report-sections";
import { formatDate } from "@/lib/date-utils";
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

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null}>
      <Section
        title={`${normalizedTicker} - ${formatDate(runDate)}`}
        description="분석 팀이 준비한 세부 리포트를 확인하세요."
        icon="📝"
      >
        <DailyReportSections
          ticker={normalizedTicker}
          runDate={runDate}
          reports={reports}
        />
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
