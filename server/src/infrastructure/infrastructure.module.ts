// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-30
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Global, Module } from "@nestjs/common";

import { DynamoDbService } from "./dynamodb/dynamodb.service";
import { DatabaseService } from "./database/database.service";

@Global()
@Module({
  providers: [DynamoDbService, DatabaseService],
  exports: [DynamoDbService, DatabaseService],
})
export class InfrastructureModule {}
