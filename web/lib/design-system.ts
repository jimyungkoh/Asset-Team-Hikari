// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export interface FinanceMetric {
  label: string;
  value: string;
  detail: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
}

export interface TimelineStep {
  id: number;
  label: string;
  description: string;
  emphasis?: string;
  icon?: string;
}

export interface KnowledgeCard {
  title: string;
  caption: string;
  body: string;
  icon?: string;
}

export const FINANCE_METRICS: FinanceMetric[] = [
  {
    label: "Agent Flow",
    value: "5 Stage",
    detail: "Analyst → Research → Trader → Risk → PM",
    icon: "⚡",
    trend: "up",
  },
  {
    label: "Avg Runtime",
    value: "~4분",
    detail: "심도와 모델에 따라 자동 조정되는 실행 속도",
    icon: "⏱️",
    trend: "neutral",
  },
  {
    label: "Data Readiness",
    value: "100%",
    detail: "모든 런에 JSON 리포트 + 구성 스냅샷 저장",
    icon: "📊",
    trend: "up",
  },
];

export const PIPELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    label: "Analyzer Pod",
    description:
      "Market · Social · News · Fundamentals 분석 봇이 데이터를 수집하고 요약합니다.",
    emphasis: "애널리스트 팀",
    icon: "🔍",
  },
  {
    id: 2,
    label: "Research Debate",
    description:
      "Bull vs Bear 토론 후 Research Manager가 투자 플랜을 중재합니다.",
    emphasis: "리서치 팀",
    icon: "🎯",
  },
  {
    id: 3,
    label: "Trade & Risk Loop",
    description:
      "트레이더 전략과 Risk Analyst 3인의 위험도 토론이 시그널을 정제합니다.",
    icon: "⚖️",
  },
  {
    id: 4,
    label: "Portfolio Decision",
    description:
      "Portfolio Manager가 최종 의사결정을 내려 결괏값을 확정합니다.",
    icon: "✓",
  },
];

export const KNOWLEDGE_CARDS: KnowledgeCard[] = [
  {
    title: "Config Snapshot",
    caption: "전송되는 모든 런은 구성 정보와 메타데이터를 동봉합니다.",
    body: "CLI에서 사용한 파라미터를 동일하게 수집하여 `selected_analysts`, 연구 심도, LLM 스택을 결과에 함께 보관합니다.",
    icon: "📸",
  },
  {
    title: "DB Friendly",
    caption: "향후 영속화를 대비한 스키마 안배",
    body: "`metadata` 블록은 DB 스키마와 1:1 매핑이 가능하도록 설계되어, 추후 저장소 도입 시 마이그레이션 없이 연결할 수 있습니다.",
    icon: "💾",
  },
  {
    title: "Self-Descriptive",
    caption: "모든 카드와 섹션은 의도를 문장으로 표현합니다.",
    body: "유지보수를 쉽게 하도록 각 요소의 목적과 맥락을 주석 대신 텍스트로 노출했습니다.",
    icon: "📖",
  },
];

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
