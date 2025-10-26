// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { FinanceMetric } from "../../lib/design-system";
import {
  layoutStyles,
  surfaceClass,
  textStyles,
} from "../../lib/design-system";

interface MetricCardProps {
  metric: FinanceMetric;
}

export function MetricGrid({
  metrics,
}: {
  metrics: FinanceMetric[];
}): JSX.Element {
  return (
    <div className={layoutStyles.metricGrid}>
      {metrics.map((metric) => (
        <MetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

export function MetricCard({ metric }: MetricCardProps): JSX.Element {
  const getTrendIcon = () => {
    if (metric.trend === "up") return "📈";
    if (metric.trend === "down") return "📉";
    return "→";
  };

  const getTrendColor = () => {
    if (metric.trend === "up") return "text-success";
    if (metric.trend === "down") return "text-destructive";
    return "text-warning";
  };

  return (
    <article
      className={
        surfaceClass("glass") +
        " relative overflow-hidden group cursor-pointer transition-all hover:shadow-xl"
      }
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content */}
      <div className="relative p-6 md:p-7 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <span className={textStyles.metricLabel}>{metric.label}</span>
          {metric.icon && <span className="text-2xl">{metric.icon}</span>}
        </div>

        {/* Value */}
        <div className="flex flex-col gap-1">
          <span className={textStyles.metricValue}>{metric.value}</span>
          {metric.trend && (
            <div
              className={
                getTrendColor() +
                " text-xs font-semibold flex items-center gap-1"
              }
            >
              <span>{getTrendIcon()}</span>
              <span>
                {metric.trend === "up"
                  ? "증가 추세"
                  : metric.trend === "down"
                  ? "감소 추세"
                  : "안정적"}
              </span>
            </div>
          )}
        </div>

        {/* Detail */}
        <p className={textStyles.metricDetail}>{metric.detail}</p>
      </div>
    </article>
  );
}
