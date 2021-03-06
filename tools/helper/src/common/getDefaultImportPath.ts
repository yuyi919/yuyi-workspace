import { CommonSchema } from "./schema";
export function isTypedModel(path?: string) {
  return !!path;
}

export function autoImportPath(scopedName: string, options: CommonSchema) {
  return `@${scopedName.toLowerCase()}/${convertDirectoryToHostName(
    options.directory.replace(/\/(packages)/g, "").replace(/^(topic|web|other)\//, "") +
      "/" +
      options.name.toLowerCase()
  )}`;
}
function convertDirectoryToHostName(path?: string) {
  return path ? path.split(/\/+/g).filter(isTypedModel).join("-").toLowerCase() : "";
}
