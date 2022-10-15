import { ddbDocClient } from "./ddbDocClient";
import { generateUpdateExpression } from "./generateUpdateExpression";
import { BatchWriteCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  DescribeTableCommand,
  CreateTableCommand,
  ListTablesCommand
} from "@aws-sdk/client-dynamodb";

const { DYNAMODB_TABLE_NAME } = process.env;

/**
 * This ddbClient object provides only the DDB methods needed by PushService.
 */
export const ddbClient = {
  batchUpsertItems: async (
    items: Array<Record<string, any>>,
    batchUpsertItemsOpts: DDBSingleTableCommandParameters<typeof BatchWriteCommand> = {}
  ) => {
    // TODO Add handling to batchUpsertItems for `result.UnprocessedItems`
    await ddbDocClient.send(
      new BatchWriteCommand({
        ...batchUpsertItemsOpts,
        RequestItems: {
          [DYNAMODB_TABLE_NAME]: items.map((item) => ({ PutRequest: { Item: item } }))
        }
      })
    );
  },

  updateItem: async (
    primaryKeys: Record<string, string>,
    attributesToUpdate: Record<string, any>,
    updateItemOpts: DDBSingleTableCommandParameters<typeof UpdateCommand> = {}
  ) => {
    // Destructure constants from updateItemOpts to set default ReturnValues
    const { ReturnValues = "ALL_NEW", ...otherUpdateItemOpts } = updateItemOpts;

    // Destructure updateItemOpts which may be updated
    let { UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = updateItemOpts;

    if (!UpdateExpression) {
      /* For now, ensure the caller hasn't provided "ExpressionAttributeValues"
      /"ExpressionAttributeValues". In the future, however, the auto-gen'd EA
      Names/Values objects could be merged with the caller's EA Names/Values args,
      with any existing key-placeholders regex-swapped in the ConditionExpression
      (if provided). Support could also be added for nested value updates (right
        now it just uses top-level keys and values).      */
      if (ExpressionAttributeNames || ExpressionAttributeValues) {
        throw new Error(
          `(ddbTable.updateItem) For auto-generated "UpdateExpression"s, params "ExpressionAttribute{Names,Values}" must not be provided.`
        );
      }

      // Auto-gen UpdateExpression if not provided (and ExprAttrValues)
      // prettier-ignore
      ({ UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues } = generateUpdateExpression(attributesToUpdate));
    }

    const { Attributes } = await ddbDocClient.send(
      new UpdateCommand({
        ...otherUpdateItemOpts, // <-- Placed first, so the rest overwrite.
        ReturnValues,
        UpdateExpression,
        ...(ExpressionAttributeNames && { ExpressionAttributeNames }),
        ...(ExpressionAttributeValues && { ExpressionAttributeValues }),
        TableName: DYNAMODB_TABLE_NAME,
        Key: primaryKeys
      })
    );

    return Attributes;
  },

  batchDeleteItems: async (
    primaryKeys: Array<Record<string, string>>,
    batchDeleteItemsOpts: DDBSingleTableCommandParameters<typeof BatchWriteCommand> = {}
  ) => {
    // TODO Add handling to batchDeleteItems for `result.UnprocessedItems`
    await ddbDocClient.send(
      new BatchWriteCommand({
        ...batchDeleteItemsOpts,
        RequestItems: {
          [DYNAMODB_TABLE_NAME]: primaryKeys.map((keyObj) => ({ DeleteRequest: { Key: keyObj } }))
        }
      })
    );
  },

  query: async (queryOpts: DDBSingleTableCommandParameters<typeof QueryCommand>) => {
    const { Items } = await ddbDocClient.send(
      new QueryCommand({
        ...queryOpts,
        TableName: DYNAMODB_TABLE_NAME
      })
    );
    return Items;
  },

  // UTILITY METHODS (only used for setting up ddb-local tables in dev/test env)
  ...(/^(dev|test)/i.test(process.env.NODE_ENV) && {
    describeTable: async (tableName?: string) => {
      const { Table } = await ddbDocClient.send(
        new DescribeTableCommand({ TableName: tableName ?? DYNAMODB_TABLE_NAME })
      );
      return Table ?? {};
    },

    createTable: async (
      createTableArgs: DDBSingleTableCommandParameters<typeof CreateTableCommand>
    ) => {
      const { TableDescription } = await ddbDocClient.send(
        new CreateTableCommand({
          ...createTableArgs,
          TableName: DYNAMODB_TABLE_NAME
        })
      );
      return TableDescription ?? {};
    },

    listTables: async () => {
      const { TableNames } = await ddbDocClient.send(new ListTablesCommand({}));
      return TableNames ?? [];
    }
  })
};

/**
 * This generic provides type definitions for the DynamoDB "opts" parameters used
 * in DDBSingleTableClient methods. It takes a DDB client command class `<C>`,
 * and returns it's lone constructor parameter - an object - with certain fields
 * ommitted. The list of ommitted fields includes all parameters identified as
 * "legacy parameters" in the DynamoDB API documentation, as well as any parameters
 * which are either provided by DDBSingleTableClient instances (like "TableName"),
 * or moved to the method's first positional parameter (like "Key").
 */
export type DDBSingleTableCommandParameters<C extends abstract new (...args: any) => any> = Expand<
  Omit<
    ConstructorParameters<C>[0],
    | "TableName" //            Handled by DDBSingleTableClient methods
    | "Key" //                  Handled by DDBSingleTableClient methods
    | "Item" //                 Handled by DDBSingleTableClient methods
    | "RequestItems" //         Handled by DDBSingleTableClient methods
    | "AttributesToGet" //      Legacy param: instead use ProjectionExpression
    | "AttributeUpdates" //     Legacy param: instead use UpdateExpression
    | "ConditionalOperator" //  Legacy param: instead use ConditionExpression (for Query/Scan, instead use FilterExpression)
    | "Expected" //             Legacy param: instead use ConditionExpression
    | "KeyConditions" //        Legacy param: instead use KeyConditionExpression
    | "QueryFilter" //          Legacy param: instead use FilterExpression
    | "ScanFilter" //           Legacy param: instead use FilterExpression
  >
>;
