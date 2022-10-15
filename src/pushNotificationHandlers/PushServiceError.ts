/**
 * **Expo PushNotificationService Error Codes**
 *
 * - **MessageTooBig** — Indicates a push notification exceeded Expo's size limits.
 *    This should not happen, so if this is encountered, throw Error to trigger SIG
 *    proc interupt and shutdown.
 *
 * - **MessageRateExceeded** — Indicates messages are being sent too frequently to
 *    the given device. Expo recommends slowly retrying to re-send the messages with
 *    exponential backoff.
 *
 * - **InvalidCredentials** — Indicates the PushService's credentials are invalid.
 *    From Expo's documentation:
 *      > Your push notification credentials for your standalone app are
 *      invalid (ex: you may have revoked them). Run `expo build:ios -c`
 *      to regenerate new push notification credentials for iOS. If you
 *      revoke an APN key, all apps that rely on that key will no longer
 *      be able to send or receive push notifications until you upload a
 *      new key to replace it. Uploading a new APN key will not change
 *      your users' Expo Push Tokens.
 */
export class PushServiceError extends Error {
  constructor({
    expoErrorCode,
    message = "An unknown error occurred"
  }: {
    // "expoErrorCode" excludes "DeviceNotRegistered" bc it's handled separately
    expoErrorCode?: "MessageTooBig" | "MessageRateExceeded" | "InvalidCredentials";
    message: string;
  }) {
    super(`[PushServiceError]${!!expoErrorCode && `[ExpoErrorCode: ${expoErrorCode}]`} ${message}`);
    this.name = "PushServiceError";

    // Log the err msg
    console.error(this.message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, PushServiceError.prototype);

    if (/^prod/i.test(process.env.NODE_ENV)) Error.captureStackTrace(this, PushServiceError);
  }
}
