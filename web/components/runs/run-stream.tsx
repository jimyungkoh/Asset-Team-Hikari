// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-29
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

type RunStatus = "pending" | "running" | "success" | "failed";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface RunError {
  message: string;
  traceback?: string;
}

interface RunSummary {
  id: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
  ticker: string;
  tradeDate: string;
  result?: JsonValue;
  error?: RunError;
}

interface RunEvent {
  event?: string;
  message?: string;
  percent?: number;
  status?: string;
  result?: JsonValue;
  timestamp?: string;
  traceback?: string;
  payload?: Record<string, JsonValue>;
}

interface RunStreamProps {
  run: RunSummary;
}

const SECTION_LABELS: Record<string, string> = {
  market_report: "시장 분석",
  sentiment_report: "소셜 정서",
  news_report: "뉴스 분석",
  fundamentals_report: "펀더멘털 분석",
  investment_plan: "투자 계획",
  trader_investment_plan: "트레이더 전략",
  final_trade_decision: "포트폴리오 결론",
};

function asObject(
  value: JsonValue | undefined | null
): Record<string, JsonValue> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, JsonValue>;
}

function coerceReportSections(
  source: JsonValue | undefined | null
): Record<string, string> {
  const sections: Record<string, string> = {};
  const top = asObject(source);
  const reports = top ? asObject(top["reports"]) : null;
  if (!reports) {
    return sections;
  }
  for (const [key, value] of Object.entries(reports)) {
    if (typeof value === "string" && value.trim().length > 0) {
      sections[key] = value;
    }
  }
  return sections;
}

function extractStreamMessage(
  payload?: Record<string, JsonValue>
): {
  sender?: string;
  role?: string;
  content?: string;
  timestamp?: string;
  toolCalls?: JsonValue;
} | null {
  if (!payload) {
    return null;
  }
  const message = asObject(payload["message"]);
  if (!message) {
    return null;
  }

  const toolCalls = message["tool_calls"];
  return {
    sender: typeof message["sender"] === "string" ? (message["sender"] as string) : undefined,
    role: typeof message["role"] === "string" ? (message["role"] as string) : undefined,
    content: typeof message["content"] === "string" ? (message["content"] as string) : undefined,
    timestamp:
      typeof message["timestamp"] === "string" ? (message["timestamp"] as string) : undefined,
    toolCalls:
      Array.isArray(toolCalls) || (typeof toolCalls === "object" && toolCalls !== null)
        ? (toolCalls as JsonValue)
        : undefined,
  };
}

function normalizeStreamEvent(raw: RunEvent): RunEvent {
  if (raw.event !== "state") {
    return raw;
  }

  const payload = raw.payload ? raw.payload : undefined;
  const messageDetails = payload ? extractStreamMessage(payload) : null;

  return {
    ...raw,
    message: messageDetails?.content ?? raw.message,
    timestamp: messageDetails?.timestamp ?? raw.timestamp,
  };
}

export function RunStream({ run }: RunStreamProps): JSX.Element {
  const [status, setStatus] = useState<RunStatus>(run.status);
  const [progress, setProgress] = useState<number>(
    run.status === "success" ? 100 : 5
  );
  const [logs, setLogs] = useState<RunEvent[]>([]);
  const [reportSections, setReportSections] = useState<Record<string, string>>(
    () => coerceReportSections(run.result ?? null)
  );
  const [result, setResult] = useState<JsonValue | null>(run.result ?? null);
  const [error, setError] = useState<RunError | null>(run.error ?? null);
  const [connected, setConnected] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(run.updatedAt);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/runs/${run.id}/stream`);

    source.onopen = () => {
      setConnected(true);
    };

    source.onmessage = (event: MessageEvent<string>) => {
      try {
        const raw: RunEvent = JSON.parse(event.data);
        const normalized = normalizeStreamEvent(raw);

        setLogs((prev) => [...prev, normalized]);

        if (typeof normalized.percent === "number") {
          setProgress(normalized.percent);
        }

        if (typeof normalized.status === "string") {
          setStatus(normalized.status as RunStatus);
        }

        if (typeof normalized.timestamp === "string") {
          setUpdatedAt(normalized.timestamp);
        } else {
          setUpdatedAt(new Date().toISOString());
        }

        if (raw.event === "state" && raw.payload) {
          const reportUpdates = asObject(raw.payload["reports"]);
          if (reportUpdates) {
            setReportSections((prev) => {
              let changed = false;
              const next = { ...prev };
              for (const [key, value] of Object.entries(reportUpdates)) {
                if (typeof value === "string" && value.trim().length > 0) {
                  if (next[key] !== value) {
                    next[key] = value;
                    changed = true;
                  }
                }
              }
              return changed ? next : prev;
            });
          }
        }

        if (normalized.event === "complete" && typeof normalized.result !== "undefined") {
          setStatus("success");
          setResult(normalized.result);
          setReportSections(coerceReportSections(normalized.result));
        }

        if (normalized.event === "error") {
          setStatus("failed");
          setError({
            message:
              typeof normalized.message === "string"
                ? normalized.message
                : "Runner reported error",
            traceback:
              typeof normalized.traceback === "string"
                ? normalized.traceback
                : typeof raw.traceback === "string"
                ? raw.traceback
                : undefined,
          });
        }
      } catch (parseError) {
        setLogs((prev) => [
          ...prev,
          {
            event: "client-error",
            message: "Failed to parse stream payload",
          },
        ]);
      }
    };

    source.onerror = () => {
      source.close();
      setConnected(false);
    };

    return () => {
      source.close();
    };
  }, [run.id]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">🚀 Run {run.id}</h2>
          <p className="text-sm text-slate-600 mt-1">
            {run.ticker} — {run.tradeDate}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">← 런처로 돌아가기</Link>
        </Button>
      </div>

      {/* Status Card */}
      <div className="glass rounded-2xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">📊 실행 상태</h3>
        <div className="flex items-center gap-3">
          <span
            className={cn("h-3 w-3 rounded-full animate-pulse", {
              "bg-yellow-500": status === "pending" || status === "running",
              "bg-green-500": status === "success",
              "bg-red-500": status === "failed",
            })}
          />
          <div className="flex-1">
            <span className="font-semibold capitalize text-slate-900">
              {status === "pending"
                ? "⏳ 대기 중"
                : status === "running"
                ? "⚙️ 실행 중"
                : status === "success"
                ? "✅ 완료"
                : "❌ 실패"}
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {connected ? "🔗 스트림 연결됨" : "❌ 스트림 연결 해제됨"}
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>진행도: {progress}%</span>
            <span>
              마지막 업데이트: {new Date(updatedAt).toLocaleTimeString()}
            </span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      </div>

      {/* Event Log Card */}
      <div className="glass rounded-2xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">📝 실행 로그</h3>
        <div
          ref={logContainerRef}
          className="max-h-96 space-y-2 overflow-y-auto rounded-lg bg-slate-50/50 backdrop-blur p-4 text-sm scrollbar-thin border border-white/30"
        >
          {logs.length === 0 ? (
            <p className="text-slate-500 text-center py-8">
              이벤트를 기다리는 중…
            </p>
          ) : (
            logs.map((event, index) => {
              const typedEvent = event as RunEvent;
              const messageDetails = extractStreamMessage(
                typedEvent.payload
              );
              return (
                <div
                  key={`${String(typedEvent.event ?? "unknown")}-${index}`}
                  className="space-y-1 pb-3 border-b border-white/20 last:border-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">
                      {typedEvent.event === "complete" ? "✅" : null}
                      {typedEvent.event === "error" ? "❌" : null}
                      {typedEvent.event === "progress" ? "⏳" : null}
                      {!["complete", "error", "progress"].includes(
                        typedEvent.event ?? ""
                      )
                        ? "📌"
                        : null}{" "}
                      {String(typedEvent.event ?? "message")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {typedEvent.timestamp &&
                      typeof typedEvent.timestamp === "string"
                        ? new Date(typedEvent.timestamp).toLocaleTimeString()
                        : new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  {messageDetails &&
                    (messageDetails.sender || messageDetails.role) && (
                      <p className="text-xs text-slate-500">
                        {messageDetails.sender ?? messageDetails.role}
                        {messageDetails.sender && messageDetails.role
                          ? ` · ${messageDetails.role}`
                          : ""}
                      </p>
                    )}
                  {typedEvent.message &&
                    typeof typedEvent.message === "string" && (
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {typedEvent.message}
                      </p>
                    )}
                  {typeof typedEvent.percent === "number" && (
                    <p className="text-xs text-slate-500">
                      진행: {typedEvent.percent}%
                    </p>
                  )}
                </div>
              );
            })
          )}
      </div>
    </div>

      {Object.keys(reportSections).length > 0 && (
        <div className="glass rounded-2xl p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-900">📑 리포트 스냅샷</h3>
          <div className="space-y-6">
            {Object.entries(reportSections).map(([key, value]) => {
              const label = SECTION_LABELS[key] ?? key;
              return (
                <div key={key} className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {label}
                  </div>
                  <div className="whitespace-pre-wrap rounded-xl bg-white/60 border border-white/40 p-4 text-sm leading-relaxed text-slate-700 shadow-inner">
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Card */}
      {error && (
        <div className="glass rounded-2xl p-8 space-y-4 border border-red-200/50">
          <h3 className="text-lg font-bold text-red-600">❌ 실행 실패</h3>
          <p className="font-mono text-sm text-red-600 bg-red-50/40 p-3 rounded-lg">
            {error.message}
          </p>
          {error.traceback && (
            <details className="cursor-pointer">
              <summary className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                📋 스택 트레이스 보기
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900/80 p-3 text-xs text-slate-100 scrollbar-thin">
                {error.traceback}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* Result Card */}
      {result !== null && (
        <div className="glass rounded-2xl p-8 space-y-4">
          <h3 className="text-lg font-bold text-green-600">📊 결과 요약</h3>
          <pre className="max-h-96 overflow-auto rounded-lg bg-slate-50/50 backdrop-blur p-4 text-xs text-slate-700 scrollbar-thin border border-white/30">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
