export type Invoice_PushNotificationEventNames =
  | "NewInvoice"
  | "InvoiceUpdated"
  | "InvoiceDeleted"
  | "InvoicePaid";

export type WorkOrder_PushNotificationEventNames =
  | "WorkOrderAssigned"
  | "WorkOrderUnassigned"
  | "WorkOrderUpdated"
  | "WorkOrderCancelled"
  | "WorkOrderCompleted";

export type PushNotificationEventNames = Expand<
  Invoice_PushNotificationEventNames | WorkOrder_PushNotificationEventNames
>;
