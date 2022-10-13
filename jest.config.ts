import { JestConfigWithTsJest } from "ts-jest";

// Jest config file docs: https://jestjs.io/docs/configuration

const jestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!function/**", // <-- TS build target dir
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__tests__/**"
  ],
  coverageDirectory: "coverage",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "cts", "cjs", "json"],
  preset: "ts-jest/presets/js-with-ts-esm",
  rootDir: "./",
  setupFiles: ["dotenv/config"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.[tj]s"],
  testTimeout: 15000, // 15s
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true
      }
    ]
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true
};

export default jestConfig;
