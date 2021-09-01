module.exports = {
  displayName: "shared-packages-static-value",
  preset: "./node_modules/@yuyi919/workspace-base-rig/jest.preset.js",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.spec.json",
    },
  },
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../../../coverage/packages/shared/packages/static-values",
};
