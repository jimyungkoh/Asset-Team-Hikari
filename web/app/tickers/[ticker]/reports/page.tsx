// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { notFound } from "next/navigation";

import { PageShell } from "../../../../components/design/page-shell";
import { Section } from "../../../../components/design/section";
import { ReportsList } from "../../../../components/reports/reports-list";
import { auth } from "../../../../lib/auth";
import { getNestBase, getInternalHeaders } from "../../../../lib/api-helpers";

interface ReportListItem {
  id: number;
  ticker: string;
  runDate: string;
  reportType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default async function TickerReportsPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<JSX.Element> {
  const { ticker } = await params;
  const session = await auth();

  if (!session) {
    notFound();
  }

  const response = await fetch(
    `${getNestBase()}/reports/tickers/${ticker}`,
    {
      headers: getInternalHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to load reports for ${ticker}`);
  }

  const { reports } = (await response.json()) as {
    reports: ReportListItem[];
  };

  return (
    <PageShell authenticatedEmail={session.user?.email ?? null}>
      <Section
        title={`${ticker} 리포트 목록`}
        description="과거 분석 결과를 확인하세요."
        variant="soft"
      >
        <ReportsList ticker={ticker} reports={reports} />
      </Section>
    </PageShell>
  );
}

