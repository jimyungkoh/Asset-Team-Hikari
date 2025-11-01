// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import clsx from "clsx";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const markdownComponents: Components = {
  h1({ node, className, ...props }) {
    return (
      <h1
        {...props}
        className={clsx(
          "mt-10 text-3xl font-bold leading-tight text-slate-900 first:mt-0",
          className,
        )}
      />
    );
  },
  h2({ node, className, ...props }) {
    return (
      <h2
        {...props}
        className={clsx(
          "mt-8 text-2xl font-semibold leading-snug text-slate-900 first:mt-0",
          className,
        )}
      />
    );
  },
  h3({ node, className, ...props }) {
    return (
      <h3
        {...props}
        className={clsx(
          "mt-6 text-xl font-semibold leading-snug text-slate-900 first:mt-0",
          className,
        )}
      />
    );
  },
  h4({ node, className, ...props }) {
    return (
      <h4
        {...props}
        className={clsx(
          "mt-6 text-lg font-semibold leading-snug text-slate-900 first:mt-0",
          className,
        )}
      />
    );
  },
  p({ node, className, ...props }) {
    return (
      <p
        {...props}
        className={clsx("leading-7 text-slate-700", className)}
      />
    );
  },
  a({ node, className, ...props }) {
    return (
      <a
        {...props}
        className={clsx(
          "text-blue-600 underline decoration-blue-400/60 underline-offset-4 transition-colors hover:text-blue-700 hover:decoration-blue-500",
          className,
        )}
        target="_blank"
        rel="noreferrer"
      />
    );
  },
  ul({ node, className, ...props }) {
    return (
      <ul
        {...props}
        className={clsx(
          "my-5 list-disc space-y-2 pl-6 text-slate-700 marker:text-slate-400",
          className,
        )}
      />
    );
  },
  ol({ node, className, ...props }) {
    return (
      <ol
        {...props}
        className={clsx(
          "my-5 list-decimal space-y-2 pl-6 text-slate-700 marker:text-slate-400",
          className,
        )}
      />
    );
  },
  li({ node, className, ...props }) {
    return (
      <li
        {...props}
        className={clsx("leading-relaxed", className)}
      />
    );
  },
  blockquote({ node, className, ...props }) {
    return (
      <blockquote
        {...props}
        className={clsx(
          "my-6 border-l-4 border-blue-200 bg-blue-50/60 px-5 py-4 text-slate-700 italic",
          className,
        )}
      />
    );
  },
  hr({ node, className, ...props }) {
    return (
      <hr
        {...props}
        className={clsx("my-10 border-slate-200", className)}
      />
    );
  },
  table({ node, className, children, ...props }) {
    return (
      <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table
          {...props}
          className={clsx(
            "w-full table-auto border-collapse text-left text-sm text-slate-800",
            className,
          )}
        >
          {children}
        </table>
      </div>
    );
  },
  thead({ node, className, ...props }) {
    return (
      <thead
        {...props}
        className={clsx("bg-slate-100 text-slate-600", className)}
      />
    );
  },
  tbody({ node, className, ...props }) {
    return (
      <tbody
        {...props}
        className={clsx("divide-y divide-slate-200", className)}
      />
    );
  },
  tr({ node, className, ...props }) {
    return (
      <tr
        {...props}
        className={clsx("hover:bg-slate-50/70", className)}
      />
    );
  },
  th({ node, className, ...props }) {
    return (
      <th
        {...props}
        className={clsx(
          "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600",
          className,
        )}
      />
    );
  },
  td({ node, className, ...props }) {
    return (
      <td
        {...props}
        className={clsx("px-4 py-3 align-top text-sm text-slate-700", className)}
      />
    );
  },
  code({ node, inline, className, children, ...props }) {
    if (inline) {
      return (
        <code
          {...props}
          className={clsx(
            "rounded bg-slate-100 px-1.5 py-0.5 text-[0.95em] font-medium text-slate-800",
            className,
          )}
        >
          {children}
        </code>
      );
    }

    const codeText = String(children).replace(/\n$/, "");
    return (
      <pre className="my-6 overflow-x-auto rounded-xl bg-slate-950 p-5 text-slate-100 shadow-lg">
        <code
          {...props}
          className={clsx("block text-sm leading-relaxed", className)}
        >
          {codeText}
        </code>
      </pre>
    );
  },
  img({ node, className, alt, ...props }) {
    return (
      <img
        {...props}
        alt={alt ?? ""}
        className={clsx(
          "my-6 w-full rounded-2xl border border-slate-200 object-contain",
          className,
        )}
        loading="lazy"
      />
    );
  },
  strong({ node, className, ...props }) {
    return (
      <strong
        {...props}
        className={clsx("font-semibold text-slate-900", className)}
      />
    );
  },
};

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps): JSX.Element {
  return (
    <div
      className={clsx(
        "markdown-content space-y-6 leading-relaxed text-slate-700",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
