import { defineConfig } from "vite";
import minifyHTML from "rollup-plugin-minify-html-literals";

export default defineConfig({
  build: {
    lib: {
      entry: "src/psdtool.ts",
      name: "PsdToolDriver",
      formats: ["umd"]
    },
    rollupOptions: {
      plugins: [minifyHTML()]
    },
    terserOptions: {
      format: {
        comments: false
      }
    },
    target: "es6",
    minify: "terser"
  }
});
