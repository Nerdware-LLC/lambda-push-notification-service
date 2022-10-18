import { ddbClient } from "../ddbClient";
import { FixitPushReceipt } from "../pushNotificationHandlers/FixitPushReceipt";

const MOCK_INPUTS = {
  PushReceipt_A: {
    pushReceiptID: "PushReceipt_A_FOO_ID",
    pushNotification: {
      to: "ExponentPushToken[AAAAAAAAAAAAAAAAAAAAAA]",
      title: "A Foo PN Title",
      body: "This is the body of test PN A.",
      data: {
        _apiEnv: "staging",
        _pushEventName: "NewInvoice",
        _recipientUser: "USER#1a1a1a1a-1111-1a1a-1a1a-1a1a1a1a1a1a",
        invoiceID: "INV#USER#2b2b2b2b-2222-2b2b-2b2b-2b2b2b2b2b2b#1654180730"
      }
    }
  },
  PushReceipt_B: {
    pushReceiptID: "PushReceipt_B_FOO_ID",
    pushNotification: {
      to: "ExponentPushToken[BBBBBBBBBBBBBBBBBBBBBB]",
      title: "Bar PN Title",
      body: "This is the body of test PN B.",
      data: {
        _apiEnv: "production",
        _pushEventName: "WorkOrderUpdated",
        _recipientUser: "USER#2b2b2b2b-2222-2b2b-2b2b-2b2b2b2b2b2b",
        workOrderID: "WO#USER#1a1a1a1a-1111-1a1a-1a1a-1a1a1a1a1a1a#1654094330"
      }
    }
  }
} as const;

// This array of string literals from MOCK_INPUTS keys provides better TS inference in the tests below.
const MOCK_INPUT_KEYS = Object.keys(MOCK_INPUTS) as Array<keyof typeof MOCK_INPUTS>;

describe("Push receipt R/W database operations", () => {
  let createdPushReceipts = {} as {
    -readonly [K in keyof typeof MOCK_INPUTS]: Expand<FixitPushReceipt>;
  };

  beforeAll(async () => {
    // Write mock PushReceipts to Table
    await ddbClient.batchUpsertItems(
      Object.values(MOCK_INPUTS).map(
        (mockPushReceiptInput) => new FixitPushReceipt(mockPushReceiptInput)
      )
    );

    // Update "createdPushReceipts"
    for (const key of MOCK_INPUT_KEYS) {
      const [pushReceipt] = (await ddbClient.query({
        KeyConditionExpression: "pk = :pushReceiptID",
        ExpressionAttributeValues: { ":pushReceiptID": MOCK_INPUTS[key].pushReceiptID },
        Limit: 1
      })) as Array<FixitPushReceipt>;

      // If the write-op failed, bail out early
      if (!pushReceipt) throw new Error(`Failed to find test PushReceipt for ${key}`);

      createdPushReceipts[key] = pushReceipt;
    }
  });

  test("Created PushReceipts contain expected keys and values", () => {
    Object.entries(createdPushReceipts).forEach(([mockInputsKey, createdPushReceipt]) => {
      const mockInputs = MOCK_INPUTS[mockInputsKey as keyof typeof MOCK_INPUTS];

      expect(createdPushReceipt.pk).toEqual(mockInputs.pushReceiptID);
      expect(createdPushReceipt.sk).toMatch(PUSH_RECEIPT_ID_REGEX);
      expect(createdPushReceipt.data).toEqual(FixitPushReceipt.data);
      expect(createdPushReceipt.pushNotification).toMatchObject(mockInputs.pushNotification);
    });
  });

  test("ddbClient.updateItem returns expected keys and values", async () => {
    for (const key of MOCK_INPUT_KEYS) {
      const updatedAttrs = await ddbClient.updateItem(
        { pk: MOCK_INPUTS[key].pushReceiptID, sk: createdPushReceipts[key].sk },
        { pushNotification: { body: "NEW_BODY" } }
      );

      expect(updatedAttrs).toMatchObject({ pushNotification: { body: "NEW_BODY" } });
    }
  });

  test("ddbClient.batchDeleteItems removes all created PushReceipts", async () => {
    await ddbClient.batchDeleteItems(
      Object.values(createdPushReceipts).map(({ pk, sk }) => ({ pk, sk }))
    );

    const remainingPushReceipts = (await ddbClient.query({
      IndexName: "Overloaded_Data_GSI",
      KeyConditionExpression: "#d = :data",
      ExpressionAttributeNames: { "#d": "data" },
      ExpressionAttributeValues: { ":data": "EXPO_PUSH_RECEIPT" }
    })) as Array<FixitPushReceipt>;

    expect(remainingPushReceipts.length).toEqual(0);
  });
});

// prettier-ignore
const PUSH_RECEIPT_ID_REGEX = /^PUSH_RECEIPT#USER#[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}#\d{10}$/;
