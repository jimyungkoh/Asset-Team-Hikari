// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

interface StatusBadgeProps {
  status: string;
}

function resolveStatus(status: string): "success" | "failed" | "pending" {
  if (status === "success") {
    return "success";
  }
  if (status === "failed") {
    return "failed";
  }
  return "pending";
}

function statusClass(resolved: "success" | "failed" | "pending"): string {
  switch (resolved) {
    case "success":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

function statusLabel(resolved: "success" | "failed" | "pending"): string {
  switch (resolved) {
    case "success":
      return "성공";
    case "failed":
      return "실패";
    default:
      return "진행중";
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const resolved = resolveStatus(status);

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass(
        resolved
      )}`}
    >
      {statusLabel(resolved)}
    </span>
  );
}
