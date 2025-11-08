// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-06
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Global, Module } from "@nestjs/common";

import { DynamoDbService } from "./dynamodb/dynamodb.service";
import { DatabaseService } from "./database/database.service";
import { OpenRouterAiClient } from "./ai/openrouter-ai.client";
import { RedisService } from "./redis/redis.service";

@Global()
@Module({
  providers: [DynamoDbService, DatabaseService, OpenRouterAiClient, RedisService],
  exports: [DynamoDbService, DatabaseService, OpenRouterAiClient, RedisService],
})
export class InfrastructureModule {}
