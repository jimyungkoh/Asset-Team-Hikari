// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { formatDate, formatDateTime, formatReportType } from "../../lib/date-utils";
import { surfaceClass } from "../../lib/design-system";

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

interface ReportContentProps {
  report: ReportDetail;
}

function StatusBadge({ status }: { status: string }) {
  const statusClass =
    status === "success"
      ? "bg-green-100 text-green-800"
      : status === "failed"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}
    >
      {status === "success" ? "성공" : status === "failed" ? "실패" : "진행중"}
    </span>
  );
}

export function ReportContent({ report }: ReportContentProps) {
  return (
    <div className="space-y-6">
      {/* 메타데이터 섹션 */}
      <div className={`${surfaceClass("base")} rounded-xl p-6`}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-600">Ticker</span>
            <p className="font-bold">{report.ticker}</p>
          </div>
          <div>
            <span className="text-sm text-slate-600">분석 날짜</span>
            <p className="font-bold">{formatDate(report.runDate)}</p>
          </div>
          <div>
            <span className="text-sm text-slate-600">상태</span>
            <div className="mt-1">
              <StatusBadge status={report.status} />
            </div>
          </div>
          <div>
            <span className="text-sm text-slate-600">생성 시간</span>
            <p className="text-sm">{formatDateTime(report.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* 리포트 콘텐츠 섹션 */}
      <div className={`${surfaceClass("base")} rounded-xl p-8`}>
        <h3 className="text-xl font-bold mb-4">
          {formatReportType(report.reportType)}
        </h3>
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </div>
      </div>

      {/* 뒤로 가기 버튼 */}
      <Link
        href={`/tickers/${report.ticker}/reports`}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        ← {report.ticker} 리포트 목록으로
      </Link>
    </div>
  );
}

