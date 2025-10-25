// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function SessionProviders({ children }: { children: ReactNode }): JSX.Element {
  return <SessionProvider>{children}</SessionProvider>;
}
