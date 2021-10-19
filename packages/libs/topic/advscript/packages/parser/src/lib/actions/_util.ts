import { Node } from "ohm-js";

const _util = {};
export function commandToString(textspec: Node[]): string {
  return textspec.map((o, i) => o.sourceString + (i > 0 ? " " : "")).join("");
}

export function toSourceString(...textspec: Node[]): string {
  return textspec.map((o) => o.sourceString).join("");
}
