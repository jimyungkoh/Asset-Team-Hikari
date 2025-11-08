// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/40 backdrop-blur-xl bg-white/20 mt-12 sm:mt-16 lg:mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-600 text-center md:text-left">
            © 2025 Asset Team Hikari. 모든 권리 보유.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-600">
            <a
              href="#"
              className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              문서
            </a>
            <a
              href="#"
              className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              지원
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}