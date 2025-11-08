// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("REDIS_URL environment variable is required");
    }

    this.client = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on("connect", () => {
      this.logger.log("Redis connected");
    });

    this.client.on("error", (error) => {
      this.logger.error("Redis connection error", error);
    });

    this.logger.log("RedisService initialized");
  }

  getClient(): Redis {
    return this.client;
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.set(key, "1", "EX", ttlSeconds, "NX");
      return result === "OK";
    } catch (error) {
      this.logger.error(
        `Failed to acquire lock for key: ${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Failed to release lock for key: ${key}`,
        error instanceof Error ? error : new Error(String(error))
      );
      // TTL로 자동 만료되므로 치명적이지 않음
    }
  }
}
