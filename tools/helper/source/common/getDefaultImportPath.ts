import { CommonSchema } from "./schema";
import { isTypedModel } from "./NormalizedSchema";

export function autoImportPath(scopedName: string, options: CommonSchema) {
  return `@${convertDirectoryToHostName(scopedName)}/${convertDirectoryToHostName(
    options.directory,
    options.name.toLowerCase()
  )}`;
}
function convertDirectoryToHostName(scope: string, path?: string) {
  return path
    ? [scope].concat(path.split(/\/+/g)).filter(isTypedModel).join("-").toLowerCase()
    : scope.toLowerCase();
}
