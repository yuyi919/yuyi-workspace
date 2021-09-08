import { Tree } from "@nrwl/devkit";
import * as jsonc from "comment-json";
import { tryReadJson } from "../../schematics/internal-nx-plugins-lerna/addLibFiles";

type RushProjectDefinition = {
  packageName: string;
  projectFolder: string;
  cyclicDependencyProjects?: string[];
  reviewCategory?: string;
  shouldPublish?: boolean;
  versionPolicyName?: string;
};

export type RushJson = {
  $schema: string;
  rushVersion: string;
  pnpmVersion: string;
  pnpmOptions: {
    pnpmStore?: "global" | "local";
    strictPeerDependencies?: boolean;
    useWorkspaces?: boolean;
  };
  nodeSupportedVersionRange: string;
  projectFolderMaxDepth?: number;
  approvedPackagesPolicy: {
    reviewCategories: ("default" | "production" | "tools" | "prototypes" | (string & {}))[];
    ignoredNpmScopes: ("@types" | "@babel" | "@vitejs" | (string & {}))[];
  };
  gitPolicy: Record<string, any>;
  repository: Record<string, any>;
  /**
   * Event hooks are customized script actions that Rush executes when specific events occur
   */
  eventHooks: {
    /**
     * The list of shell commands to run before the Rush installation starts
     */
    preRushInstall: string[];
    /**
     * The list of shell commands to run after the Rush installation finishes
     */
    postRushInstall: string[];
    /**
     * The list of shell commands to run before the Rush build command starts
     */
    preRushBuild: string[];
    /**
     * The list of shell commands to run after the Rush build command finishes
     */
    postRushBuild: string[];
  };
  variants: {
    /**
     * The folder name for this variant.
     */
    variantName: string;

    /**
     * An informative description
     */
    description?: string;
  }[];
  projects: RushProjectDefinition[];
};

export function getRushPackageDefinition(host: Tree, packageName: string): RushProjectDefinition | undefined {
  const rushJson = tryReadJson(host, "../rush.json") as RushJson
  return rushJson ? rushJson.projects.find(p => p.packageName === packageName) : void 0
}
export function updateRushJson(host: Tree, updater: (json: RushJson) => RushJson | void) {
  try {
    let rushJson: RushJson = jsonc.parse(host.read("../rush.json").toString());
    rushJson = updater(rushJson) || rushJson;
    const beforeAll = new String();
    const token = Symbol.for("before-all");
    beforeAll[token] = rushJson[token];
    rushJson[token] = void 0;
    const out =
      jsonc.stringify(beforeAll, null, 2).replace(/""$/, "") +
      "\n" +
      jsonc.stringify(rushJson, null, 2);
    // console.log(jsonc.stringify(rushJson.projects));
    // console.log("before-all", out);
    host.write("../rush.json", out);
  } catch (error) {
    if (error instanceof Error) console.error(error);
    else console.log(error);
  }
}
