import type { PushNotificationEventNames } from "./PushNotificationEventNames.types";

export interface FixitPushNotification {
  to: string;
  title: string;
  body: string;
  data: {
    _apiEnv: typeof process.env.NODE_ENV;
    _pushEventName: PushNotificationEventNames;
    _recipientUser: string;
    // Keys sub-classes may attach to payload data:
    workOrderID?: string;
    invoiceID?: string;
    location?: Location;
  };
}

export interface Location {
  country?: string; // optional, defaults to "USA"
  region: string;
  city: string;
  streetLine1: string;
  streetLine2?: string; // optional, undefined by default
}
