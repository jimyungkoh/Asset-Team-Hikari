// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import React from "react";
import * as Icons from "lucide-react";
import { cn } from "../../lib/utils";

export interface IconProps {
  name: keyof typeof Icons;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

const colorClasses = {
  default: "text-slate-900",
  primary: "text-blue-600",
  success: "text-green-600",
  warning: "text-amber-600",
  destructive: "text-red-600",
  muted: "text-slate-500",
};

export const Icon = ({ name, className, size = "md", color = "default" }: IconProps) => {
  const LucideIcon = Icons[name] as React.ComponentType<{ className?: string }>;
  
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      className={cn(
        sizeClasses[size],
        colorClasses[color],
        "flex-shrink-0",
        className
      )}
    />
  );
};

// 금융 관련 특화 아이콘 맵핑
export const FinancialIcons = {
  // 추세 아이콘
  trendUp: "TrendingUp",
  trendDown: "TrendingDown",
  trendStable: "Minus",
  
  // 금융 데이터 아이콘
  profit: "TrendingUp",
  loss: "TrendingDown",
  neutral: "Minus",
  
  // 차트 아이콘
  chart: "BarChart3",
  lineChart: "LineChart",
  pieChart: "PieChart",
  areaChart: "AreaChart",
  
  // 시장 아이콘
  market: "Building2",
  stock: "TrendingUp",
  crypto: "Bitcoin",
  currency: "DollarSign",
  
  // 분석 아이콘
  analysis: "BrainCircuit",
  research: "Search",
  report: "FileText",
  data: "Database",
  
  // 알림 아이콘
  alert: "AlertTriangle",
  info: "Info",
  success: "CheckCircle",
  warning: "AlertCircle",
  
  // 작업 아이콘
  refresh: "RefreshCw",
  download: "Download",
  upload: "Upload",
  settings: "Settings",
  
  // 내비게이션 아이콘
  home: "Home",
  dashboard: "LayoutDashboard",
  portfolio: "Briefcase",
  watchlist: "Eye",
  
  // 시간 아이콘
  calendar: "Calendar",
  clock: "Clock",
  timer: "Timer",
} as const;

export type FinancialIconName = keyof typeof FinancialIcons;

// 금융 특화 아이콘 컴포넌트
export interface FinancialIconProps {
  name: FinancialIconName;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "profit" | "loss" | "neutral";
}

export const FinancialIcon = ({ 
  name, 
  className, 
  size = "md", 
  variant = "default" 
}: FinancialIconProps) => {
  const iconName = FinancialIcons[name] as keyof typeof Icons;
  let color: IconProps["color"] = "default";
  
  if (variant === "profit") color = "success";
  else if (variant === "loss") color = "destructive";
  else if (variant === "neutral") color = "warning";
  
  return <Icon name={iconName} className={className} size={size} color={color} />;
};

// 트렌드 아이콘 컴포넌트
export interface TrendIconProps {
  trend: "up" | "down" | "stable";
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const TrendIcon = ({ trend, className, size = "sm" }: TrendIconProps) => {
  const trendConfig = {
    up: { name: "TrendingUp" as const, color: "success" as const },
    down: { name: "TrendingDown" as const, color: "destructive" as const },
    stable: { name: "Minus" as const, color: "warning" as const },
  };
  
  const config = trendConfig[trend];
  
  return <Icon name={config.name} className={className} size={size} color={config.color} />;
};

Icon.displayName = "Icon";
FinancialIcon.displayName = "FinancialIcon";
TrendIcon.displayName = "TrendIcon";