// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import Link from "next/link";
import { notFound } from "next/navigation";

import { Section } from "../../components/design/section";
import { surfaceClass } from "../../lib/design-system";
import { ROUTES } from "../../lib/constants";
import { auth } from "../../lib/auth";
import { getNestBase, getInternalHeaders } from "../../lib/api-helpers";

interface TickerListResponse {
  tickers: string[];
}

export default async function TickersPage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) {
    notFound();
  }

  const response = await fetch(`${getNestBase()}/tickers`, {
    headers: getInternalHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("티커 목록을 불러오는 데 실패했습니다.");
  }

  const { tickers } = (await response.json()) as TickerListResponse;

  return (
    <Section
      title="티커 목록"
      description="분석이 수행된 자산 목록입니다. 티커를 선택해 날짜별 리포트를 확인하세요."
      icon="📈"
    >
      {tickers.length === 0 ? (
        <div
          className={`${surfaceClass(
            "soft"
          )} rounded-2xl p-10 text-center text-slate-600`}
        >
          아직 저장된 티커가 없습니다. 홈에서 새로운 분석을 시작해보세요.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {tickers.map((ticker) => (
            <Link
              key={ticker}
              href={ROUTES.TICKERS.DETAIL(ticker)}
              className={`${surfaceClass(
                "base"
              )} rounded-2xl p-6 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-xl`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Ticker
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {ticker}
              </span>
              <span className="text-sm text-slate-600">
                최근 분석 기록과 일자별 리포트를 확인하세요.
              </span>
            </Link>
          ))}
        </div>
      )}
    </Section>
  );
}
