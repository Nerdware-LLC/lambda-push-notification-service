import type { Handler } from "aws-lambda";
import {
  sendPushNotificationsToExpo,
  fetchPushReceipts,
  type FixitPushNotification
} from "./pushNotificationHandlers";

/**
 * Fixit Push Notification Service
 *
 * This Lambda function has two invocation sources:
 * 1. fixit-api           async invocation with payload.pushNotifications
 * 2. EventBridge rule    "run-fetchPushReceipts-every-30-minutes"
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
