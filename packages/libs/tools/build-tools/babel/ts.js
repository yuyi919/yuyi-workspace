/**
 *
 * @param {import("@babel/core").ConfigAPI} api
 * @param {*} param1
 */
module.exports = function (api, { jsx }) {
  api.assertVersion(7);
  const plugins = [];
  switch (jsx) {
    case "inferno":
      plugins.push("babel-plugin-inferno");
      break;
    case "vue-next":
      plugins.push("@vue/babel-plugin-jsx");
      break;
  }
  return {
    presets: [
      [
        require.resolve("@babel/preset-typescript"),
        {
          allowNamespaces: true,
        },
      ],
    ],
    plugins: [
      [
        require.resolve("babel-plugin-const-enum"),
        {
          transform: "constObject",
        },
      ],
      ...plugins,
    ],
  };
};
