// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatReportType(reportType: string): string {
  const typeMap: Record<string, string> = {
    market: "시장 분석 리포트",
    market_report: "시장 분석 리포트",
    sentiment: "감성 분석 리포트",
    sentiment_report: "감성 분석 리포트",
    news: "뉴스 분석 리포트",
    news_report: "뉴스 분석 리포트",
    fundamentals: "기본 분석 리포트",
    fundamentals_report: "기본 분석 리포트",
    decision: "투자 의사결정 요약",
    investment_plan: "투자 계획",
    trader_investment_plan: "트레이더 투자 계획",
    final_trade_decision: "최종 거래 결정",
    result: "종합 리포트",
  };

  return typeMap[reportType] || reportType;
}
