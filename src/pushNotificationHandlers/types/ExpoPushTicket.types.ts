/**
 * Yes, Expo provides a type of the same name, but the union of Success and
 * Error Ticket types does not lend itself to straightforward destructuring
 * of ticket properties. Trying to get "id" from ExpoPushTicket results in
 * a "property does not exist" TS error, even though we want to TEST if "id"
 * is undefined. This type combines the Success and Error Ticket types,
 * rather than having a union of the two.
 *
 * A generic PushTicket type would probably be even better, but this simple
 * interface is fine for the needs of our handler.
 */
export interface ExpoPushTicket {
  status: "ok" | "error";
  // "id" is only present if Ticket is ExpoPushSuccessTicket
  id?: string;
  // "message" and "details" are only present when Ticket is ExpoPushErrorTicket
  message?: string;
  details?: {
    error?: "DeviceNotRegistered" | "InvalidCredentials" | "MessageTooBig" | "MessageRateExceeded";
  };
}
