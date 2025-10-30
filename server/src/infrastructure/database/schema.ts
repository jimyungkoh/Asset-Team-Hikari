// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { pgTable, primaryKey, timestamp, varchar, date } from "drizzle-orm/pg-core";

export const allowedUsers = pgTable("allowed_users", {
  email: varchar("email", { length: 255 }).primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tickerRuns = pgTable(
  "ticker_runs",
  {
    ticker: varchar("ticker", { length: 32 }).notNull(),
    runDate: date("run_date").notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.ticker, table.runDate] }),
  })
);
