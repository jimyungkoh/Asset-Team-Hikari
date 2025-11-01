// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import Link from "next/link";
import { formatDate, formatReportType } from "../../lib/date-utils";
import { surfaceClass } from "../../lib/design-system";
import { StatusBadge } from "./status-badge";

interface ReportListItem {
  id: number;
  ticker: string;
  runDate: string;
  reportType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportsListProps {
  ticker: string;
  reports: ReportListItem[];
}

export function ReportsList({ ticker, reports }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <div className={`${surfaceClass("soft")} rounded-2xl p-8 text-center`}>
        <p className="text-slate-600">
          {ticker}에 대한 리포트가 아직 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Link
          key={report.id}
          href={`/reports/${report.id}`}
          className={`${surfaceClass("base")} rounded-xl p-6 block hover:shadow-lg transition-shadow`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">
                {formatReportType(report.reportType)}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {formatDate(report.runDate)}
              </p>
            </div>
            <StatusBadge status={report.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
