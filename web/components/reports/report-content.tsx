// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import Link from "next/link";
import { MarkdownRenderer } from "../markdown/markdown-renderer";
import { formatDate, formatDateTime, formatReportType } from "../../lib/date-utils";
import { surfaceClass } from "../../lib/design-system";
import { ROUTES } from "../../lib/constants";
import { StatusBadge } from "./status-badge";

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
        <MarkdownRenderer content={report.content} />
      </div>

      {/* 뒤로 가기 버튼 */}
      <Link
        href={ROUTES.TICKERS.DATE_DETAIL(report.ticker, report.runDate)}
        className="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        ← {report.ticker} {formatDate(report.runDate)} 리포트로 돌아가기
      </Link>
    </div>
  );
}
