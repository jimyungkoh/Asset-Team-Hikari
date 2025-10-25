// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { redirect } from 'next/navigation';

import { RunForm } from '../components/runs/run-form';
import { auth } from '../lib/auth';

export default async function HomePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Asset Team Hikari</h1>
        <p className="text-muted-foreground">
          Authenticated as <span className="font-medium">{session.user?.email}</span>. Launch a run to
          orchestrate TradingAgents with real-time progress.
        </p>
      </header>
      <RunForm />
    </main>
  );
}
