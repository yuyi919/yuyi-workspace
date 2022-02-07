/**
 * @file Convenient functional tools for creating Tries from arrays
 */
import { Trie } from "./Trie";
export { Trie } from "./Trie";

/**
 * Synchronously construct a new Trie out of the given strings.
 * @param words
 */
export function createSync(strings: string[]) {
  const trie = new Trie();

  strings.forEach((s) => trie.insert(s));

  return trie;
}

/**
 * Create a frozen Trie out of given words
 * @param words
 */
export function createFrozenSync(words: string[]) {
  return createSync(words).freeze();
}

export { PackedTrie } from "./PackedTrie";
