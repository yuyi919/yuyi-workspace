import { defineConfig, UserConfigFn } from "vite";
import path from "path";
import solidPlugin from "vite-plugin-solid";
import dts from "vite-plugin-dts";

// export default defineConfig({
//   plugins: [
//     solidPlugin({}),
//     // dts({ copyDtsFiles: true, insertTypesEntry: true }),
//     // dts2()
//   ],
//   build: {
//     target: "es2017",
//     manifest: true,
//     ssrManifest: true,
//     polyfillDynamicImport: false,
//     // sourcemap: true,
//     minify: false,
//     // ssr: "./src/index.tsx",
//     // lib: {
//     //   entry: path.resolve(__dirname, "src/index.tsx"),
//     //   fileName: "index",
//     //   formats: ["cjs", "es"]
//     // },
//     // rollupOptions: {
//     //   external: ["solid-js", "solid-js/web"],
//     // },
//   },
//   esbuild: {},
// });
export default (async ({ mode }) => {
  // const config = new Configuration({ pathRoot: __dirname })
  // const { paths } = config

  // const [SSLCert, SSLCertKey] = await Promise.all([
  //   readFile(paths.file.rootInternalsCertificatesCert),
  //   readFile(paths.file.rootInternalsCertificatesKey),
  // ])

  return {
    plugins: [
      // pluginWindiCSS(),
      solidPlugin({ dev: mode !== "production", ssr: true }),
      // pluginTSConfigPaths(),
      // pluginCompression({
      //   algorithm: 'brotliCompress',
      // }),
      // pluginFonts({
      //   google: {
      //     families: [
      //       {
      //         name: 'Merriweather',
      //       },
      //     ],
      //   },
      // }),
    ],
    publicDir: "./src/assets",
    build: {
      // assetsInlineLimit: 0,
      // cssCodeSplit: false,
      target: "esnext",
      polyfillDynamicImport: false,
      // target: "es2017",
      manifest: true,
      ssrManifest: true,

      // polyfillDynamicImport: false,
      minify: false,
      sourcemap: true,
      // lib: {
      //   entry: path.resolve(__dirname, "src/index.tsx"),
      //   fileName: "index",
      //   formats: ["cjs", "es"],
      // },
      // rollupOptions: {
      //   // external: ["solid-js", "solid-js/web"],
      // },
    },
    optimizeDeps: {
      // exclude: ["solid-styled-components"],
    },
    define: {
      "typeof window": JSON.stringify(process.env.IS_CLIENT !== "true" ? "undefined" : "object"),
    },
    server: {
      // host: Configuration.defaults.development.host,
      port: 3000, // Configuration.defaults.development.port,
      strictPort: true,

      // https: {
      //   cert: SSLCert,
      //   key: SSLCertKey,
      // },

      // open: true,
      force: true,
    },
  };
}) as UserConfigFn;
