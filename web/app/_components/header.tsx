// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import Link from "next/link";
import { AuthDropdown } from "./auth-dropdown";
import { TickerSearch } from "./ticker-search";
import { ROUTES } from "../../lib/constants";

interface NavigationLink {
  href: string;
  label: string;
}

interface HeaderProps {
  navigationLinks: NavigationLink[];
}

export function Header({ navigationLinks }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 backdrop-blur-xl bg-white/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              {/* Left Section - Logo + Navigation */}
              <div className="flex items-center gap-3 sm:gap-6">
                <Link
                  href={ROUTES.HOME}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    ♡
                  </div>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    Hikari
                  </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
                  {navigationLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-full px-3 py-1.5 transition-colors hover:bg-white/60 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Right Section - Search + Profile */}
              <div className="flex w-auto items-center justify-end gap-2 sm:gap-3">
                <div className="hidden md:block w-56 lg:w-64 xl:w-80">
                  <TickerSearch className="w-full" />
                </div>
                <AuthDropdown />
              </div>
            </div>

            {/* Mobile Search */}
            <div className="md:hidden">
              <TickerSearch />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden pb-1">
            <div className="flex items-center gap-2 overflow-x-auto text-sm font-medium text-slate-600 scrollbar-hide">
              {navigationLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full px-3 py-1.5 bg-white/60 hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 min-w-fit touch-manipulation"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
