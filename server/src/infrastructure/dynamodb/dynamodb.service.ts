// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-10-27
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";
import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

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

@Injectable()
export class DynamoDbService {
  private readonly logger = new Logger(DynamoDbService.name);
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
        sessionToken: process.env.AWS_SESSION_TOKEN,
      };
    }

    const nativeClient = new DynamoDBClient(clientConfig);

    this.documentClient = DynamoDBDocumentClient.from(nativeClient, {
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
