const nxPreset = require("@nrwl/jest/preset");

module.exports = {
  ...nxPreset,
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest",
  },
  setupFilesAfterEnv: [
    ...(nxPreset.setupFilesAfterEnv || []),
    require.resolve("@yuyi919/jest-extra"),
  ],
};
