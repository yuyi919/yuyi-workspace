//@ts-nocheck
import { defineConfig } from "tsup";
import EsbuildPluginAlias from "esbuild-plugin-alias";
import fs from "fs-extra";
import path from "path";

export const tsupConfig: import("tsup").Options = defineConfig({
  entry: ["src/index.ts"],
  clean: ["dist"],
  sourcemap: true,
  skipNodeModulesBundle: true,
  outDir: "dist",
  format: ["cjs", "esm"],
  outExtension: (ctx) => ({ js: ctx.format === "cjs" ? ".js" : `.${ctx.format}.js` }),
  minify: false,
  minifyIdentifiers: false,
  minifySyntax: false,
  platform: "browser",
  // noExternal: ["lodash"],
  // treeshake: true,
  // onSuccess: "npm run bulid:api",
  // name: "logger",
  target: ["es2020"],
  plugins: [
    {
      name: "tsup-plugin-dts-source",
      buildEnd(ctx) {
        const { entry, outDir } = this.options;
        const root = process.cwd();
        console.log("root", root);
        for (let [_, entryPath] of Object.entries(entry)) {
          const entryImportPath = path.join(
            path.relative(entryPath, "src"),
            entryPath.replace(/\.tsx?$/, "")
          );
          // console.log(entryImportPath, outDir, entryPath)

          const posixEntryImportPath = entryImportPath.split(path.sep).join(path.posix.sep);

          const entryImpl = fs.readFileSync(entryPath, "utf8");
          const hasDefaultExport = /^(export default |export \{[^}]+? as default\s*[,}])/m.test(
            entryImpl
          );

          const dtsModule =
            `export * from "${posixEntryImportPath}";` +
            (hasDefaultExport ? `\nexport {default} from "${posixEntryImportPath}";` : ``);

          fs.writeFileSync(
            path.join(outDir, entryPath.replace("src/", "").replace(/\.ts$/, ".d.ts")),
            dtsModule
          );
        }
      }
    }
  ],
  esbuildPlugins: [
    EsbuildPluginAlias({
      lodash: require.resolve("lodash-es"),
      "@yuyi919/shared-types": require.resolve("@yuyi919/shared-types/src/index.ts", {
        paths: [process.cwd()]
      })
    })
  ]
});

export { defineConfig };
