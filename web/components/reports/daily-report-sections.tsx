// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import ReactMarkdown from "react-markdown";

import type { ReportDetail } from "@/types/api";
import { surfaceClass } from "@/lib/design-system";
import {
  formatDate,
  formatDateTime,
  formatReportType,
} from "@/lib/date-utils";

import { StatusBadge } from "./status-badge";

interface DailyReportSectionsProps {
  ticker: string;
  runDate: string;
  reports: ReportDetail[];
}

function resolveSummaryStatus(reports: ReportDetail[]): string {
  if (reports.some((report) => report.status === "success")) {
    return "success";
  }
  if (reports.some((report) => report.status === "failed")) {
    return "failed";
  }
  return reports.length > 0 ? reports[0].status : "pending";
}

export function DailyReportSections({
  ticker,
  runDate,
  reports,
}: DailyReportSectionsProps): JSX.Element {
  if (reports.length === 0) {
    return (
      <div
        className={`${surfaceClass(
          "soft"
        )} rounded-2xl p-10 text-center text-slate-600`}
      >
        {formatDate(runDate)} 분석 리포트가 아직 준비되지 않았습니다. 잠시 후
        새로고침하거나 나중에 다시 확인해주세요.
      </div>
    );
  }

  const summaryStatus = resolveSummaryStatus(reports);

  return (
    <div className="space-y-10">
      <div className={`${surfaceClass("base")} rounded-2xl p-8`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {ticker}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              {formatDate(runDate)} 분석 리포트
            </h2>
          </div>
          <StatusBadge status={summaryStatus} />
        </div>
        <p className="mt-4 text-sm text-slate-600">
          총 {reports.length}개의 리포트가 준비되었습니다. 아래에서 상세 내용을
          확인하세요.
        </p>
      </div>

      <div className="space-y-8">
        {reports.map((report) => (
          <article
            key={report.id}
            className={`${surfaceClass("base")} rounded-2xl p-8 space-y-4`}
          >
            <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  {formatReportType(report.reportType)}
                </h3>
                <p className="text-xs text-slate-500">
                  생성: {formatDateTime(report.createdAt)} · 업데이트:{" "}
                  {formatDateTime(report.updatedAt)}
                </p>
              </div>
              <StatusBadge status={report.status} />
            </header>

            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{report.content}</ReactMarkdown>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
