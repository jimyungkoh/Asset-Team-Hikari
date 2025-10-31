// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

export function getNestBase(): string {
  const base = process.env.NEST_API_BASE ?? "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export function getInternalHeaders(): Record<string, string> {
  const internalToken = process.env.INTERNAL_API_TOKEN;
  const skipTokenAuth = process.env.SKIP_TOKEN_AUTH === "true";

  if (!internalToken && !skipTokenAuth) {
    throw new Error(
      "INTERNAL_API_TOKEN must be configured in Next.js environment"
    );
  }

  return internalToken ? { "X-Internal-Token": internalToken } : {};
}

