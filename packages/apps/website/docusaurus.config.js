// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "My Site",
  tagline: "Dinosaurs are cool",
  url: "https://your-docusaurus-test-site.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "facebook", // Usually your GitHub org/user name.
  projectName: "docusaurus", // Usually your repo name.
  plugins: [
    "./plugins/rawLoader",
    ["docusaurus-plugin-less", { lessOptions: { javascriptEnabled: true } }],
    [
      "@docusaurus/plugin-pwa",
      {
        debug: true,
        offlineModeActivationStrategies: ["appInstalled", "standalone", "queryString"],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/icon.png"
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.json"
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "rgb(27, 27, 27)"
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-capable",
            content: "yes"
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-status-bar-style",
            content: "#000"
          },
          {
            tagName: "link",
            rel: "apple-touch-icon",
            href: "/img/icon.png"
          },
          {
            tagName: "link",
            rel: "mask-icon",
            href: "/img/icon.svg",
            color: "rgb(37, 194, 160)"
          },
          {
            tagName: "meta",
            name: "msapplication-TileImage",
            content: "/img/icon.png"
          },
          {
            tagName: "meta",
            name: "msapplication-TileColor",
            content: "#fbbf24"
          }
        ]
      }
    ],
    require("./plugins/search")
  ],
  i18n: {
    defaultLocale: "zh", // 默认语言
    locales: ["zh"] // 本地语言包
  },
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "docs",
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // editUrl:
          //   "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          async sidebarItemsGenerator({ defaultSidebarItemsGenerator, isCategoryIndex, ...args }) {
            const pre = {};
            const data = await defaultSidebarItemsGenerator({
              ...args,
              isCategoryIndex(param) {
                const result = isCategoryIndex(param);
                if (result) {
                  const data = args.docs.find(
                    (o) =>
                      o.source ===
                      "@site/docs/" +
                        [...param.directories].reverse().join("/") +
                        "/" +
                        param.fileName +
                        param.extension
                  );
                  pre[data.id] = {
                    ...param,
                    data
                  };
                }
                return result;
              }
            });
            /** @param {import('@docusaurus/plugin-content-docs/lib/sidebars/types').NormalizedSidebarItem} item  */
            function update(item) {
              if (item?.type === "category") {
                const sidebar_label = pre[item?.link?.id]?.data.frontMatter?.sidebar_label;
                // console.log(item, sidebar_label)
                // if (sidebar_label && item.items.length === 0) return false
                return {
                  ...item,
                  collapsible: true,
                  collapsed: true,
                  label: sidebar_label || item.label,
                  items: item.items.flatMap((item) => ((item = update(item)) ? [item] : []))
                };
              }
              return item;
            }
            // console.log(args, pre, data[data.length - 1])
            // return data
            return data.flatMap((item) => ((item = update(item)) ? [item] : []));
          },
          // admonitions: false,
          showLastUpdateTime: true,
          sidebarCollapsible: true,
          sidebarCollapsed: true
        },
        blog: {
          routeBasePath: "blog",
          showReadingTime: true,
          postsPerPage: 5,
          blogSidebarCount: 10,
          // blogTitle: "BLOG",
          // Please change this to your repo.
          // editUrl:
          // "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
          admonitions: {
            // tip: false
          },
          feedOptions: {
            copyright: `Copyright © ${new Date().getFullYear()} Yuyi919, Inc. Built with Docusaurus.`
          }
        },
        theme: {
          customCss: [
            require.resolve("./src/css/custom.css"),
            require.resolve("./src/css/custom.less")
          ]
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Baldr Space",
        logo: {
          alt: "My Site Logo",
          src: "img/logo.svg"
        },
        hideOnScroll: true,

        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Tutorial"
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/yuyi919",
            label: "GitHub",
            position: "right"
          }
          // {
          //   type: "localeDropdown",
          //   position: "right"
          // }
        ]
      },
      colorMode: {
        defaultMode: "dark",
        respectPrefersColorScheme: false,
        disableSwitch: true
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro"
              }
            ]
          },
          // {
          //   title: "Community",
          //   items: [
          //     {
          //       label: "Stack Overflow",
          //       href: "https://stackoverflow.com/questions/tagged/docusaurus"
          //     },
          //     {
          //       label: "Discord",
          //       href: "https://discordapp.com/invite/docusaurus"
          //     },
          //     {
          //       label: "Twitter",
          //       href: "https://twitter.com/docusaurus"
          //     }
          //   ]
          // },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog"
              },
              {
                label: "GitHub",
                href: "https://github.com/facebook/docusaurus"
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Yuyi919, Inc. Built with Docusaurus.`
      },
      docs: {},
      announcementBar: {
        content: "test",
        isCloseable: true
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
};

module.exports = config;
