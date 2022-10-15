import type { FixitPushNotification } from "./FixitPushNotification.types";

export interface PushServiceEvent {
  payload?: {
    pushNotifications?: Array<FixitPushNotification>;
  };
  resources?: Array<string>;
}
