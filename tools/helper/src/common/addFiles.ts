import {
  apply,
  template,
  mergeWith,
  MergeStrategy,
  noop,
  move,
  Rule,
  url,
} from "@angular-devkit/schematics";
import { names, offsetFromRoot } from "@nrwl/workspace";
import * as Path from "path";

export type MetaProject = {
  name: string;
  projectRoot: string;
  references?: string[];
};

/**
 *
 * @param path
 * @param options
 * @examples
 * ```ts
 * import { url } from "@angular-devkit/schematics";
 * addFiles(url("./files", options))
 * ```
 */
export function addFiles<T extends MetaProject>(path: string, options: T): Rule {
  return mergeWith(
    apply(url(path), [
      template({
        references: [],
        ...options,
        ...getOptions(options),
        template: "",
      }),
      move(options.projectRoot),
      noop(),
    ]),
    MergeStrategy.Overwrite
  );
}

export function getOptions(options: MetaProject) {
  return {
    ...names(options.name),
    tmpl: "",
    offsetFromRoot: offsetFromRoot(options.projectRoot),
  };
}

export function resolveFile(files: string, dirname: string) {
  const resovePath = Path.join(Path.relative(dirname, dirname.replace(/dist/, "src")), files);
  console.log(Path.join(dirname, resovePath));
  return resovePath;
}

export function resolveAbs(files: string, dirname = __dirname) {
  const resovePath = Path.join(dirname.replace(/dist/, "src"), files);
  return resovePath;
}
