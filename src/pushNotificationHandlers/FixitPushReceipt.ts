import type { FixitPushNotification, ExpoPushTicket } from "./types";

export class FixitPushReceipt {
  static readonly data = "EXPO_PUSH_RECEIPT" as const;

  readonly pk: string;
  readonly sk: string;
  readonly data = FixitPushReceipt.data;
  readonly pushNotification: FixitPushNotification;
  readonly message?: ExpoPushTicket["message"];
  readonly details?: ExpoPushTicket["details"];

  constructor({
    pushReceiptID,
    pushNotification,
    message,
    details
  }: {
    pushReceiptID: string;
    pushNotification: FixitPushNotification;
    message?: ExpoPushTicket["message"];
    details?: ExpoPushTicket["details"];
  }) {
    const {
      data: { _recipientUser: recipientUserID }
    } = pushNotification;

    this.pk = pushReceiptID;
    this.sk = `PUSH_RECEIPT#${recipientUserID}#${Math.floor(Date.now() / 1000)}`;
    this.data = FixitPushReceipt.data;
    this.pushNotification = pushNotification;
    this.message = message;
    this.details = details;
  }
}
