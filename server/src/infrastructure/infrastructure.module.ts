// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-28
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Global, Module } from "@nestjs/common";

import { DynamoDbService } from "./dynamodb/dynamodb.service";

@Global()
@Module({
  providers: [DynamoDbService],
  exports: [DynamoDbService],
})
export class InfrastructureModule {}
