// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { PropsWithChildren } from "react";

import { surfaceClass, textStyles } from "../../lib/design-system";

interface PageShellProps extends PropsWithChildren {
  authenticatedEmail: string | null;
}

export function PageShell({
  authenticatedEmail,
  children,
}: PageShellProps): JSX.Element {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 text-slate-900">
      {/* Animated Background Elements */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/40 backdrop-blur-xl bg-white/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                ♡
              </div>
              <span className="text-lg font-bold text-slate-900">Hikari</span>
            </div>

            {/* Auth Info */}
            {authenticatedEmail && (
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-slate-100/50 backdrop-blur border border-slate-200/30 text-xs text-slate-600">
                  <span className="font-medium">{authenticatedEmail}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          {/* Hero Section */}
          <div className="mb-20 animate-fade-in">
            <div className="space-y-6 max-w-3xl">
              <div className={surfaceClass("pill") + " w-fit"}>
                🚀 Asset Team Hikari
              </div>
              <h1 className={textStyles.heroTitle}>
                다중 에이전트 금융 오케스트레이션
              </h1>
              <p className={textStyles.heroSubtitle}>
                TradingAgents CLI와 동일한 입력 체계를 웹에서도 제공합니다.
                Apple의 디자인 철학과 모던 금융 UI를 결합했습니다.
              </p>
            </div>
          </div>

          {/* Content */}
          <main className="space-y-20">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/40 backdrop-blur-xl bg-white/20 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © 2025 Asset Team Hikari. 모든 권리 보유.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">
                문서
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                지원
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
