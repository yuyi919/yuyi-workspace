import { tsupConfig } from "@yuyi919/workspace-base-rig";
import { defineConfig } from "tsup";

export default defineConfig({
  ...tsupConfig,
  // minifyIdentifiers: true,
  minifySyntax: true,
  // minifyWhitespace: true,
  treeshake: true
});
