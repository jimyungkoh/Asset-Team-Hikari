// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

const FINANCIAL_COLORS = {
  // 금융 데이터 의미론적 색상
  profit: {
    50: "bg-green-50",
    100: "bg-green-100",
    200: "bg-green-200",
    300: "bg-green-300",
    400: "bg-green-400",
    500: "bg-green-500",
    600: "bg-green-600",
    text: {
      50: "text-green-50",
      100: "text-green-100",
      200: "text-green-200",
      300: "text-green-300",
      400: "text-green-400",
      500: "text-green-500",
      600: "text-green-600",
      700: "text-green-700",
      800: "text-green-800",
      900: "text-green-900",
    },
    border: {
      200: "border-green-200",
      300: "border-green-300",
      400: "border-green-400",
      500: "border-green-500",
    },
    gradient: "bg-gradient-to-r from-green-500 to-emerald-600",
    textGradient:
      "bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent",
  },
  loss: {
    50: "bg-red-50",
    100: "bg-red-100",
    200: "bg-red-200",
    300: "bg-red-300",
    400: "bg-red-400",
    500: "bg-red-500",
    600: "bg-red-600",
    text: {
      50: "text-red-50",
      100: "text-red-100",
      200: "text-red-200",
      300: "text-red-300",
      400: "text-red-400",
      500: "text-red-500",
      600: "text-red-600",
      700: "text-red-700",
      800: "text-red-800",
      900: "text-red-900",
    },
    border: {
      200: "border-red-200",
      300: "border-red-300",
      400: "border-red-400",
      500: "border-red-500",
    },
    gradient: "bg-gradient-to-r from-red-500 to-rose-600",
    textGradient:
      "bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent",
  },
  neutral: {
    50: "bg-amber-50",
    100: "bg-amber-100",
    200: "bg-amber-200",
    300: "bg-amber-300",
    400: "bg-amber-400",
    500: "bg-amber-500",
    600: "bg-amber-600",
    text: {
      50: "text-amber-50",
      100: "text-amber-100",
      200: "text-amber-200",
      300: "text-amber-300",
      400: "text-amber-400",
      500: "text-amber-500",
      600: "text-amber-600",
      700: "text-amber-700",
      800: "text-amber-800",
      900: "text-amber-900",
    },
    border: {
      200: "border-amber-200",
      300: "border-amber-300",
      400: "border-amber-400",
      500: "border-amber-500",
    },
    gradient: "bg-gradient-to-r from-amber-500 to-yellow-600",
    textGradient:
      "bg-gradient-to-r from-amber-600 to-yellow-700 bg-clip-text text-transparent",
  },
  // 금융 차트 색상 팔레트
  chart: {
    primary: "bg-blue-500",
    secondary: "bg-cyan-500",
    tertiary: "bg-indigo-500",
    quaternary: "bg-purple-500",
    quinary: "bg-pink-500",
    // 차트 그라데이션
    areaGradient: "bg-gradient-to-t from-blue-500/20 to-transparent",
    positiveGradient: "bg-gradient-to-t from-green-500/20 to-transparent",
    negativeGradient: "bg-gradient-to-t from-red-500/20 to-transparent",
    neutralGradient: "bg-gradient-to-t from-amber-500/20 to-transparent",
  },
  // 금융 배지 색상
  badge: {
    profit:
      "inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 border border-green-200",
    loss: "inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 border border-red-200",
    neutral:
      "inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200",
    info: "inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 border border-blue-200",
  },
} as const;

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
  kbd: "px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono text-slate-700",
} as const;

const LAYOUT = {
  page: "mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-20 px-4 py-16 sm:px-6 lg:px-8",
  hero: "flex flex-col gap-8",
  metricGrid:
    "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  formGrid: "grid gap-8 lg:grid-cols-3",
  timeline: "flex flex-col gap-6",
  timelineItem:
    "flex flex-col gap-2 rounded-2xl bg-white/50 backdrop-blur border border-white/30 px-4 sm:px-6 py-4 text-slate-900 shadow-[0_4px_16px_rgba(0,0,0,0.05)]",
  cardGrid: "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  // 반응형 컨테이너
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  // 반응형 섹션 패딩
  sectionPadding: "py-8 sm:py-12 lg:py-16",
  // 반응형 카드 그리드
  responsiveGrid: {
    2: "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2",
    3: "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    auto: "grid gap-4 sm:gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]",
  },
  // 반응형 텍스트 크기
  responsiveText: {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl lg:text-2xl",
    xl: "text-xl sm:text-2xl lg:text-3xl",
    "2xl": "text-2xl sm:text-3xl lg:text-4xl",
    "3xl": "text-3xl sm:text-4xl lg:text-5xl",
  },
  // 반응형 간격
  responsiveGap: {
    sm: "gap-2 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
    xl: "gap-8 sm:gap-10",
  },
} as const;

export type SurfaceVariant = keyof typeof SURFACES;
export type FinancialColorType = keyof typeof FINANCIAL_COLORS;

export interface FinanceMetric {
  label: string;
  value: string | number;
  detail: string;
  icon?: string;
  trend?: "up" | "down" | "stable";
}

export interface FinancialDataPoint {
  value: number;
  timestamp: string;
  label?: string;
}

export interface ChartData {
  data: FinancialDataPoint[];
  trend?: "up" | "down" | "stable";
  change?: number;
  changePercent?: number;
}

export function surfaceClass(variant: SurfaceVariant): string {
  return SURFACES[variant];
}

// 타입 가드: 키가 객체의 유효한 키인지 확인
function isValidKey<T extends Record<string, unknown>>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return key in obj;
}

// 타입 가드: bg intensity 키인지 확인
function isBgIntensityKey(
  key: string
): key is "50" | "100" | "200" | "300" | "400" | "500" | "600" {
  return ["50", "100", "200", "300", "400", "500", "600"].includes(key);
}

export function getFinancialColor(
  type: "profit" | "loss" | "neutral",
  shade: "text" | "bg" | "border" | "gradient" | "textGradient",
  intensity?: string
): string {
  const colorSet = FINANCIAL_COLORS[type];

  // gradient와 textGradient는 직접 접근
  if (shade === "gradient" || shade === "textGradient") {
    return colorSet[shade];
  }

  // bg는 숫자 키로 직접 접근 (50, 100, 200, 300, 400, 500, 600)
  if (shade === "bg") {
    const bgIntensity = intensity || "500";
    if (isBgIntensityKey(bgIntensity)) {
      return colorSet[bgIntensity];
    }
    // 기본값으로 500 사용
    return colorSet["500"];
  }

  // text나 border는 중첩 객체로 접근
  if (shade === "text" || shade === "border") {
    const shadeObj = colorSet[shade];
    if (shadeObj && typeof shadeObj === "object") {
      // intensity가 제공되고 유효한 키인 경우
      if (intensity && isValidKey(shadeObj, intensity)) {
        return shadeObj[intensity];
      }
      // 기본값: text는 "500", border는 첫 번째 사용 가능한 키
      if (shade === "text" && isValidKey(shadeObj, "500")) {
        return shadeObj["500"];
      }
      // border는 첫 번째 키 사용
      const firstKey = Object.keys(shadeObj)[0];
      if (firstKey && isValidKey(shadeObj, firstKey)) {
        return shadeObj[firstKey];
      }
    }
  }

  // 기본값 (fallback)
  return colorSet["500"];
}

export function getFinancialBadgeClass(
  type: "profit" | "loss" | "neutral" | "info"
): string {
  return FINANCIAL_COLORS.badge[type];
}

export const textStyles = TEXT;
export const layoutStyles = LAYOUT;
export const financialColors = FINANCIAL_COLORS;
