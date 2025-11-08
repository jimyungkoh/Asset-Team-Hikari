// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import React from "react";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";

export interface LoadingSpinnerProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
  variant?: "spinner" | "dots" | "pulse" | "bars";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  default: "text-slate-600",
  primary: "text-blue-600",
  success: "text-green-600",
  warning: "text-amber-600",
  destructive: "text-red-600",
  muted: "text-slate-400",
};

export const LoadingSpinner = ({
  className,
  size = "md",
  color = "default",
  variant = "spinner",
}: LoadingSpinnerProps) => {
  const baseClasses = cn(sizeClasses[size], colorClasses[color], className);

  switch (variant) {
    case "dots":
      return (
        <div className={cn("flex space-x-1", baseClasses)}>
          <div className="animate-bounce" style={{ animationDelay: "0ms" }}>
            <div className={cn(sizeClasses[size], "rounded-full bg-current")} />
          </div>
          <div className="animate-bounce" style={{ animationDelay: "150ms" }}>
            <div className={cn(sizeClasses[size], "rounded-full bg-current")} />
          </div>
          <div className="animate-bounce" style={{ animationDelay: "300ms" }}>
            <div className={cn(sizeClasses[size], "rounded-full bg-current")} />
          </div>
        </div>
      );

    case "pulse":
      return (
        <div className={cn("animate-pulse", baseClasses)}>
          <div className={cn("rounded-full bg-current", sizeClasses[size])} />
        </div>
      );

    case "bars":
      return (
        <div className={cn("flex space-x-1 items-end", sizeClasses[size], className)}>
          <div className="w-1/4 bg-current animate-pulse" style={{ animationDelay: "0ms", height: "40%" }} />
          <div className="w-1/4 bg-current animate-pulse" style={{ animationDelay: "200ms", height: "60%" }} />
          <div className="w-1/4 bg-current animate-pulse" style={{ animationDelay: "400ms", height: "80%" }} />
          <div className="w-1/4 bg-current animate-pulse" style={{ animationDelay: "600ms", height: "60%" }} />
        </div>
      );

    case "spinner":
    default:
      return (
        <Icon
          name="Loader2"
          className={cn("animate-spin", baseClasses)}
        />
      );
  }
};

// Loading overlay component
export interface LoadingOverlayProps {
  isLoading: boolean;
  children?: React.ReactNode;
  className?: string;
  variant?: "overlay" | "inline" | "fullscreen";
  spinnerSize?: "xs" | "sm" | "md" | "lg" | "xl";
  spinnerColor?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
  spinnerVariant?: "spinner" | "dots" | "pulse" | "bars";
  text?: string;
}

export const LoadingOverlay = ({
  isLoading,
  children,
  className,
  variant = "overlay",
  spinnerSize = "md",
  spinnerColor = "primary",
  spinnerVariant = "spinner",
  text,
}: LoadingOverlayProps) => {
  const overlayClasses = {
    overlay: "absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10",
    inline: "flex items-center justify-center p-4",
    fullscreen: "fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50",
  };

  if (!isLoading && variant !== "inline") {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className={overlayClasses[variant]}>
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner
              size={spinnerSize}
              color={spinnerColor}
              variant={spinnerVariant}
            />
            {text && (
              <p className={cn(
                "text-sm font-medium",
                spinnerColor === "default" && "text-slate-600",
                spinnerColor === "primary" && "text-blue-600",
                spinnerColor === "success" && "text-green-600",
                spinnerColor === "warning" && "text-amber-600",
                spinnerColor === "destructive" && "text-red-600",
                spinnerColor === "muted" && "text-slate-400"
              )}>
                {text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Page loading component
export interface PageLoadingProps {
  className?: string;
  text?: string;
  showLogo?: boolean;
}

export const PageLoading = ({
  className,
  text = "Loading...",
  showLogo = true,
}: PageLoadingProps) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/50 flex flex-col items-center justify-center z-50",
      className
    )}>
      {showLogo && (
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="TrendingUp" size="lg" className="text-white" />
          </div>
        </div>
      )}
      
      <LoadingSpinner size="xl" color="primary" variant="spinner" />
      
      {text && (
        <p className="mt-4 text-lg font-medium text-slate-600 animate-fade-in">
          {text}
        </p>
      )}
    </div>
  );
};

// Inline loading for buttons and small components
export interface InlineLoadingProps {
  className?: string;
  text?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "success" | "warning" | "destructive" | "muted";
}

export const InlineLoading = ({
  className,
  text,
  size = "sm",
  color = "default",
}: InlineLoadingProps) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <LoadingSpinner size={size} color={color} variant="spinner" />
      {text && (
        <span className={cn(
          "text-sm",
          color === "default" && "text-slate-600",
          color === "primary" && "text-blue-600",
          color === "success" && "text-green-600",
          color === "warning" && "text-amber-600",
          color === "destructive" && "text-red-600",
          color === "muted" && "text-slate-400"
        )}>
          {text}
        </span>
      )}
    </div>
  );
};

LoadingSpinner.displayName = "LoadingSpinner";
LoadingOverlay.displayName = "LoadingOverlay";
PageLoading.displayName = "PageLoading";
InlineLoading.displayName = "InlineLoading";