// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-08
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

"use client";

import clsx from "clsx";
import { Loader2, Search, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { ROUTES } from "@/lib/constants";

const SEARCH_THROTTLE_MS = 450;

type SearchResponse = {
  tickers: string[];
};

interface TickerSearchProps {
  className?: string;
}

function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecutedRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastExecutedRef.current);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (delay === 0 || remaining <= 0 || value === "") {
      lastExecutedRef.current = now;
      setThrottledValue(value);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      lastExecutedRef.current = Date.now();
      setThrottledValue(value);
    }, remaining);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}

export function TickerSearch({ className }: TickerSearchProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const shortcutKeyRef = useRef<"meta" | "ctrl">("meta");

  const throttledQuery = useThrottledValue(inputValue, SEARCH_THROTTLE_MS);
  const hasSession = Boolean(session?.user?.email);
  const hasQuery = throttledQuery.trim().length > 0;
  const listboxId = useId();

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      shortcutKeyRef.current = /mac/i.test(navigator.platform)
        ? "meta"
        : "ctrl";
    }
  }, []);

  useEffect(() => {
    if (!hasSession) {
      setInputValue("");
      setResults([]);
      setIsOpen(false);
      setError(null);
      setActiveIndex(-1);
    }
  }, [hasSession]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  useEffect(() => {
    const handleGlobalShortcut = (event: globalThis.KeyboardEvent) => {
      if (!hasSession) {
        return;
      }

      const shortcutKey = shortcutKeyRef.current;
      const isShortcut =
        (shortcutKey === "meta" && event.metaKey) ||
        (shortcutKey === "ctrl" && event.ctrlKey);

      if (isShortcut && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);
    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, [hasSession]);

  const navigateToTicker = useCallback(
    (tickerSymbol: string) => {
      const normalizedTicker = tickerSymbol.trim().toUpperCase();
      if (!normalizedTicker) {
        return;
      }

      router.push(ROUTES.TICKERS.DETAIL(normalizedTicker));
      setInputValue("");
      setResults([]);
      setIsOpen(false);
      setError(null);
      setActiveIndex(-1);
    },
    [router]
  );

  const fetchResults = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const endpoint = `/api/tickers/search?query=${encodeURIComponent(query)}`;
      const response = await fetch(endpoint, { signal: controller.signal });

      if (!response.ok) {
        throw new Error("검색 요청에 실패했습니다.");
      }

      const data = (await response.json()) as SearchResponse;
      setResults(data.tickers);
      setIsOpen(true);
      setActiveIndex(data.tickers.length > 0 ? 0 : -1);
    } catch (fetchError) {
      if ((fetchError as Error).name === "AbortError") {
        return;
      }
      setError("티커 데이터를 불러오지 못했습니다.");
      setResults([]);
      setIsOpen(true);
      setActiveIndex(-1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    fetchResults(throttledQuery.trim());
  }, [fetchResults, throttledQuery, hasSession]);

  const handleSubmit = useCallback(
    (value?: string) => {
      const target = (value ?? inputValue).trim();
      if (!target) {
        return;
      }
      navigateToTicker(target);
    },
    [inputValue, navigateToTicker]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSubmit(results[activeIndex]);
        } else {
          handleSubmit();
        }
        return;
      }

      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (results.length === 0) {
          return;
        }
        setIsOpen(true);
        setActiveIndex((prevIndex) => {
          if (prevIndex < 0 || prevIndex >= results.length - 1) {
            return 0;
          }
          return prevIndex + 1;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (results.length === 0) {
          return;
        }
        setIsOpen(true);
        setActiveIndex((prevIndex) => {
          if (prevIndex <= 0) {
            return results.length - 1;
          }
          return prevIndex - 1;
        });
      }
    },
    [activeIndex, handleSubmit, results]
  );

  const clearInput = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setInputValue("");
    setResults([]);
    setIsOpen(false);
    setError(null);
    setActiveIndex(-1);
  }, []);

  const dropdownContent = useMemo(() => {
    if (!isOpen) {
      return null;
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          검색 중입니다...
        </div>
      );
    }

    if (error) {
      return <div className="px-4 py-3 text-sm text-red-500">{error}</div>;
    }

    if (!hasQuery) {
      return (
        <div className="px-4 py-3 text-sm text-slate-500">
          찾고 싶은 티커를 입력하세요.
        </div>
      );
    }

    if (results.length === 0) {
      return (
        <div className="px-4 py-3 text-sm text-slate-500">
          일치하는 티커가 없습니다.
        </div>
      );
    }

    optionRefs.current = [];

    return (
      <ul
        id={listboxId}
        role="listbox"
        className="max-h-60 overflow-y-auto py-1"
      >
        {results.map((tickerSymbol, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={tickerSymbol}>
              <button
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isActive}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-blue-50/80 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => navigateToTicker(tickerSymbol)}
              >
                <span className="font-semibold tracking-wide">
                  {tickerSymbol}
                </span>
                <span className="text-xs text-slate-400">
                  {ROUTES.TICKERS.DETAIL(tickerSymbol)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  }, [
    isOpen,
    isLoading,
    error,
    hasQuery,
    results,
    activeIndex,
    navigateToTicker,
    listboxId,
  ]);

  if (!hasSession) {
    return null;
  }

  return (
    <div ref={containerRef} className={clsx("relative w-full", className)}>
      <div
        className={clsx(
          "flex w-full items-center rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 text-sm text-slate-700 shadow-sm backdrop-blur transition-all focus-within:border-white focus-within:bg-white",
          (isFocused || isOpen) && "ring-1 ring-blue-100"
        )}
      >
        <Search className="mr-2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="티커 검색"
          className="w-full bg-transparent text-base placeholder:text-slate-400 focus:outline-none"
          aria-label="티커 검색"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
        />
        {inputValue && (
          <button
            type="button"
            aria-label="입력 지우기"
            className="mr-2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            onClick={clearInput}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {dropdownContent && (
        <div
          id={`${listboxId}-panel`}
          role="presentation"
          className="absolute top-full z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-xl backdrop-blur"
        >
          {dropdownContent}
        </div>
      )}
    </div>
  );
}
