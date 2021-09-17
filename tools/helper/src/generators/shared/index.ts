import { definePackageJsonBuilder } from "./formatPackageJson"
export * from "./builder"
export * from "./format-files"
export * from "./formatPackageJson"
export * from "./getSortedProjects"
export * from "./rushUtils"
export * from "./updateProject"
export * from "./graph"
export * from "./file-utils"
export * from "./deps"
export * from "./files"
export * from "../../common/schema"

export const PackageConfigures = definePackageJsonBuilder({
  tsc: {
    scripts: {
      build: "tsc --build --force",
      "build:dev": "tsc --build",
      "build:watch": "tsc --build --watch",
      dev: "tsc --build --watch",
    },
    deps: ["@types/jest", "!@types/heft-jest"],
  },
  "heft-tsc": {
    scripts: {
      build: "heft build --clean",
      "build:dev": "heft build",
      "build:watch": "heft build --watch",
      dev: "heft build --watch",
      test: "heft test",
      "test:watch": "heft test --watch",
    },
    deps: ["@types/heft-jest", "!@types/jest"],
  },
  "tsdx": {
    entry: {
      module: `dist/\${packageJson.name.split("/").pop()}.esm.js`,
    },
    scripts: {
      build: `tsdx build && tsc run types`,
      "build:dev": `tsdx build && tsc run types`,
      "build:watch": `tsdx build && tsc run types`,
      dev: `tsdx watch --transpileOnly --onSuccess "tsc run types"`,
      types: "tsc --build --force",
    },
    deps: ["@types/jest", "tsdx"],
  },
});
