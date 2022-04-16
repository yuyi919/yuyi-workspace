const lunr = require("lunr") as ((
  config: import("lunr").ConfigFunction
) => import("lunr").Index) & {
  Index: { load: (index: object) => import("lunr").Index };
} & {
  Query: {
    wildcard: {
      TRAILING: import("lunr").Query.wildcard.TRAILING;
    };
    presence: {
      PROHIBITED: import("lunr").Query.presence.PROHIBITED;
    };
  };
};

import * as data from "./generated";

export const tokenize: (input: string) => string[] = data.tokenize;
export const mylunr: typeof lunr = data.mylunr;
