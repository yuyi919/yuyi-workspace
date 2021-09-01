import { chain, move } from "@angular-devkit/schematics";
import * as path from "path";

export function moveInTree(movePaths: Record<string, string>, rootPath = "") {
  return chain(
    Object.entries(movePaths).map(([source, target]) => {
      return move(path.join(rootPath, source), path.join(rootPath, target));
    })
  );
}
