import type { Handler } from "aws-lambda";
import {
  sendPushNotificationsToExpo,
  fetchPushReceipts,
  type FixitPushNotification
} from "./pushNotificationHandlers";

/**
 * LAMBDA: fixit-push-notification-service
 *
 * This Lambda function has two invocation sources:
 * 1. fixit-api           async invocation with payload.pushNotifications
 * 2. EventBridge rule    "run-fetchPushReceipts-every-30-minutes"
 *
 * Each push notification must have the following properties:
 *
 * | Property | Description                                                 |
 * | :------- | :---------------------------------------------------------- |
 * | to       | An Expo push notification token.                            |
 * | title    | The title of the push notification.                         |
 * | body     | The body of the push notification message.                  |
 * | Address  | The Address related to the Fixit event.                     |
 * | data     | An object with relevant properties (handled by client app). |
 *
 * Example:
 * ```javascript
 * {
 *  to: "FOO_CONTRACTORS_EXPO_PUSH_TOKEN",
 *  title: "New Work Order Assigned",
 *  body: "Alfred Le Customer-Person has assigned a work order to your company."
 *  Location: {
 *    country: "",
 *    state: "",
 *    "123 Abc Street, Columbus, OH 43210"
 *  },
 *  data: { workOrderID: "workorder_123fooID" }
 * }
 * ```
 */
export const handler: Handler = async (event: PushServiceEvent) => {
  // TODO After we get 'event' structure printed out, make a better type for it (aws-lambda not helpful here)
  console.log(`(handler) event = ${JSON.stringify(event, null, 2)}`);

  const { payload, resources } = event;

  if (Array.isArray(payload?.pushNotifications)) {
    await sendPushNotificationsToExpo(payload!.pushNotifications);
  } else if (resources?.[0]?.match(/fetchPushReceipts/i) ?? false) {
    // TODO make sure the event rule will always be 0-index
    await fetchPushReceipts();
  }
};

interface PushServiceEvent {
  payload?: {
    pushNotifications?: Array<FixitPushNotification>;
  };
  resources?: Array<string>;
}
