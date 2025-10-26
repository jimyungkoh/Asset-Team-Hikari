// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

type RunStatus = "pending" | "running" | "success" | "failed";

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
  result?: unknown;
  error?: RunError;
}

interface RunEvent {
  event?: string;
  message?: string;
  percent?: number;
  status?: string;
  result?: unknown;
  timestamp?: string;
  [key: string]: unknown;
}

interface RunStreamProps {
  run: RunSummary;
}

export function RunStream({ run }: RunStreamProps): JSX.Element {
  const [status, setStatus] = useState<RunStatus>(run.status);
  const [progress, setProgress] = useState<number>(
    run.status === "success" ? 100 : 5
  );
  const [logs, setLogs] = useState<RunEvent[]>([]);
  const [result, setResult] = useState<unknown>(run.result);
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
        const payload: RunEvent = JSON.parse(event.data);
        setLogs((prev) => [...prev, payload]);

        if (typeof payload.percent === "number") {
          setProgress(payload.percent);
        }

        if (typeof payload.status === "string") {
          setStatus(payload.status as RunStatus);
        }

        if (typeof payload.timestamp === "string") {
          setUpdatedAt(payload.timestamp);
        } else {
          setUpdatedAt(new Date().toISOString());
        }

        if (payload.event === "complete" && payload.result) {
          setStatus("success");
          setResult(payload.result);
        }

        if (payload.event === "error") {
          setStatus("failed");
          setError({
            message:
              typeof payload.message === "string"
                ? payload.message
                : "Runner reported error",
            traceback:
              typeof payload.traceback === "string"
                ? payload.traceback
                : undefined,
          });
        }
      } catch (parseError) {
        setLogs((prev) => [
          ...prev,
          {
            event: "client-error",
            message: "Failed to parse stream payload",
            raw: event.data,
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
            logs.map((event, index) => (
              <div
                key={`${event.event}-${index}`}
                className="space-y-1 pb-3 border-b border-white/20 last:border-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900">
                    {event.event === "complete" && "✅"}
                    {event.event === "error" && "❌"}
                    {event.event === "progress" && "⏳"}
                    {!["complete", "error", "progress"].includes(
                      event.event ?? ""
                    ) && "📌"}{" "}
                    {event.event ?? "message"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {event.timestamp
                      ? new Date(event.timestamp).toLocaleTimeString()
                      : new Date().toLocaleTimeString()}
                  </span>
                </div>
                {event.message && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {event.message}
                  </p>
                )}
                {typeof event.percent === "number" && (
                  <p className="text-xs text-slate-500">
                    진행: {event.percent}%
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

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
      {result && (
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
