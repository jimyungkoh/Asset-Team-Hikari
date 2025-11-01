// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-01
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { surfaceClass } from "../../lib/design-system";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FormError {
  message: string;
}

interface CreateRunResponse {
  id?: string;
  error?: string;
}

const defaultTradeDate = () => new Date().toISOString().slice(0, 10);

export function RunForm(): JSX.Element {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [tradeDate, setTradeDate] = useState(defaultTradeDate());
  const [error, setError] = useState<FormError | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const sanitizedTicker = ticker.trim().toUpperCase();
    if (!sanitizedTicker) {
      setError({ message: "티커를 입력해주세요." });
      return;
    }

    if (!tradeDate.trim()) {
      setError({ message: "거래일을 선택해주세요." });
      return;
    }

    const payload = {
      ticker: sanitizedTicker,
      tradeDate: tradeDate.trim(),
    };

    startTransition(async () => {
      const response = await fetch("/api/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const body = (await response
        .json()
        .catch(() => ({}))) as CreateRunResponse;

      if (!response.ok || !body.id) {
        setError({ message: body.error ?? "분석을 시작하지 못했습니다." });
        return;
      }

      router.push(`/runs/${body.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <div className={surfaceClass("base") + " space-y-6 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                자산과 기준일
              </h2>
              <p className="text-sm text-slate-500">
                분석하고 싶은 티커와 기준일을 입력하세요. 나머지 설정은 자동으로 적용됩니다.
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="ticker"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  Ticker
                </Label>
                <Input
                  id="ticker"
                  placeholder="예: NVDA"
                  value={ticker}
                  onChange={(event) => setTicker(event.target.value)}
                  disabled={isPending}
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-[0_2px_8px_rgba(15,23,42,0.04)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="tradeDate"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  Trade Date
                </Label>
                <Input
                  id="tradeDate"
                  type="date"
                  value={tradeDate}
                  onChange={(event) => setTradeDate(event.target.value)}
                  disabled={isPending}
                  required
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm shadow-[0_2px_8px_rgba(15,23,42,0.04)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          <div className={surfaceClass("base") + " space-y-4 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                📋 기본 설정 (자동 적용)
              </h2>
              <p className="text-sm text-slate-500">
                아래 설정이 자동으로 적용됩니다. 변경이 필요한 경우 <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">server/config/run-template.json</code>을 수정하세요.
              </p>
            </header>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-2 py-2 border-b border-slate-100">
                <dt className="text-slate-500">AI 서비스</dt>
                <dd className="font-medium text-slate-900">OpenRouter</dd>
              </div>
              <div className="flex justify-between gap-2 py-2 border-b border-slate-100">
                <dt className="text-slate-500">빠른 분석 엔진</dt>
                <dd className="font-mono text-xs text-slate-700">deepseek/deepseek-v3.2-exp</dd>
              </div>
              <div className="flex justify-between gap-2 py-2 border-b border-slate-100">
                <dt className="text-slate-500">심층 분석 엔진</dt>
                <dd className="font-mono text-xs text-slate-700">deepseek/deepseek-r1-0528</dd>
              </div>
              <div className="flex justify-between gap-2 py-2 border-b border-slate-100">
                <dt className="text-slate-500">분석가 팀</dt>
                <dd className="text-right text-slate-700">시장, 소셜, 뉴스, 펀더멘털</dd>
              </div>
              <div className="flex justify-between gap-2 py-2 border-b border-slate-100">
                <dt className="text-slate-500">분석 강도</dt>
                <dd className="text-slate-700">심층 분석 (5회 검토)</dd>
              </div>
              <div className="flex justify-between gap-2 py-2">
                <dt className="text-slate-500">사고 깊이</dt>
                <dd className="text-slate-700">최대</dd>
              </div>
            </dl>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className={surfaceClass("glass") + " space-y-4 p-6"}>
            <h3 className="text-sm font-semibold text-slate-900">구성 요약</h3>
            <dl className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">티커</dt>
                <dd className="font-medium text-slate-900">
                  {ticker ? ticker.toUpperCase() : "입력 필요"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">거래일</dt>
                <dd className="font-medium text-slate-900">
                  {tradeDate || "선택 필요"}
                </dd>
              </div>
            </dl>
          </div>

          <div className={surfaceClass("glass") + " space-y-4 p-6"}>
            <h3 className="text-sm font-semibold text-slate-900">💡 참고</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>모든 설정은 <code className="bg-slate-100 px-1 py-0.5 rounded">run-template.json</code>에서 관리됩니다</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>실행 후 실시간 로그를 확인할 수 있습니다</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>완료 시 상세 리포트가 생성됩니다</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {error ? (
        <p className="text-sm font-medium text-red-500 animate-slide-up">
          {error.message}
        </p>
      ) : null}

      <div className="flex flex-col items-end gap-3 border-t border-white/30 pt-6 sm:flex-row sm:justify-between">
        <p className="text-xs text-slate-500">
          분석을 시작하면 실시간 진행 상황과 최종 리포트를 확인할 수 있습니다.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {isPending ? "분석 준비 중…" : "🚀 분석 시작"}
        </Button>
      </div>
    </form>
  );
}
