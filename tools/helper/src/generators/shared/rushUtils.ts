import { Tree, joinPathFragments } from "@nrwl/devkit";
import * as jsonc from "comment-json";
import {
  RushConfigurationProject,
  RushConfiguration,
  LockStepVersionPolicy,
  IndividualVersionPolicy,
} from "@microsoft/rush-lib";
// import { tryReadJson } from "../../schematics/internal-nx-plugins-lerna/addLibFiles";

export type RushJson = RushConfiguration["rushConfigurationJson"];
export function getRushPackageDefinition(
  host: Tree,
  packageName: string
): RushConfigurationProject | undefined {
  const rush = RushConfiguration.loadFromConfigurationFile(
    joinPathFragments(host.root, "../rush.json")
  );
  // console.log(...getVersionPolicyList(rush));
  return (rush && rush.projects.find((p) => p.packageName === packageName)) || void 0;
  // const rushJson = tryReadJson(host, "../rush.json") as RushJson
  // return rushJson ? rushJson.projects.find(p => p.packageName === packageName) : void 0
}

function getVersionPolicyList(rush: RushConfiguration) {
  return Array.from(rush.versionPolicyConfiguration.versionPolicies.values())
    .map((policy) => {
      if (policy instanceof LockStepVersionPolicy) {
        return {
          ...policy._json,
          isLockstepped: policy.isLockstepped,
        };
      } else if (policy instanceof IndividualVersionPolicy) {
        return {
          ...policy._json,
          isLockstepped: policy.isLockstepped,
        };
      }
    })
    .filter(Boolean);
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
