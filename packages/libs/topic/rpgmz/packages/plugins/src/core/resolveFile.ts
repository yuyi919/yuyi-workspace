import { join } from "path";
export function resolvePath(...path: string[]) {
  return join(process.cwd(), ...path);
}
