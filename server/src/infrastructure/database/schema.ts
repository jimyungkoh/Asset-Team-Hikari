// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import {
  date,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
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

export const reports = pgTable(
  "reports",
  {
    id: serial("id").primaryKey(),
    ticker: varchar("ticker", { length: 32 }).notNull(),
    runDate: date("run_date").notNull(),
    dynamoTickerDate: varchar("dynamo_ticker_date", { length: 64 }).notNull(),
    dynamoArtifactKey: varchar("dynamo_artifact_key", {
      length: 128,
    }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    reportType: varchar("report_type", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tickerFk: foreignKey({
      columns: [table.ticker, table.runDate],
      foreignColumns: [tickerRuns.ticker, tickerRuns.runDate],
      name: "reports_ticker_run_fk",
    }),
    uniqueReport: unique("unique_ticker_run_report").on(
      table.ticker,
      table.runDate,
      table.reportType
    ),
    tickerIdx: index("reports_ticker_idx").on(table.ticker),
    runDateIdx: index("reports_run_date_idx").on(table.runDate),
  })
);
