// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Icon, type IconProps } from "./icon";
import { LoadingSpinner } from "./loading";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] active:scale-[0.98]",
        profit:
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-[1.02] active:scale-[0.98]",
        loss:
          "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-rose-700 transform hover:scale-[1.02] active:scale-[0.98]",
        neutral:
          "bg-gradient-to-r from-amber-500 to-yellow-600 text-white shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-yellow-700 transform hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-white/30 bg-white/40 backdrop-blur text-slate-900 hover:bg-white/60 hover:border-white/50 transform hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-slate-200/50 backdrop-blur text-slate-900 border border-white/30 hover:bg-slate-300/50 transform hover:scale-[1.02] active:scale-[0.98]",
        ghost:
          "text-slate-900 hover:bg-white/40 backdrop-blur hover:border border-white/30 transform hover:scale-[1.02] active:scale-[0.98]",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  icon?: IconProps["name"];
  iconPosition?: "left" | "right";
  iconSize?: IconProps["size"];
}

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  icon,
  iconPosition = "left",
  iconSize = "sm",
  children,
  disabled,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  
  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner size={iconSize} variant="spinner" className="text-current" />;
    }
    
    if (icon) {
      return <Icon name={icon} size={iconSize} className="text-current" />;
    }
    
    return null;
  };

  const buttonContent = (
    <>
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      
      {/* Icon and content */}
      <div className="flex items-center justify-center gap-2 relative z-10">
        {iconPosition === "left" && renderIcon()}
        {children}
        {iconPosition === "right" && renderIcon()}
      </div>
    </>
  );

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </Comp>
  );
};

// Financial specific button variants
export const FinancialButton = {
  Profit: (props: Omit<ButtonProps, "variant">) => (
    <Button variant="profit" {...props} />
  ),
  Loss: (props: Omit<ButtonProps, "variant">) => (
    <Button variant="loss" {...props} />
  ),
  Neutral: (props: Omit<ButtonProps, "variant">) => (
    <Button variant="neutral" {...props} />
  ),
};

Button.displayName = "Button";
