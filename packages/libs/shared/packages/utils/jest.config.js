module.exports = {
  displayName: "shared-packages-utils",
  preset: "./node_modules/@yuyi919/workspace-base-rig/jest.preset.js",
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tsconfig.spec.json",
      module: "esnext",
    },
  },
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  coverageDirectory: "../../../../coverage/packages/shared/packages/utils",
};
