// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { surfaceClass } from "../../lib/design-system";
import { ROUTES } from "../../lib/constants";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface FormError {
  message: string;
}

interface CreateRunResponse {
  id?: string;
  error?: string;
  conflict?: boolean;
  ticker?: string;
  tradeDate?: string;
}

interface ReportsByDateResponse {
  reports: Array<{ status: string }>;
}

const defaultTradeDate = () => new Date().toISOString().slice(0, 10);

export function RunForm() {
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
      const detailPath = ROUTES.TICKERS.DATE_DETAIL(
        sanitizedTicker,
        payload.tradeDate
      );

      const existingResponse = await fetch(
        `/api/reports/tickers/${encodeURIComponent(
          sanitizedTicker
        )}/dates/${encodeURIComponent(payload.tradeDate)}`,
        {
          method: "GET",
        }
      );

      if (existingResponse.ok) {
        const data = (await existingResponse
          .json()
          .catch(() => ({}))) as ReportsByDateResponse;

        const hasCompleted = Array.isArray(data.reports)
          ? data.reports.some((report) => report.status === "success")
          : false;

        if (hasCompleted) {
          router.push(detailPath);
          return;
        }
      } else if (existingResponse.status !== 404) {
        const data = (await existingResponse
          .json()
          .catch(() => ({}))) as { error?: string };
        setError({
          message: data.error ?? "기존 리포트를 확인하는 데 실패했습니다.",
        });
        return;
      }

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

      if (response.status === 409 || body.conflict) {
        const conflictTicker = body.ticker ?? sanitizedTicker;
        const conflictDate = body.tradeDate ?? payload.tradeDate;
        router.push(ROUTES.TICKERS.DATE_DETAIL(conflictTicker, conflictDate));
        return;
      }

      if (!response.ok || !body.id) {
        setError({ message: body.error ?? "분석을 시작하지 못했습니다." });
        return;
      }

      router.push(detailPath);
    });
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Asset and Date Selection */}
        <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-3">
            <Label
              htmlFor="ticker"
              className="text-base font-semibold text-slate-700"
            >
              티커
            </Label>
            <Input
              id="ticker"
              placeholder="예: NVDA"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              disabled={isPending}
              required
              className="w-full h-14 text-lg px-4 py-3"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="tradeDate"
              className="text-base font-semibold text-slate-700"
            >
              기준일
            </Label>
            <Input
              id="tradeDate"
              type="date"
              value={tradeDate}
              onChange={(event) => setTradeDate(event.target.value)}
              disabled={isPending}
              required
              className="w-full h-14 text-lg px-4 py-3"
            />
          </div>
        </div>

        {/* Error Display */}
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="text-base font-medium">
              {error.message}
            </p>
          </div>
        ) : null}

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full lg:w-auto px-12 py-4 text-lg h-14 text-base font-semibold"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                <span>분석 준비 중...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xl">🚀</span>
                <span>분석 시작</span>
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}