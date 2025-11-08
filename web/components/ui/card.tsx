// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

'use client';

import * as React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '../../lib/utils';
import { LoadingOverlay } from './loading';

const cardVariants = cva(
  "rounded-2xl text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-xl",
        glass: "bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-xl hover:bg-white/50",
        outline: "bg-gradient-to-br from-white/40 via-white/30 to-blue-50/20 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(10,132,255,0.08)] hover:shadow-xl",
        elevated: "bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]",
        flat: "bg-white/60 backdrop-blur-lg border border-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:shadow-lg hover:bg-white/70",
        profit: "border-l-4 border-green-500 bg-gradient-to-r from-green-50/50 to-transparent hover:from-green-50/70",
        loss: "border-l-4 border-red-500 bg-gradient-to-r from-red-50/50 to-transparent hover:from-red-50/70",
        neutral: "border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent hover:from-amber-50/70",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  loading?: boolean;
  loadingText?: string;
}

export const Card = React.forwardRef<
  HTMLDivElement,
  CardProps
>(({ className, variant, size, interactive = false, loading, loadingText, children, ...props }, ref) => (
  <LoadingOverlay isLoading={loading ?? false} text={loadingText}>
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, interactive }), className)}
      {...props}
    >
      {children}
    </div>
  </LoadingOverlay>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-lg font-bold text-slate-900 leading-none tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-slate-600', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  ));
CardFooter.displayName = 'CardFooter';

// Financial card variants
export const FinancialCard = {
  Profit: (props: Omit<CardProps, "variant">) => (
    <Card variant="profit" {...props} />
  ),
  Loss: (props: Omit<CardProps, "variant">) => (
    <Card variant="loss" {...props} />
  ),
  Neutral: (props: Omit<CardProps, "variant">) => (
    <Card variant="neutral" {...props} />
  ),
};