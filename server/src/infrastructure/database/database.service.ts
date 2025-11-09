// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-31
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import { Pool, PoolConfig } from "pg";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { asc, desc, eq, ilike } from "drizzle-orm";

import { users, ticker, reports } from "./schema";

type DatabaseSchema = {
  users: typeof users;
  ticker: typeof ticker;
  reports: typeof reports;
};

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool | null;
  private readonly _db: NodePgDatabase<DatabaseSchema> | null;

  constructor() {
    const connectionString = process.env.DB_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      this.logger.warn(
        "DB_URL (또는 DATABASE_URL) 값이 없어 DatabaseService가 비활성화됩니다."
      );
      this.pool = null;
      this._db = null;
      return;
    }

    const poolConfig: PoolConfig = {
      connectionString,
    };

    if (this.requiresSsl(connectionString)) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    this.pool = new Pool(poolConfig);
    this._db = drizzle(this.pool, {
      schema: {
        users,
        ticker,
        reports,
      },
    });

    this.logger.log("DatabaseService initialized with PostgreSQL connection");
  }

  get isEnabled(): boolean {
    return Boolean(this._db);
  }

  get db(): NodePgDatabase<DatabaseSchema> | null {
    return this._db;
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    if (!this._db) {
      this.logger.warn(
        "isEmailAllowed 호출 시 DatabaseService가 비활성화 상태입니다."
      );
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const rows = await this._db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    return rows.length > 0;
  }

  async recordTickerRun(tickerSymbol: string, runDate: string): Promise<void> {
    if (!this._db) {
      return;
    }

    const normalizedTicker = tickerSymbol.trim().toUpperCase();
    const now = new Date();

    await this._db
      .insert(ticker)
      .values({
        ticker: normalizedTicker,
        runDate,
        lastSeenAt: now,
      })
      .onConflictDoUpdate({
        target: [ticker.ticker, ticker.runDate],
        set: {
          lastSeenAt: now,
        },
      });
  }

  async listTickers(): Promise<string[]> {
    if (!this._db) {
      return [];
    }

    const rows = await this._db
      .select({ ticker: ticker.ticker })
      .from(ticker)
      .groupBy(ticker.ticker)
      .orderBy(asc(ticker.ticker));

    return rows.map((row) => row.ticker);
  }

  async listRunDates(tickerSymbol: string): Promise<string[]> {
    if (!this._db) {
      return [];
    }

    const normalizedTicker = tickerSymbol.trim().toUpperCase();

    const rows = await this._db
      .select({ runDate: ticker.runDate })
      .from(ticker)
      .where(eq(ticker.ticker, normalizedTicker))
      .orderBy(desc(ticker.runDate));

    return rows.map((row) => row.runDate);
  }

  async searchTickers(query: string, limit = 10): Promise<string[]> {
    if (!this._db) {
      return [];
    }

    const normalizedQuery = query.trim().toUpperCase();
    if (!normalizedQuery) {
      return [];
    }

    const rows = await this._db
      .select({ ticker: ticker.ticker })
      .from(ticker)
      .where(ilike(ticker.ticker, `${normalizedQuery}%`))
      .groupBy(ticker.ticker)
      .orderBy(asc(ticker.ticker))
      .limit(limit);

    return rows.map((row) => row.ticker);
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
