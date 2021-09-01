import path from "path";
import url from "url";

/* ****************************************************************************************************************** *
 * General Utilities & Helpers
 * ****************************************************************************************************************** */

export const isURL = (s: string): boolean =>
  !!s && (!!url.parse(s).host || !!url.parse(s).hostname);
export const cast = <T>(v: any): T => v;
export const isBaseDir = (baseDir: string, testDir: string): boolean => {
  const relative = path.relative(baseDir, testDir);
  return relative ? !relative.startsWith("..") && !path.isAbsolute(relative) : true;
};
export const maybeAddRelativeLocalPrefix = (p: string) => (p.startsWith(".") ? p : `./${p}`);
