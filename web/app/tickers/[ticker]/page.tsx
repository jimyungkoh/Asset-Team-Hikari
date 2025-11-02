// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "@/components/design/section";
import { getInternalHeaders, getNestBase } from "@/lib/api-helpers";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/date-utils";
import { surfaceClass } from "@/lib/design-system";
import type { ReportListItem } from "@/types/api";

interface ReportsResponse {
  reports: ReportListItem[];
}

interface DateGroup {
  runDate: string;
  reports: ReportListItem[];
  total: number;
  status: "success" | "failed" | "pending";
  lastUpdated: string;
}

function toGroupStatus(status: string): DateGroup["status"] {
  if (status === "success") {
    return "success";
  }
  if (status === "failed") {
    return "failed";
  }
  return "pending";
}

function groupReportsByDate(reports: ReportListItem[]): DateGroup[] {
  const groups = new Map<string, DateGroup>();

  for (const report of reports) {
    const existing = groups.get(report.runDate);
    const reportStatus = toGroupStatus(report.status);

    if (!existing) {
      groups.set(report.runDate, {
        runDate: report.runDate,
        reports: [report],
        total: 1,
        status: reportStatus,
        lastUpdated: report.updatedAt,
      });
    } else {
      existing.reports.push(report);
      existing.total += 1;
      if (report.updatedAt > existing.lastUpdated) {
        existing.lastUpdated = report.updatedAt;
      }
      if (reportStatus === "success") {
        existing.status = "success";
      } else if (existing.status !== "success" && reportStatus === "failed") {
        existing.status = "failed";
      }
    }
  }

  const result = Array.from(groups.values());
  result.sort((a, b) => b.runDate.localeCompare(a.runDate));
  return result;
}

function renderStatusLabel(status: DateGroup["status"]): string {
  switch (status) {
    case "success":
      return "완료";
    case "failed":
      return "실패";
    default:
      return "진행 중";
  }
}

function statusBadgeClass(status: DateGroup["status"]): string {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export default async function TickerDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<JSX.Element> {
  const { ticker } = await params;
  const normalizedTicker = ticker.trim().toUpperCase();

  const session = await auth();
  if (!session) {
    notFound();
  }

  const response = await fetch(
    `${getNestBase()}/reports/tickers/${encodeURIComponent(normalizedTicker)}`,
    {
      headers: getInternalHeaders(),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`${normalizedTicker} 리포트를 불러오지 못했습니다.`);
  }

  const { reports } = (await response.json()) as ReportsResponse;
  const grouped = groupReportsByDate(reports);

  return (
    <Section
      title={`${normalizedTicker} 분석 기록`}
      description="날짜를 선택해 해당 일자의 상세 리포트를 확인하세요."
      icon="🗂️"
    >
      {grouped.length === 0 ? (
        <div
          className={`${surfaceClass(
            "soft"
          )} rounded-2xl p-10 text-center text-slate-600`}
        >
          아직 {normalizedTicker}에 대한 분석 리포트가 없습니다. 새로운 분석을
          시작하면 이곳에서 날짜별로 확인할 수 있습니다.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {grouped.map((group) => (
            <Link
              key={group.runDate}
              href={ROUTES.TICKERS.DATE_DETAIL(normalizedTicker, group.runDate)}
              className={`${surfaceClass(
                "base"
              )} rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {formatDate(group.runDate)}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(
                    group.status
                  )}`}
                >
                  {renderStatusLabel(group.status)}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                리포트가 준비되었습니다.
              </p>
              <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-blue-600">
                상세 리포트 보기 →
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
