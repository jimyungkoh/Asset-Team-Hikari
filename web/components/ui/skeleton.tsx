// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import React from "react";
import { cn } from "../../lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  lines?: number; // for text variant
}

const variantClasses = {
  text: "rounded",
  circular: "rounded-full",
  rectangular: "rounded-none",
  rounded: "rounded-md",
};

const animationClasses = {
  pulse: "animate-pulse",
  wave: "animate-shimmer",
  none: "",
};

export const Skeleton = ({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
  lines,
  ...props
}: SkeletonProps) => {
  const baseClasses = cn(
    "bg-slate-200",
    variantClasses[variant],
    animationClasses[animation],
    className
  );

  const style: React.CSSProperties = {
    width: width || "100%",
    height: height || (variant === "text" ? "1rem" : "2rem"),
  };

  // Text variant with multiple lines
  if (variant === "text" && lines && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              // Last line is shorter
              index === lines - 1 && "w-3/4"
            )}
            style={{
              ...style,
              // Vary the heights slightly for more realistic appearance
              height: index === 0 ? "1.2rem" : "1rem",
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClasses} style={style} {...props} />;
};

// Card skeleton component
export interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showTitle?: boolean;
  showSubtitle?: boolean;
  lines?: number;
  avatarSize?: "sm" | "md" | "lg";
}

export const CardSkeleton = ({
  className,
  showAvatar = false,
  showTitle = true,
  showSubtitle = true,
  lines = 3,
  avatarSize = "md",
}: CardSkeletonProps) => {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6",
        className
      )}
    >
      <div className="space-y-4">
        {/* Avatar */}
        {showAvatar && (
          <div className="flex items-center space-x-4">
            <Skeleton
              variant="circular"
              className={avatarSizes[avatarSize]}
            />
            <div className="flex-1">
              {showTitle && (
                <Skeleton
                  variant="text"
                  width="60%"
                  height="1.2rem"
                  className="mb-2"
                />
              )}
              {showSubtitle && (
                <Skeleton variant="text" width="40%" height="0.875rem" />
              )}
            </div>
          </div>
        )}

        {/* Title and subtitle without avatar */}
        {!showAvatar && (
          <div className="space-y-2">
            {showTitle && (
              <Skeleton variant="text" width="70%" height="1.5rem" />
            )}
            {showSubtitle && (
              <Skeleton variant="text" width="50%" height="1rem" />
            )}
          </div>
        )}

        {/* Content lines */}
        <div className="space-y-2">
          <Skeleton variant="text" lines={lines} />
        </div>
      </div>
    </div>
  );
};

// Metric card skeleton
export interface MetricCardSkeletonProps {
  className?: string;
  showIcon?: boolean;
  showTrend?: boolean;
  showChart?: boolean;
}

export const MetricCardSkeleton = ({
  className,
  showIcon = true,
  showTrend = true,
  showChart = false,
}: MetricCardSkeletonProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-6",
        className
      )}
    >
      <div className="space-y-4">
        {/* Header with title and icon */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width="40%" height="0.875rem" />
          {showIcon && (
            <Skeleton variant="circular" width="1.5rem" height="1.5rem" />
          )}
        </div>

        {/* Main value */}
        <Skeleton variant="text" width="60%" height="2rem" />

        {/* Trend indicator */}
        {showTrend && (
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" width="1rem" height="1rem" />
            <Skeleton variant="text" width="30%" height="0.875rem" />
          </div>
        )}

        {/* Mini chart */}
        {showChart && (
          <Skeleton variant="rectangular" width="100%" height="4rem" />
        )}
      </div>
    </div>
  );
};

// Table skeleton
export interface TableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}

export const TableSkeleton = ({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
}: TableSkeletonProps) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Table header */}
      {showHeader && (
        <div className="flex space-x-4 pb-3 border-b border-slate-200">
          {Array.from({ length: columns }, (_, index) => (
            <Skeleton
              key={`header-${index}`}
              variant="text"
              width={`${100 / columns}%`}
              height="1rem"
              className="flex-shrink-0"
            />
          ))}
        </div>
      )}

      {/* Table rows */}
      <div className="space-y-3 pt-3">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex space-x-4">
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                variant="text"
                width={colIndex === 0 ? "60%" : "80%"}
                height="0.875rem"
                className="flex-shrink-0"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

Skeleton.displayName = "Skeleton";
CardSkeleton.displayName = "CardSkeleton";
MetricCardSkeleton.displayName = "MetricCardSkeleton";
TableSkeleton.displayName = "TableSkeleton";