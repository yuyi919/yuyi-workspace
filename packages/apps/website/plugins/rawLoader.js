module.exports = function RawLoaderPlugin(context, options) {
  /**
   * @type {import("@docusaurus/module-type-aliases")}
   */
  return {
    name: "docusaurus-raw-loader-plugin",
    // async contentLoaded({content, actions}) {
    //   const {setGlobalData, addRoute} = actions;
    //   // Create friends global data
    //   setGlobalData({friends: ['Yangshun', 'Sebastien']});

    //   // Add the '/friends' routes
    //   addRoute({
    //     path: '/friends',
    //     component: '@site/src/components/Friends.js',
    //     exact: true,
    //   });
    // },
    configureWebpack(config, isServer, utils) {
      const { getJSLoader } = utils;
      return {
        module: {
          rules: [
            // {
            //   test: /\.foo$/,
            //   use: [getJSLoader(isServer), 'my-custom-webpack-loader'],
            // },
            {
              resourceQuery: /raw/,
              type: "asset/source"
            },
            {
              resourceQuery: /url/,
              type: "asset/inline"
            }
          ]
        }
      };
    }
  };
};
