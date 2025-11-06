// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import type { PropsWithChildren, ReactNode } from "react";

import { surfaceClass, textStyles } from "../../lib/design-system";

interface SectionProps extends PropsWithChildren {
  title: string;
  description?: string;
  leading?: ReactNode;
  variant?: "default" | "soft" | "outline";
  icon?: string;
}

export function Section({
  children,
  title,
  description,
  leading,
  variant = "default",
  icon,
}: SectionProps): JSX.Element {
  const surface =
    variant === "soft"
      ? surfaceClass("soft")
      : variant === "outline"
      ? surfaceClass("outline")
      : surfaceClass("base");

  return (
    <section className="flex flex-col gap-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {leading}
        <div className="flex items-start gap-4">
          {icon && <div className="text-3xl md:text-4xl mt-1">{icon}</div>}
          <div className="flex-1 min-w-0">
            <h2 className={textStyles.sectionTitle}>{title}</h2>
            {description && (
              <p className={textStyles.sectionSubtitle + " mt-2"}>
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="md:rounded-2xl md:bg-white/80 md:backdrop-blur-xl md:border md:border-white/20 md:shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:p-10 md:transition-all md:hover:shadow-lg">
        {children}
      </div>
    </section>
  );
}
