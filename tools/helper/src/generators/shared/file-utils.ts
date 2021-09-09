import { JsonParseOptions, JsonSerializeOptions, readJson, Tree, writeJson } from "@nrwl/devkit";

/**
 * Updates a JSON value to the file system tree
 *
 * @param host File system tree
 * @param path Path of JSON file in the Tree
 * @param updater Function that maps the current value of a JSON document to a new value to be written to the document
 * @param options Optional JSON Parse and Serialize Options
 */
export function tryUpdateJson<T extends object = any, U extends T = T>(
  host: Tree,
  path: string,
  updater: (value: T) => U,
  options?: JsonParseOptions & JsonSerializeOptions
) {
  const read = tryReadJson<T>(host, path, options);
  if (read) {
    const updatedValue = updater(read);
    writeJson(host, path, updatedValue, options);
  }
}

export function tryRead(host: Tree, path: string) {
  return host.exists(path) && host.read(path).toString();
}

export function tryDelete(host: Tree, path: string) {
  host.exists(path) && host.delete(path)
}

export function tryReadJson<T extends object>(
  host: Tree,
  path: string,
  options?: JsonParseOptions & JsonSerializeOptions
) {
  return host.exists(path) && readJson<T>(host, path, options);
}
