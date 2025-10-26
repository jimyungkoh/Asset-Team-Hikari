// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-24
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-lg border border-white/30 bg-white/50 backdrop-blur px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:border-blue-400 transition-all disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
