import { ParserContext } from "./lib/ParserContext";

declare module "ohm-js" {
  class Semantics {}

  class Node<T = any> {
    parse(): T;
    get parserContext(): ParserContext;
  }
  interface IterationNode<T = any> {
    parse(): T[];
  }
}
