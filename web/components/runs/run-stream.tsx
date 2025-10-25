// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';

type RunStatus = 'pending' | 'running' | 'success' | 'failed';

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
  const [progress, setProgress] = useState<number>(run.status === 'success' ? 100 : 5);
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

        if (typeof payload.percent === 'number') {
          setProgress(payload.percent);
        }

        if (typeof payload.status === 'string') {
          setStatus(payload.status as RunStatus);
        }

        if (typeof payload.timestamp === 'string') {
          setUpdatedAt(payload.timestamp);
        } else {
          setUpdatedAt(new Date().toISOString());
        }

        if (payload.event === 'complete' && payload.result) {
          setStatus('success');
          setResult(payload.result);
        }

        if (payload.event === 'error') {
          setStatus('failed');
          setError({
            message: typeof payload.message === 'string' ? payload.message : 'Runner reported error',
            traceback: typeof payload.traceback === 'string' ? payload.traceback : undefined,
          });
        }
      } catch (parseError) {
        setLogs((prev) => [
          ...prev,
          { event: 'client-error', message: 'Failed to parse stream payload', raw: event.data },
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
          <h2 className="text-2xl font-semibold">Run {run.id}</h2>
          <p className="text-sm text-muted-foreground">
            {run.ticker} — {run.tradeDate}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">Back to Launcher</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className={cn('h-2 w-2 rounded-full', {
                'bg-yellow-500': status === 'pending' || status === 'running',
                'bg-green-500': status === 'success',
                'bg-red-500': status === 'failed',
              })}
            />
            <span className="font-medium capitalize">{status}</span>
            <span className="text-muted-foreground">
              Updated {new Date(updatedAt).toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              {connected ? 'stream connected' : 'stream disconnected'}
            </span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={logContainerRef}
            className="max-h-80 space-y-2 overflow-y-auto rounded-md border bg-muted/30 p-3 text-sm"
          >
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Waiting for events…</p>
            ) : (
              logs.map((event, index) => (
                <div key={`${event.event}-${index}`} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{event.event ?? 'message'}</span>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp ?? new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  {event.message ? <p className="text-sm">{event.message}</p> : null}
                  {typeof event.percent === 'number' ? (
                    <p className="text-xs text-muted-foreground">{event.percent}%</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Run Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-mono text-sm text-destructive">{error.message}</p>
            {error.traceback ? (
              <pre className="overflow-x-auto rounded bg-muted p-3 text-xs">{error.traceback}</pre>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle>Result Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
