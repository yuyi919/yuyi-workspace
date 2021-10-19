import { defineActions } from "../interface";

export const Base = defineActions({
  NonemptyListOf(a, b, c) {
    // console.log(c.sourceString, c.parse());
    return [a.parse(), ...c.parse()];
  },
  nonemptyListOf(a, b, c) {
    // console.log(c.sourceString, c.parse());
    return [a.parse(), ...c.parse()];
  },
  EmptyListOf() {
    return [];
  },
  emptyListOf() {
    return [];
  },
  _iter(...children) {
    const ret = [];
    let hasObject = false;
    for (const child of children as any) {
      const value = child.parse();
      hasObject = hasObject || typeof value === "object";
      ret.push(value);
    }
    return hasObject ? ret : ret.join("");
  },
  _terminal() {
    return this.sourceString;
  },
});
