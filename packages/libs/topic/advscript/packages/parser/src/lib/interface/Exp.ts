import { defineActions, StatementData } from ".";
// import { defineActions } from "../interface";

export const Exp = defineActions({
  Scripts(n) {
    const ret: StatementData[] = [];
    for (const child of n.children) {
      ret.push(child.parse());
    }
    return ret;
  },
});
