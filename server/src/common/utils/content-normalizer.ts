// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export function normalizeReportContent(rawContent: string | null | undefined): string {
  const trimmed = typeof rawContent === "string" ? rawContent.trim() : "";
  if (!trimmed) {
    return "";
  }

  const parsed = tryParseJson(trimmed);
  if (typeof parsed === "undefined") {
    return trimmed;
  }

  const markdown = stringifyStructuredContent(parsed).trim();
  return markdown || trimmed;
}

export function stringifyStructuredContent(
  content: unknown,
  separator = "\n\n",
): string {
  if (content === null || typeof content === "undefined") {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  if (Array.isArray(content)) {
    const parts = content
      .map((item) => stringifyStructuredContent(item, separator).trim())
      .filter((text) => text.length > 0);
    return parts.join(separator);
  }

  if (typeof content === "object") {
    const record = content as Record<string, unknown>;

    if ("text" in record) {
      return stringifyStructuredContent(record["text"], separator);
    }

    if ("content" in record) {
      return stringifyStructuredContent(record["content"], separator);
    }

    const entries = Object.entries(record)
      .map(([key, value]) => {
        const formatted = stringifyStructuredContent(value, separator).trim();
        if (!formatted) {
          return "";
        }

        const label = formatKeyLabel(key);
        if (formatted.includes("\n")) {
          return `- **${label}:**\n${indentMultiline(formatted, 2)}`;
        }
        return `- **${label}:** ${formatted}`;
      })
      .filter((entry) => entry.length > 0);

    if (entries.length > 0) {
      return entries.join("\n");
    }

    try {
      return JSON.stringify(record, null, 2);
    } catch {
      return String(record);
    }
  }

  return String(content);
}

function tryParseJson(value: string): unknown | undefined {
  const candidate = value.trim();
  if (!candidate) {
    return undefined;
  }

  try {
    return JSON.parse(candidate);
  } catch {
    return undefined;
  }
}

function formatKeyLabel(key: string): string {
  return key
    .replace(/[_\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function indentMultiline(value: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => (line ? `${indent}${line}` : line))
    .join("\n");
}
