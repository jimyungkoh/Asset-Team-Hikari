// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import { useEffect, useRef, useState } from "react";

interface UseScrollDirectionOptions {
  threshold?: number;
  throttleMs?: number;
}

export function useScrollDirection(
  { threshold = 10, throttleMs = 100 }: UseScrollDirectionOptions = {}
) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollYRef = useRef(0);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (throttleTimeoutRef.current) {
        return;
      }

      throttleTimeoutRef.current = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollYRef.current;

        if (Math.abs(scrollDifference) > threshold) {
          setIsScrollingDown(scrollDifference > 0 && currentScrollY > 0);
          lastScrollYRef.current = currentScrollY;
        }

        throttleTimeoutRef.current = null;
      }, throttleMs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [threshold, throttleMs]);

  return isScrollingDown;
}
