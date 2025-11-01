// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

const SURFACES = {
  base: "rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]",
  soft: "rounded-xl bg-white/60 backdrop-blur-lg border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.05)]",
  outline:
    "rounded-2xl bg-gradient-to-br from-white/40 via-white/30 to-blue-50/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(10,132,255,0.08)]",
  pill: "inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 border border-blue-200/40",
  glass:
    "rounded-2xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)]",
} as const;

const TEXT = {
  heroTitle:
    "text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent",
  heroSubtitle: "text-base md:text-lg text-slate-600",
  sectionTitle: "text-3xl md:text-4xl font-bold text-slate-900",
  sectionSubtitle: "text-slate-600",
  metricLabel:
    "text-xs font-semibold uppercase tracking-[0.15em] text-slate-500",
  metricValue: "text-2xl md:text-3xl font-bold text-slate-900",
  metricDetail: "text-sm text-slate-500",
  cardTitle: "text-lg font-bold text-slate-900",
  cardDescription: "text-sm text-slate-600",
} as const;

const LAYOUT = {
  page: "mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-20 px-4 py-16 sm:px-6 lg:px-8",
  hero: "flex flex-col gap-8",
  metricGrid: "grid gap-6 md:grid-cols-3",
  formGrid: "grid gap-8 lg:grid-cols-3",
  timeline: "flex flex-col gap-6",
  timelineItem:
    "flex flex-col gap-2 rounded-2xl bg-white/50 backdrop-blur border border-white/30 px-6 py-4 text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.05)]",
  cardGrid: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
} as const;

export type SurfaceVariant = keyof typeof SURFACES;

export function surfaceClass(variant: SurfaceVariant): string {
  return SURFACES[variant];
}

export const textStyles = TEXT;
export const layoutStyles = LAYOUT;
