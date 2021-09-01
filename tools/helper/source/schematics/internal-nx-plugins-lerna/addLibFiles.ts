import { Rule } from "@angular-devkit/schematics";
import { generateFiles, Tree } from "@nrwl/devkit";
import { resolveFile, addFiles, getOptions, MetaProject, resolveAbs } from "../../common/addFiles";

export function addTsdxFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsdx_files", __dirname), normalizedOptions);
}
export function addTscFiles(normalizedOptions: MetaProject): Rule {
  return addFiles(resolveFile("./tsc_files", __dirname), normalizedOptions);
}

export function generateTscFiles(host: Tree, options: MetaProject): void {
  generateFiles(host, resolveAbs("./tsc_files", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
    references: options.references || []
  });
}

export function generateTsdxFiles(host: Tree, options: MetaProject): void {
  generateFiles(host, resolveAbs("./tsdx_files", __dirname), options.projectRoot, {
    tmpl: "",
    template: "",
    ...options,
    ...getOptions(options),
    references: options.references || []
  });
}
