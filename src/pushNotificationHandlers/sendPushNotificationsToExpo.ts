import { expoPushService } from "./expoPushService";
import { FixitPushReceipt } from "./FixitPushReceipt";
import { PushServiceError } from "./PushServiceError";
import type { FixitPushNotification, ExpoPushTicket } from "./types";
import { ddbClient } from "../ddbClient";

export const sendPushNotificationsToExpo = async (
  pushNotifications: Array<FixitPushNotification>
) => {
  if (!Array.isArray(pushNotifications)) pushNotifications = [pushNotifications];

  if (!(pushNotifications.length > 0)) return;

  // Object for organizing push tickets by status (arrays contain DDB write-cmd args)
  let pushTicketsByStatus: {
    ok: Array<FixitPushReceipt>; //        <-- array of BatchPutItems cmd args
    DeviceNotRegistered: Array<string>; // <-- array of user IDs for UpdateItem cmds
    error: Array<
      ExpoPushTicket & { pushReceiptID: string; pushNotification: FixitPushNotification }
    >;
  } = { ok: [], DeviceNotRegistered: [], error: [] };

  try {
    // Can only send max 100 at a time to Expo
    // If pushNotifications.length > 100, use chunking fn, returns an array of subArrays w length <= 100
    const chunksOf100 = expoPushService.chunkPushNotifications(pushNotifications);

    const pushTickets: Array<ExpoPushTicket> = [];

    for (const chunk of chunksOf100) {
      const chunkPushTickets = await expoPushService
        .sendPushNotificationsAsync(chunk)
        .catch((err) => {
          console.error(`Failed to obtain PUSH TICKETS from EXPO PUSH SERVICE. ERROR: ${err}`);
          throw err;
        });
      pushTickets.concat(chunkPushTickets);
    }

    // FROM DOCS: The ID of each receipt is sent back in the response "ticket" for
    // each notification. In summary, sending a notification produces a ticket,
    // which contains a receipt ID you later use to get the receipt.

    pushTicketsByStatus = pushTickets.reduce(
      (accum, pushTicket, i) => {
        const { status, id: pushReceiptID, message, details } = pushTicket;

        // If we get a receipt, associate the ticket's receipt id with the original
        // push notification (which includes the user's pushToken) in case Apple/Google
        // tells us to delete the pushToken later.

        if (status === "ok" && !!pushReceiptID) {
          // Add to "ok" array to be written to DDB
          accum.ok.push(
            new FixitPushReceipt({
              pushReceiptID,
              pushNotification: pushNotifications[i]
            })
          );
        } else if (details?.error === "DeviceNotRegistered") {
          // Add the userID of the PN's intended recipient to "DeviceNotRegistered" array
          accum.DeviceNotRegistered.push(pushNotifications[i].data._recipientUser);
        } else {
          // If status != "ok" and details.error != "DeviceNotRegistered", add to "error" array
          accum.error.push({
            pushNotification: pushNotifications[i],
            pushReceiptID: pushReceiptID ?? "NONE",
            status,
            details,
            message
          });
        }

        return accum;
      },
      { ...pushTicketsByStatus }
    );

    // FROM DOCS: Later, after the Expo push notification service has delivered the notifications
    // to Apple or Google (usually quickly, but allow the the service up to 30 minutes
    // when under load), a "receipt" for each notification is created. The receipts
    // will be available for at least a day; stale receipts are deleted.
    //
    // The receipts may contain error codes to which you must respond. In
    // particular, Apple or Google may block apps that continue to send
    // notifications to devices that have blocked notifications or have uninstalled
    // your app. Expo does not control this policy and sends back the feedback from
    // Apple and Google so you can handle it appropriately.
  } catch (error) {
    console.error(error);
  }

  // HANDLE SUCCESSFUL PUSH NOTIFICATION RECEIPT IDs
  if (pushTicketsByStatus.ok.length > 0) {
    await ddbClient.batchUpsertItems(pushTicketsByStatus.ok).catch((error) => {
      console.error(error);
    });
  }

  // HANDLE "DEVICE-NOT-REGISTERED" PUSH NOTIFICATION RECEIPTS
  if (pushTicketsByStatus.DeviceNotRegistered.length > 0) {
    for (const userID of pushTicketsByStatus.DeviceNotRegistered) {
      // Set user's expoPushToken to empty string
      await ddbClient
        .updateItem(
          { pk: userID, sk: `#DATA#${userID}` },
          {
            UpdateExpression: "SET expoPushToken = :expoPushToken",
            ExpressionAttributeValues: { ":expoPushToken": "" }
          }
        )
        .catch((error) => {
          console.error(error);
        });
    }
  }

  // HANDLE ALL OTHER "ERROR" PUSH NOTIFICATION RECEIPTS
  if (pushTicketsByStatus.error.length > 0) {
    throw new PushServiceError({
      // prettier-ignore
      message: `[sendPushNotificationsToExpo] ${pushTicketsByStatus.error.length} ExpoPushTickets with errors: ${JSON.stringify(pushTicketsByStatus.error, null, 2)}`
    });
  }
};
