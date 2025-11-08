// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { redirect } from "next/navigation";
import { ROUTES } from "../../../../lib/constants";

export default async function TickerReportsPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  redirect(ROUTES.TICKERS.DETAIL(ticker));
}
