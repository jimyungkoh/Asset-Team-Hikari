// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState, useTransition } from 'react';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

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
  const [ticker, setTicker] = useState('');
  const [tradeDate, setTradeDate] = useState(defaultTradeDate());
  const [config, setConfig] = useState('');
  const [error, setError] = useState<FormError | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    let parsedConfig: Record<string, unknown> | undefined;
    if (config.trim()) {
      try {
        parsedConfig = JSON.parse(config);
      } catch (parseError) {
        setError({ message: 'Config must be valid JSON' });
        return;
      }
    }

    const payload = {
      ticker: ticker.trim().toUpperCase(),
      tradeDate: tradeDate.trim(),
      config: parsedConfig,
    };

    startTransition(async () => {
      const response = await fetch('/api/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = (await response.json().catch(() => ({}))) as CreateRunResponse;

      if (!response.ok || !body.id) {
        setError({ message: body.error ?? 'Failed to start run' });
        return;
      }

      router.push(`/runs/${body.id}`);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Trading Run</CardTitle>
        <CardDescription>Submit a ticker and date to orchestrate a new analysis run.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="ticker">Ticker</Label>
            <Input
              id="ticker"
              placeholder="NVDA"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tradeDate">Trade Date</Label>
            <Input
              id="tradeDate"
              type="date"
              value={tradeDate}
              onChange={(event) => setTradeDate(event.target.value)}
              required
              disabled={isPending}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="config">Config Overrides (JSON)</Label>
            <Textarea
              id="config"
              placeholder='{"llm_provider": "openai"}'
              value={config}
              onChange={(event) => setConfig(event.target.value)}
              disabled={isPending}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error.message}</p> : null}
        </CardContent>
        <CardFooter className="justify-between">
          <p className="text-sm text-muted-foreground">
            Runs stream progress in real time after launch.
          </p>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Starting…' : 'Start Run'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
