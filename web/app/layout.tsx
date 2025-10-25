// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { Metadata } from 'next';
import { ReactNode } from 'react';

import './globals.css';
import { SessionProviders } from '../components/providers/session-provider';

export const metadata: Metadata = {
  title: 'Asset Team Hikari Console',
  description: 'Control panel for orchestrating TradingAgents runs',
};

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <SessionProviders>{children}</SessionProviders>
      </body>
    </html>
  );
}
