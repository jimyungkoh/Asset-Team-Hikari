// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Global, Module } from "@nestjs/common";

import { DynamoDbService } from "./dynamodb/dynamodb.service";
import { DatabaseService } from "./database/database.service";
import { OpenRouterAiClient } from "./ai/openrouter-ai.client";

@Global()
@Module({
  providers: [DynamoDbService, DatabaseService, OpenRouterAiClient],
  exports: [DynamoDbService, DatabaseService, OpenRouterAiClient],
})
export class InfrastructureModule {}
