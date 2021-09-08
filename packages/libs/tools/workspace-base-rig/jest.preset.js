const nxPreset = require("@nrwl/jest/preset");

module.exports = {
  ...nxPreset,
  resolver: require.resolve("@nrwl/jest/plugins/resolver"),
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.{test,spec}.{ts,tsx}"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  setupFilesAfterEnv: [
    ...(nxPreset.setupFilesAfterEnv || []),
    require.resolve("@yuyi919/jest-extra"),
  ],
};
