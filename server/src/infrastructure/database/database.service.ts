// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/supabase-js";
import { asc, desc, eq } from "drizzle-orm";

import { allowedUsers, tickerRuns } from "./schema";

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly supabase: SupabaseClient | null;
  private readonly db: ReturnType<typeof drizzle> | null;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      this.logger.warn(
        "Supabase 환경 변수가 설정되지 않아 DatabaseService가 비활성화됩니다."
      );
      this.supabase = null;
      this.db = null;
      return;
    }

    this.supabase = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
      },
    });

    this.db = drizzle(this.supabase, {
      schema: {
        allowedUsers,
        tickerRuns,
      },
    });
    this.logger.log("DatabaseService initialized with Supabase client");
  }

  get isEnabled(): boolean {
    return Boolean(this.db);
  }

  async isEmailAllowed(email: string): Promise<boolean> {
    if (!this.db) {
      this.logger.warn("isEmailAllowed 호출 시 DatabaseService가 비활성화 상태입니다.");
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
    const runDateValue = new Date(`${runDate}T00:00:00Z`);
    const now = new Date();

    await this.db
      .insert(tickerRuns)
      .values({
        ticker: normalizedTicker,
        runDate: runDateValue,
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

    return rows.map((row) => {
      if (row.runDate instanceof Date) {
        return row.runDate.toISOString().slice(0, 10);
      }
      return String(row.runDate);
    });
  }
}
