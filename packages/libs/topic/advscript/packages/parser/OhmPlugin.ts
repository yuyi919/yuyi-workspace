import glob from "glob";
import { relative, resolve } from "path";
import { Plugin, ResolvedConfig } from "vite";
import MagicString from "magic-string";
const defaultVirtualFileId = "@addLibs/";
export const RawWorkspacePlugin = ({
  root = ".",
  dynamic = true,
  virtualFileId = defaultVirtualFileId,
}): Plugin => {
  let config: ResolvedConfig;
  return {
    name: "virtual-plain-text",
    resolveId(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        return {
          id,
        };
      }
    },
    configResolved(_config) {
      config = _config;
    },
    async load(id: string) {
      if (id.indexOf(virtualFileId) === 0) {
        const globPath = id.replace(virtualFileId, "");
        const files = glob.sync(resolve(root, globPath), { dot: true });
        // console.log(globPath, files);
        const groups: string[] = [];
        let i = 0;
        for (const filePath of files) {
          // const content = await promises.readFile(filePath, { encoding: "utf-8" });
          // console.log((await this.resolve(filePath)).id);
          if (dynamic) {
            groups.push(
              `workspace[${JSON.stringify(relative(root, filePath))}] = () => import("/${relative(
                config.root,
                filePath
              ).replace(/\\/g, "/")}?raw").then(m => m.default)`
            );
          } else {
            const aliasName = `module${i++}`;
            groups.push(
              `import { default as ${aliasName} } from "${filePath}?raw"; workspace[${JSON.stringify(
                relative(root, filePath)
              )}] = ${aliasName}`
            );
          }
        }
        const result = new MagicString(
          `export const workspace = {};\n${groups.join("\n")}\nexport default workspace;`
        );

        // const modulesDir = join(config.root, "/node_modules/");
        // const replaceFiles: string[] = files.map((f, i) => {
        //   groups.push(g1 + i);
        //   return `import ${g1 + i} from ${g2}${resolver.fileToRequest(f)}${g2}`;
        // });
        return {
          code: result.toString(),
          map: result.generateMap({
            includeContent: true,
            hires: true,
          }),
        };
      }
    },
  };
};
