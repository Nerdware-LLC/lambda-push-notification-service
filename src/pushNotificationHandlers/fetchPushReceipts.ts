import { expoPushService } from "./expoPushService";
import { PushServiceError } from "./PushServiceError";
import type { FixitPushNotification, ExpoPushTicket } from "./types";
import { ddbClient } from "../ddbClient";

export const fetchPushReceipts = async () => {
  const dbPushReceipts = await ddbClient.query({
    IndexName: "Overloaded_Data_GSI",
    KeyConditionExpression: "#d = :data",
    ExpressionAttributeNames: { "#d": "data" },
    ExpressionAttributeValues: { ":data": "EXPO_PUSH_RECEIPT" }
  });

  if (!Array.isArray(dbPushReceipts) || dbPushReceipts.length === 0) return;

  // Log info
  console.log(
    `Checking push notification receipts. Current count: ${dbPushReceipts.length}`,
    "PushNotificationService"
  );

  const dbPushReceiptsMap = Object.fromEntries(
    dbPushReceipts.map((dbPushReceipt) => [dbPushReceipt.pk, dbPushReceipt])
  );

  // Object for organizing push receipts by status (arrays contain DDB write-cmd args)
  let pushReceiptsByStatus: {
    ok: Array<{ pk: string; sk: string }>;
    DeviceNotRegistered: Array<string>;
    error: Array<ExpoPushTicket & { pushNotification: FixitPushNotification }>;
  } = { ok: [], DeviceNotRegistered: [], error: [] };

  // Expo says to only request receipts for max 300 at a time
  // If pushNotifications.length > 300, their chunking fn returns an array of subArrays w length <= 300

  const dbPushReceiptIDchunks = expoPushService.chunkPushNotificationReceiptIds(
    Object.keys(dbPushReceiptsMap)
  );

  for (const receiptIDchunk of dbPushReceiptIDchunks) {
    const pushReceipts = await expoPushService.getPushNotificationReceiptsAsync(receiptIDchunk);

    for (const pushReceiptID in pushReceipts) {
      const pushReceipt = pushReceipts[pushReceiptID];

      if (pushReceipt.status === "ok") {
        // Add to "ok" array to be written to DDB
        pushReceiptsByStatus.ok.push({
          pk: pushReceiptID,
          sk: dbPushReceiptsMap[pushReceiptID].sk
        });
      } else if (pushReceipt?.details?.error === "DeviceNotRegistered") {
        // Add the userID of the PN's intended recipient to "DeviceNotRegistered" array
        pushReceiptsByStatus.DeviceNotRegistered.push(
          dbPushReceiptsMap[pushReceiptID].pushNotification.data._recipientUser
        );
      } else {
        // If status != "ok" and details.error != "DeviceNotRegistered", add to "error" array
        pushReceiptsByStatus.error.push({
          pushNotification: dbPushReceiptsMap[pushReceiptID].pushNotification,
          id: pushReceiptID,
          ...pushReceipt // status, details, message
        });
      }
    }
  }

  // HANDLE SUCCESSFUL PUSH NOTIFICATION RECEIPT IDs
  if (pushReceiptsByStatus.ok.length > 0) {
    // For successfully delivered PNs, delete the associated push receipts from ddb.
    await ddbClient.batchDeleteItems(pushReceiptsByStatus.ok);
  }

  // HANDLE "DEVICE-NOT-REGISTERED" PUSH NOTIFICATION RECEIPTS
  if (pushReceiptsByStatus.DeviceNotRegistered.length > 0) {
    for (const userID of pushReceiptsByStatus.DeviceNotRegistered) {
      // Set user's expoPushToken to empty string
      await ddbClient.updateItem(
        { pk: userID, sk: `#DATA#${userID}` },
        {
          UpdateExpression: "SET expoPushToken = :expoPushToken",
          ExpressionAttributeValues: { ":expoPushToken": "" }
        }
      );
    }
  }

  // HANDLE ALL OTHER "ERROR" PUSH NOTIFICATION RECEIPTS
  if (pushReceiptsByStatus.error.length > 0) {
    throw new PushServiceError({
      // prettier-ignore
      message: `[fetchPushReceipts] ${pushReceiptsByStatus.error.length} ExpoPushReceipts with errors: ${JSON.stringify(pushReceiptsByStatus.error, null, 2)}`
    });
  }
};
