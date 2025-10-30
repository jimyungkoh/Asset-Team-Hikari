// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import { Pool, PoolConfig } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { asc, desc, eq } from "drizzle-orm";

import { allowedUsers, tickerRuns } from "./schema";

type DatabaseSchema = {
  allowedUsers: typeof allowedUsers;
  tickerRuns: typeof tickerRuns;
};

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool | null;
  private readonly db: NodePgDatabase<DatabaseSchema> | null;

  constructor() {
    const connectionString = process.env.DB_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      this.logger.warn(
        "DB_URL (또는 DATABASE_URL) 값이 없어 DatabaseService가 비활성화됩니다."
      );
      this.pool = null;
      this.db = null;
      return;
    }

    const poolConfig: PoolConfig = {
      connectionString,
    };

    if (this.requiresSsl(connectionString)) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    this.pool = new Pool(poolConfig);
    this.db = drizzle(this.pool, {
      schema: {
        allowedUsers,
        tickerRuns,
      },
    });

    this.logger.log("DatabaseService initialized with PostgreSQL connection");
  }

  get isEnabled(): boolean {
    return Boolean(this.db);
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    if (!this.db) {
      this.logger.warn(
        "isEmailAllowed 호출 시 DatabaseService가 비활성화 상태입니다."
      );
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rows = await this.db
      .select({ email: allowedUsers.email })
      .from(allowedUsers)
      .where(eq(allowedUsers.email, normalizedEmail))
      .limit(1);

    return rows.length > 0;
  }

  async recordTickerRun(ticker: string, runDate: string): Promise<void> {
    if (!this.db) {
      return;
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    const now = new Date();

    await this.db
      .insert(tickerRuns)
      .values({
        ticker: normalizedTicker,
        runDate,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: [tickerRuns.ticker, tickerRuns.runDate],
        set: {
          lastSeenAt: now,
        },
      });
  }

  async listTickers(): Promise<string[]> {
    if (!this.db) {
      return [];
    }

    const rows = await this.db
      .select({ ticker: tickerRuns.ticker })
      .from(tickerRuns)
      .groupBy(tickerRuns.ticker)
      .orderBy(asc(tickerRuns.ticker));

    return rows.map((row) => row.ticker);
  }

  async listRunDates(ticker: string): Promise<string[]> {
    if (!this.db) {
      return [];
    }

    const normalizedTicker = ticker.trim().toUpperCase();

    const rows = await this.db
      .select({ runDate: tickerRuns.runDate })
      .from(tickerRuns)
      .where(eq(tickerRuns.ticker, normalizedTicker))
      .orderBy(desc(tickerRuns.runDate));

    return rows.map((row) => row.runDate);
  }

  async terminate(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }

  private requiresSsl(connectionString: string): boolean {
    return (
      connectionString.includes("supabase.co") ||
      connectionString.startsWith("postgresql://")
    );
  }
}
