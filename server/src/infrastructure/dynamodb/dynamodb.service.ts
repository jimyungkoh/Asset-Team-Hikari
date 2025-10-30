// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
  DynamoDBClientConfig,
  ResourceInUseException,
  ResourceNotFoundException,
  TableStatus,
} from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { Injectable, Logger } from "@nestjs/common";

interface PutItemParams<T extends Record<string, unknown>> {
  tableName: string;
  item: T;
  conditionExpression?: string;
}

interface GetItemParams {
  tableName: string;
  key: Record<string, unknown>;
}

interface UpdateItemParams<T extends Record<string, unknown>> {
  tableName: string;
  key: Record<string, unknown>;
  attributes: Partial<T>;
  conditionExpression?: string;
}

interface DeleteItemParams {
  tableName: string;
  key: Record<string, unknown>;
  conditionExpression?: string;
}

interface QueryItemsParams {
  tableName: string;
  keyConditionExpression: string;
  expressionAttributeValues: Record<string, unknown>;
  expressionAttributeNames?: Record<string, string>;
  filterExpression?: string;
  indexName?: string;
  limit?: number;
  scanIndexForward?: boolean;
}

const DEFAULT_REGION = "us-east-1";

interface CreateTableParams {
  tableName: string;
  partitionKey: { name: string; type: "S" | "N" | "B" };
  sortKey?: { name: string; type: "S" | "N" | "B" };
  billingMode?: "PAY_PER_REQUEST" | "PROVISIONED";
  readCapacityUnits?: number;
  writeCapacityUnits?: number;
}

@Injectable()
export class DynamoDbService {
  private readonly logger = new Logger(DynamoDbService.name);
  private readonly nativeClient: DynamoDBClient;
  private readonly documentClient: DynamoDBDocumentClient;
  private readonly tablePrefix: string | undefined;

  constructor() {
    const region = process.env.AWS_REGION ?? DEFAULT_REGION;
    const endpoint = process.env.DYNAMODB_ENDPOINT;
    const tablePrefix = process.env.DYNAMO_TABLE_PREFIX;

    const clientConfig: DynamoDBClientConfig = {
      region,
    };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.nativeClient = new DynamoDBClient(clientConfig);

    this.documentClient = DynamoDBDocumentClient.from(this.nativeClient, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
    this.tablePrefix = tablePrefix;
  }

  async putItem<T extends Record<string, unknown>>({
    tableName,
    item,
    conditionExpression,
  }: PutItemParams<T>): Promise<void> {
    const resolvedTableName = this.resolveTableName(tableName);

    try {
      await this.documentClient.send(
        new PutCommand({
          TableName: resolvedTableName,
          Item: item,
          ConditionExpression: conditionExpression,
        })
      );
    } catch (error) {
      this.logAndRethrow(error, "putItem", resolvedTableName);
    }
  }

  async getItem<T = Record<string, unknown>>({
    tableName,
    key,
  }: GetItemParams): Promise<T | null> {
    const resolvedTableName = this.resolveTableName(tableName);

    try {
      const response = await this.documentClient.send(
        new GetCommand({
          TableName: resolvedTableName,
          Key: key,
        })
      );

      return (response.Item as T | undefined) ?? null;
    } catch (error) {
      this.logAndRethrow(error, "getItem", resolvedTableName);
    }
  }

  async updateItem<T extends Record<string, unknown>>({
    tableName,
    key,
    attributes,
    conditionExpression,
  }: UpdateItemParams<T>): Promise<T | null> {
    const resolvedTableName = this.resolveTableName(tableName);

    if (Object.keys(attributes).length === 0) {
      this.logger.warn(
        `${resolvedTableName}: updateItem 호출 시 업데이트할 속성이 제공되지 않았습니다.`
      );
      return this.getItem<T>({ tableName, key });
    }

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    const setExpressions = Object.entries(attributes)
      .filter(([, value]) => typeof value !== "undefined")
      .map(([attr, value]) => {
        const attributeName = `#${attr}`;
        const attributeValue = `:${attr}`;
        expressionAttributeNames[attributeName] = attr;
        expressionAttributeValues[attributeValue] = value;
        return `${attributeName} = ${attributeValue}`;
      });

    if (setExpressions.length === 0) {
      this.logger.warn(
        `${resolvedTableName}: updateItem 호출 시 유효한 업데이트 표현식이 생성되지 않았습니다.`
      );
      return this.getItem<T>({ tableName, key });
    }

    try {
      const response = await this.documentClient.send(
        new UpdateCommand({
          TableName: resolvedTableName,
          Key: key,
          UpdateExpression: `SET ${setExpressions.join(", ")}`,
          ConditionExpression: conditionExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      return (response.Attributes as T | undefined) ?? null;
    } catch (error) {
      this.logAndRethrow(error, "updateItem", resolvedTableName);
    }
  }

  async deleteItem({
    tableName,
    key,
    conditionExpression,
  }: DeleteItemParams): Promise<void> {
    const resolvedTableName = this.resolveTableName(tableName);

    try {
      await this.documentClient.send(
        new DeleteCommand({
          TableName: resolvedTableName,
          Key: key,
          ConditionExpression: conditionExpression,
        })
      );
    } catch (error) {
      this.logAndRethrow(error, "deleteItem", resolvedTableName);
    }
  }

  async queryItems<T = Record<string, unknown>>({
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    expressionAttributeNames,
    filterExpression,
    indexName,
    limit,
    scanIndexForward,
  }: QueryItemsParams): Promise<T[]> {
    const resolvedTableName = this.resolveTableName(tableName);

    try {
      const response = await this.documentClient.send(
        new QueryCommand({
          TableName: resolvedTableName,
          IndexName: indexName,
          KeyConditionExpression: keyConditionExpression,
          FilterExpression: filterExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: expressionAttributeNames,
          Limit: limit,
          ScanIndexForward: scanIndexForward,
        })
      );

      return (response.Items as T[]) ?? [];
    } catch (error) {
      this.logAndRethrow(error, "queryItems", resolvedTableName);
    }
  }

  async createTable({
    tableName,
    partitionKey,
    sortKey,
    billingMode = "PAY_PER_REQUEST",
    readCapacityUnits,
    writeCapacityUnits,
  }: CreateTableParams): Promise<void> {
    const resolvedTableName = this.resolveTableName(tableName);

    const keySchema: Array<{
      AttributeName: string;
      KeyType: "HASH" | "RANGE";
    }> = [
      {
        AttributeName: partitionKey.name,
        KeyType: "HASH",
      },
    ];

    const attributeDefinitions: Array<{
      AttributeName: string;
      AttributeType: "S" | "N" | "B";
    }> = [
      {
        AttributeName: partitionKey.name,
        AttributeType: partitionKey.type,
      },
    ];

    if (sortKey) {
      keySchema.push({
        AttributeName: sortKey.name,
        KeyType: "RANGE",
      });
      attributeDefinitions.push({
        AttributeName: sortKey.name,
        AttributeType: sortKey.type,
      });
    }

    const tableParams: {
      TableName: string;
      KeySchema: typeof keySchema;
      AttributeDefinitions: typeof attributeDefinitions;
      BillingMode?: "PAY_PER_REQUEST" | "PROVISIONED";
      ProvisionedThroughput?: {
        ReadCapacityUnits: number;
        WriteCapacityUnits: number;
      };
    } = {
      TableName: resolvedTableName,
      KeySchema: keySchema,
      AttributeDefinitions: attributeDefinitions,
    };

    if (billingMode === "PROVISIONED") {
      if (!readCapacityUnits || !writeCapacityUnits) {
        throw new Error(
          "PROVISIONED billing mode requires readCapacityUnits and writeCapacityUnits"
        );
      }
      tableParams.BillingMode = "PROVISIONED";
      tableParams.ProvisionedThroughput = {
        ReadCapacityUnits: readCapacityUnits,
        WriteCapacityUnits: writeCapacityUnits,
      };
    } else {
      tableParams.BillingMode = "PAY_PER_REQUEST";
    }

    try {
      await this.nativeClient.send(new CreateTableCommand(tableParams));
      this.logger.log(`테이블이 생성되었습니다: ${resolvedTableName}`);
    } catch (error) {
      if (error instanceof ResourceInUseException) {
        this.logger.warn(`테이블이 이미 존재합니다: ${resolvedTableName}`);
        return;
      }
      this.logAndRethrow(error, "createTable", resolvedTableName);
    }
  }

  async tableExists(tableName: string): Promise<boolean> {
    const resolvedTableName = this.resolveTableName(tableName);

    try {
      const response = await this.nativeClient.send(
        new DescribeTableCommand({
          TableName: resolvedTableName,
        })
      );

      return (
        response.Table?.TableStatus === TableStatus.ACTIVE ||
        response.Table?.TableStatus === TableStatus.CREATING
      );
    } catch (error) {
      if (error instanceof ResourceNotFoundException) {
        return false;
      }
      this.logger.error(
        `테이블 존재 여부 확인 중 오류가 발생했습니다: ${resolvedTableName}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  async ensureTableExists(params: CreateTableParams): Promise<void> {
    const resolvedTableName = this.resolveTableName(params.tableName);
    const exists = await this.tableExists(params.tableName);

    if (!exists) {
      await this.createTable(params);
      // 테이블이 ACTIVE 상태가 될 때까지 대기
      await this.waitForTableActive(resolvedTableName);
    } else {
      this.logger.log(`테이블이 이미 존재합니다: ${resolvedTableName}`);
    }
  }

  private async waitForTableActive(
    tableName: string,
    maxWaitTimeMs = 60000
  ): Promise<void> {
    const startTime = Date.now();
    const checkInterval = 2000; // 2초마다 확인

    while (Date.now() - startTime < maxWaitTimeMs) {
      try {
        const response = await this.nativeClient.send(
          new DescribeTableCommand({ TableName: tableName })
        );

        if (response.Table?.TableStatus === TableStatus.ACTIVE) {
          this.logger.log(`테이블이 활성화되었습니다: ${tableName}`);
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      } catch (error) {
        this.logger.error(
          `테이블 상태 확인 중 오류가 발생했습니다: ${tableName}`,
          error instanceof Error ? error.stack : undefined
        );
        throw error;
      }
    }

    throw new Error(
      `테이블이 ${maxWaitTimeMs}ms 내에 활성화되지 않았습니다: ${tableName}`
    );
  }

  private resolveTableName(tableName: string): string {
    if (this.tablePrefix) {
      return `${this.tablePrefix}${tableName}`;
    }

    return tableName;
  }

  private logAndRethrow(
    error: unknown,
    operation: string,
    tableName: string
  ): never {
    const stack = error instanceof Error ? error.stack : undefined;
    const message = error instanceof Error ? error.message : String(error);

    this.logger.error(
      `${tableName}: ${operation} 호출 중 오류가 발생했습니다 - ${message}`,
      stack,
      DynamoDbService.name
    );

    throw error instanceof Error ? error : new Error(message);
  }
}
