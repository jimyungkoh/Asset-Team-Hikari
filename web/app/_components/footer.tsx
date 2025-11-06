// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/40 backdrop-blur-xl bg-white/20 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © 2025 Asset Team Hikari. 모든 권리 보유.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <a
              href="#"
              className="hover:text-slate-900 transition-colors"
            >
              문서
            </a>
            <a
              href="#"
              className="hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="#"
              className="hover:text-slate-900 transition-colors"
            >
              지원
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}