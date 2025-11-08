// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { Metadata } from "next";
import { ReactNode } from "react";

import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import { SessionProviders } from "../components/providers/session-provider";
import { ROUTES } from "../lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asset Team Hikari Console",
  description: "Control panel for orchestrating TradingAgents runs",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const navigationLinks: Array<{ href: string; label: string }> = [
    { href: ROUTES.HOME, label: "새 분석" },
    { href: ROUTES.TICKERS.LIST, label: "티커 목록" },
  ];

  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <SessionProviders>
          {/* Animated Background Elements */}
          <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
          </div>

          <Header navigationLinks={navigationLinks} />

          {/* Main Content */}
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
            <main className="space-y-20">{children}</main>
          </div>

          <Footer />
        </SessionProviders>
      </body>
    </html>
  );
}