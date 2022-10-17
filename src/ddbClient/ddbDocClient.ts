import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({
    region: process.env.DYNAMODB_TABLE_REGION,
    ...(/^(dev|test)/i.test(process.env.NODE_ENV) && {
      endpoint: process.env.DYNAMODB_LOCAL_ENDPOINT_URL
    })
  }),
  {
    marshallOptions: {
      convertEmptyValues: false, // Whether to automatically convert empty strings, blobs, and sets to `null` (false by default).
      removeUndefinedValues: true, // Whether to remove undefined values while marshalling (false by default).
      convertClassInstanceToMap: true // Whether to convert typeof object to map attribute (false by default).
    },
    unmarshallOptions: {
      wrapNumbers: false // Whether to return numbers as a string instead of converting them to native JavaScript numbers (false by default).
    }
  }
);
