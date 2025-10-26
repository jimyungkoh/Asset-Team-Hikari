// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-28
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import { surfaceClass } from "../../lib/design-system";
import {
  ANALYST_OPTIONS,
  PROVIDER_OPTIONS,
  RESEARCH_DEPTH_OPTIONS,
  buildRunRequest,
  getProviderById,
  type AnalystIdentifier,
  type ProviderOption,
  type RunDraft,
  type ThinkingSettings,
} from "../../lib/run-config";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

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
  const [selectedAnalysts, setSelectedAnalysts] = useState<AnalystIdentifier[]>(
    () => ANALYST_OPTIONS.map((option) => option.id)
  );
  const [researchDepthId, setResearchDepthId] = useState<
    "shallow" | "medium" | "deep"
  >("medium");
  const [providerId, setProviderId] = useState<ProviderOption["id"]>("openai");
  const [quickModel, setQuickModel] = useState<string>("");
  const [deepModel, setDeepModel] = useState<string>("");
  const [thinking, setThinking] = useState<ThinkingSettings | undefined>();
  const [advancedOverrides, setAdvancedOverrides] = useState("");
  const [error, setError] = useState<FormError | null>(null);
  const [isPending, startTransition] = useTransition();

  const provider = useMemo(() => getProviderById(providerId), [providerId]);
  const researchDepth = useMemo(() => {
    return (
      RESEARCH_DEPTH_OPTIONS.find((option) => option.id === researchDepthId) ??
      RESEARCH_DEPTH_OPTIONS[1]
    );
  }, [researchDepthId]);
  const isThinkingEditable = provider.id === "openrouter";

  useEffect(() => {
    const nextQuick =
      provider.defaultQuickModel ?? provider.quickModels[0]?.value ?? "";
    const nextDeep =
      provider.defaultDeepModel ?? provider.deepModels[0]?.value ?? "";
    setQuickModel(nextQuick);
    setDeepModel(nextDeep);
    setThinking(provider.defaultThinking);
  }, [provider]);

  const previewConfig = useMemo(() => {
    const previewDraft: RunDraft = {
      ticker: ticker.trim() ? ticker.trim().toUpperCase() : "TICKER",
      tradeDate: tradeDate.trim() || defaultTradeDate(),
      analysts: selectedAnalysts,
      researchDepth,
      provider,
      quickModel:
        quickModel ||
        provider.defaultQuickModel ||
        provider.quickModels[0]?.value ||
        "",
      deepModel:
        deepModel ||
        provider.defaultDeepModel ||
        provider.deepModels[0]?.value ||
        "",
      thinking: isThinkingEditable ? thinking : undefined,
    };

    const payload = buildRunRequest(previewDraft);
    const configCopy = { ...payload.config };
    const metadata = configCopy.metadata as Record<string, unknown> | undefined;
    if (metadata) {
      metadata.preparedAt = "<실행 시점에 주입>";
    }
    return configCopy;
  }, [
    ticker,
    tradeDate,
    selectedAnalysts,
    researchDepth,
    provider,
    quickModel,
    deepModel,
    thinking,
    isThinkingEditable,
  ]);

  function toggleAnalyst(id: AnalystIdentifier) {
    setSelectedAnalysts((current) => {
      const exists = current.includes(id);
      const next = exists
        ? current.filter((item) => item !== id)
        : [...current, id];
      return ANALYST_OPTIONS.filter((option) => next.includes(option.id)).map(
        (option) => option.id
      );
    });
  }

  function ensureThinking(partial: Partial<ThinkingSettings>) {
    setThinking((current) => {
      const base = current ??
        provider.defaultThinking ?? {
          enableThinkingMode: false,
          thinkingEffort: "medium",
          thinkingEffortQuick: "medium",
          thinkingEffortDeep: "medium",
        };
      return { ...base, ...partial };
    });
  }

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

    if (selectedAnalysts.length === 0) {
      setError({ message: "최소 한 명 이상의 애널리스트를 선택해야 합니다." });
      return;
    }

    if (!quickModel || !deepModel) {
      setError({ message: "빠른 LLM과 심층 LLM 모델을 모두 선택해주세요." });
      return;
    }

    let parsedOverrides: Record<string, unknown> | undefined;
    if (advancedOverrides.trim()) {
      try {
        const json = JSON.parse(advancedOverrides);
        if (json && typeof json === "object" && !Array.isArray(json)) {
          parsedOverrides = json as Record<string, unknown>;
        } else {
          setError({ message: "추가 설정은 JSON 객체 형태여야 합니다." });
          return;
        }
      } catch (parseError) {
        setError({ message: "추가 설정 JSON을 파싱하지 못했습니다." });
        return;
      }
    }

    const draft: RunDraft = {
      ticker: sanitizedTicker,
      tradeDate: tradeDate.trim(),
      analysts: selectedAnalysts,
      researchDepth,
      provider,
      quickModel,
      deepModel,
      thinking: isThinkingEditable ? thinking : undefined,
    };

    const payload = buildRunRequest(draft, parsedOverrides);

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
        setError({ message: body.error ?? "런 실행을 시작하지 못했습니다." });
        return;
      }

      router.push(`/runs/${body.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="flex flex-col gap-8">
          <div className={surfaceClass("base") + " space-y-6 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                자산과 기준일
              </h2>
              <p className="text-sm text-slate-500">
                분석하고 싶은 티커와 기준일을 입력하세요.
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

          <div className={surfaceClass("base") + " space-y-6 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                📊 애널리스트 팀
              </h2>
              <p className="text-sm text-slate-500">
                Hikari CLI와 동일하게 필요한 분석 팀을 선택하세요. 최소 한 명
                이상이 필요합니다.
              </p>
            </header>
            <div className="grid gap-3 sm:grid-cols-2">
              {ANALYST_OPTIONS.map((option) => {
                const checked = selectedAnalysts.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleAnalyst(option.id)}
                    disabled={isPending}
                    className={[
                      "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
                      checked
                        ? "border-blue-400 bg-blue-50/80 backdrop-blur text-blue-900 shadow-md"
                        : "border-white/30 bg-white/40 backdrop-blur text-slate-600 hover:border-blue-200 hover:bg-blue-50/40",
                    ].join(" ")}
                  >
                    <span className="text-sm font-semibold">{option.name}</span>
                    <span className="text-xs text-slate-500">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={surfaceClass("base") + " space-y-6 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                ⚙️ 연구 심도와 모델 스택
              </h2>
              <p className="text-sm text-slate-500">
                연구 라운드와 사용할 LLM 모델을 구성합니다.
              </p>
            </header>

            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Research Depth
              </span>
              <div className="inline-flex rounded-full bg-white/50 backdrop-blur border border-white/30 p-1">
                {RESEARCH_DEPTH_OPTIONS.map((option) => {
                  const selected = option.id === researchDepth.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setResearchDepthId(option.id)}
                      disabled={isPending}
                      className={[
                        "rounded-full px-4 py-2 text-sm font-medium transition",
                        selected
                          ? "bg-blue-500 text-white shadow-md"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">{researchDepth.summary}</p>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                LLM Provider
              </span>
              <div className="grid gap-3 sm:grid-cols-3">
                {PROVIDER_OPTIONS.map((option) => {
                  const active = option.id === provider.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setProviderId(option.id)}
                      disabled={isPending}
                      className={[
                        "flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200",
                        active
                          ? "border-blue-400 bg-blue-50/80 backdrop-blur text-blue-900 shadow-md"
                          : "border-white/30 bg-white/40 backdrop-blur text-slate-600 hover:border-blue-200 hover:bg-blue-50/40",
                      ].join(" ")}
                    >
                      <span className="text-sm font-semibold">
                        {option.display}
                      </span>
                      <span className="text-xs text-slate-500">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="quickModel"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  Quick Thinking LLM
                </Label>
                <select
                  id="quickModel"
                  className="rounded-lg border border-white/30 bg-white/50 backdrop-blur px-4 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={quickModel}
                  onChange={(event) => setQuickModel(event.target.value)}
                  disabled={isPending}
                >
                  {provider.quickModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label} · {model.hint}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="deepModel"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  Deep Thinking LLM
                </Label>
                <select
                  id="deepModel"
                  className="rounded-lg border border-white/30 bg-white/50 backdrop-blur px-4 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={deepModel}
                  onChange={(event) => setDeepModel(event.target.value)}
                  disabled={isPending}
                >
                  {provider.deepModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label} · {model.hint}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {isThinkingEditable ? (
              <div className="rounded-lg border border-blue-200/60 bg-blue-50/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-blue-900">
                    🧠 Reasoning Mode (OpenRouter)
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      ensureThinking({
                        enableThinkingMode: !(
                          thinking?.enableThinkingMode ?? false
                        ),
                      })
                    }
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold transition",
                      thinking?.enableThinkingMode
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-white text-blue-600 border border-blue-200",
                    ].join(" ")}
                  >
                    {thinking?.enableThinkingMode ? "사용 중" : "비활성"}
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="thinkingEffort"
                      className="text-xs text-blue-700"
                    >
                      Default Effort
                    </Label>
                    <select
                      id="thinkingEffort"
                      className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-900 focus:border-blue-400 focus:outline-none"
                      value={thinking?.thinkingEffort ?? "medium"}
                      onChange={(event) =>
                        ensureThinking({
                          thinkingEffort: event.target
                            .value as ThinkingSettings["thinkingEffort"],
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="thinkingQuick"
                      className="text-xs text-blue-700"
                    >
                      Quick Effort
                    </Label>
                    <select
                      id="thinkingQuick"
                      className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-900 focus:border-blue-400 focus:outline-none"
                      value={thinking?.thinkingEffortQuick ?? "medium"}
                      onChange={(event) =>
                        ensureThinking({
                          thinkingEffortQuick: event.target
                            .value as ThinkingSettings["thinkingEffortQuick"],
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label
                      htmlFor="thinkingDeep"
                      className="text-xs text-blue-700"
                    >
                      Deep Effort
                    </Label>
                    <select
                      id="thinkingDeep"
                      className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs text-blue-900 focus:border-blue-400 focus:outline-none"
                      value={thinking?.thinkingEffortDeep ?? "heavy"}
                      onChange={(event) =>
                        ensureThinking({
                          thinkingEffortDeep: event.target
                            .value as ThinkingSettings["thinkingEffortDeep"],
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="medium">Medium</option>
                      <option value="heavy">Heavy</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className={surfaceClass("base") + " space-y-4 p-6 sm:p-8"}>
            <header className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">
                🔧 추가 설정 (선택)
              </h2>
              <p className="text-sm text-slate-500">
                TradingAgents 런타임에 병합할 JSON 형태의 설정을 입력하세요.
              </p>
            </header>
            <Textarea
              id="configOverrides"
              placeholder='예: {"data_vendors": {"news_data": "google"}}'
              value={advancedOverrides}
              onChange={(event) => setAdvancedOverrides(event.target.value)}
              disabled={isPending}
              className="min-h-[120px] rounded-lg border border-white/30 bg-white/50 backdrop-blur px-4 py-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
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
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">애널리스트</dt>
                <dd className="text-right">
                  {selectedAnalysts.length
                    ? selectedAnalysts
                        .map(
                          (id) =>
                            ANALYST_OPTIONS.find((opt) => opt.id === id)
                              ?.name ?? id
                        )
                        .join(", ")
                    : "선택 필요"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">연구 심도</dt>
                <dd className="text-right">
                  {researchDepth.label} · {researchDepth.rounds} rounds
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">LLM 스택</dt>
                <dd className="text-right text-xs">
                  {provider.display} → {quickModel || "선택 필요"} /{" "}
                  {deepModel || "선택 필요"}
                </dd>
              </div>
            </dl>
          </div>
          <div
            className={
              surfaceClass("glass") +
              " flex-1 space-y-4 p-6 overflow-hidden flex flex-col"
            }
          >
            <h3 className="text-sm font-semibold text-slate-900">
              전송 예정 Config
            </h3>
            <pre className="max-h-72 overflow-auto rounded-lg border border-white/30 bg-white/40 px-4 py-3 text-xs text-slate-700 scrollbar-thin">
              {JSON.stringify(previewConfig, null, 2)}
            </pre>
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
          실행을 시작하면 `/runs/&lt;id&gt;` 페이지에서 실시간 로그와 리포트를
          확인할 수 있습니다.
        </p>
        <Button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {isPending ? "실행 준비 중…" : "🚀 런 실행"}
        </Button>
      </div>
    </form>
  );
}
