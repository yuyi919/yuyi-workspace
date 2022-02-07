import { SuffixAutomatonRunner } from "./auto";
import { SuffixAutomatonReader } from "./Reader";
import { SuffixAutomaton } from "./SuffixAutomaton";

export * from "./trie";
export * from "./acSearch";
export * as pipe from "./pipeable";

const runner = new SuffixAutomatonRunner();
// runner.main();
Object.assign(globalThis, {
  SuffixAutomaton,
  SuffixAutomatonRunner: runner,
  SuffixAutomatonReader,
});
