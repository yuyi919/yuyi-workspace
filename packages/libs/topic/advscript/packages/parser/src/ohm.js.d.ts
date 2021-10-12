import { ParsedData } from "./interface";

declare module "ohm-js" {
  class Semantics {
    get sourceString(): string;
    get sourceValue(): string;
  }

  interface Node<T = any> {
    parse(): T
  }
}
