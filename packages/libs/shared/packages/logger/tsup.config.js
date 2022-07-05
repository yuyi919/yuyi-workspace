import { defineConfig } from "tsup";
import { tsupConfig } from "@yuyi919/workspace-base-rig";

export default defineConfig({
  ...tsupConfig,
  skipNodeModulesBundle: false,
  noExternal: [/.+/],
  // minify: true,
  target: "es2020",
  // minifyIdentifiers: true,
  // minifySyntax: true,
  // format: ["cjs", "esm", "iife"],
  esbuildOptions: (o) => {
    o.legalComments = "none";
    o.keepNames = false;
    o.mangleProps = /^_\w/;

    return o;
  },
  treeshake: {
    preset: "smallest",
    moduleSideEffects: false
  }
  // onSuccess:
  //   "esbuild --bundle ./dist/index.esm.js --outdir=dist --allow-overwrite --format=esm --minify"
});
