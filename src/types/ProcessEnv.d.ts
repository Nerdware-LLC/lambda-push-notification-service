export {};

declare global {
  namespace NodeJS {
    /**
     * process.env fields
     */
    interface ProcessEnv {
      NODE_ENV: "development" | "test" | "ci" | "staging" | "production";
      AWS_REGION: string;
      DYNAMODB_TABLE_NAME: string;
      DYNAMODB_LOCAL_ENDPOINT_URL?: string;
      EXPO_PUSH_ACCESS_TOKEN: string;
      SENTRY_DSN: string;
    }
  }
}
