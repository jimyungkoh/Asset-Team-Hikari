// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { notFound } from "next/navigation";

import { Section } from "../../../components/design/section";
import { ReportContent } from "../../../components/reports/report-content";
import { auth } from "../../../lib/auth";
import { getNestBase, getInternalHeaders } from "../../../lib/api-helpers";
import { formatReportType, formatDate } from "../../../lib/date-utils";

interface ReportDetail {
  id: number;
  ticker: string;
  runDate: string;
  reportType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    notFound();
  }

  const response = await fetch(`${getNestBase()}/reports/${id}`, {
    headers: getInternalHeaders(),
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Failed to load report ${id}`);
  }

  const report = (await response.json()) as ReportDetail;

  return (
    <Section
      title={`${report.ticker} - ${formatReportType(report.reportType)}`}
      description={`${formatDate(report.runDate)} 분석 결과`}
      variant="soft"
    >
      <ReportContent report={report} />
    </Section>
  );
}

