import * as path from "path";
import type { PackageJSON } from "./common/packageJsonUtils";
export const root = path.join(__dirname, "..");
export const packageJson = require("../package.json") as PackageJSON;
