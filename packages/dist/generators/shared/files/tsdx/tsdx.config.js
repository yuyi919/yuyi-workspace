const { extendTsdxConfig } = require("@yuyi919/build-tools");
module.exports = extendTsdxConfig({
  preset: "babel-ts",
  extractErrors: undefined,
  bundleDeps: ["babel-plugin-transform-async-to-promises/helpers", "tslib"],
});
