import { Node as TerminalNode } from "ohm-js";
import { assignNode, InternalRange } from "../actions/_util";
import { ParserContext } from "../ParserContext";

export type Node<T> = TerminalNode<T>;

export type BaseData = {
  sourceString?: string;
  ctorName?: any;
};
export type BaseNodeData<Type extends NodeTypeKind = NodeTypeKind, Kind = any> = {
  type: Type;
  kind: Kind;
  sourceString?: string;
  ctorName?: any;
  kindName?: string;
  sourceNode?: SourceNode;
  _source?: Source;
};

export interface InternalNodeData extends BaseNodeData<NodeTypeKind, InternalNodeKind.Content> {
  value?: any;
  sourceType?: string;
}

export function isSourceNodeData(data: any): data is InternalNodeData {
  return data?.type === NodeTypeKind.Source;
}

export function getSourceCtor(data: InternalNodeData | Node<any>) {
  return data?.type === NodeTypeKind.Source ? data.sourceType : (data as Node<string>).ctorName;
}

export enum NodeTypeKind {
  Source = "Source",
  Comment = "Comment",
  Statment = "statment",
  Expression = "expression",
  Content = "Content",
  Logic = "logic",
}
export enum InternalNodeKind {
  Ignore,
  Content,
}
export type SourceFileNode = {
  sourceString?: string;
  startIdx: number;
  endIdx: number;
};

export interface SourceNode {
  sourceString: string;
  sourceFile: SourceFileNode;
  range: SourceRange;
  _internalRange: {
    start: InternalRange;
    end: InternalRange;
  };
  printError: void;
  ctorName: string;
  context: ParserContext
};

export interface SourceRange {
  line: number;
  col: number;
  lineEnd: number;
  colEnd: number;
}
export type Source = SourceNode;

export function createKindNodeFactory<
  Type extends NodeTypeKind,
  KindMap extends Record<string, any>
>(type: Type, kindMap: KindMap) {
  function createNode<T, Kind extends KindMap[keyof KindMap]>(
    kind: Kind,
    node: T,
    source?: Source
  ): BaseNodeData<Type, Kind> & T {
    const newNode = { ...node, type, kind } as BaseNodeData<Type, Kind> & T;
    assignSourceNode<Type, T, Kind>(newNode, source);
    Object.defineProperties(newNode, {
      kindName: {
        get(this: typeof newNode) {
          return kindMap[(this as BaseNodeData<Type, Kind>).kind];
        },
        enumerable: true,
      },
    });
    return newNode;
  }
  return createNode;
}

export function assignSourceNode<Type extends NodeTypeKind, T, Kind>(
  newNode: BaseNodeData<Type, Kind> & T,
  source?: Source
) {
  const proto = {
    _source: source,
    get sourceNode() {
      return typeof this._source === "object" ? this._source : void 0;
    },
  };
  Object.setPrototypeOf(newNode, proto);
  Object.defineProperties(newNode, {
    sourceString: {
      get(this: BaseNodeData<Type, Kind> & T) {
        return typeof this._source === "object"
          ? this._source.sourceString
          : (this._source as string);
      },
      enumerable: true,
      configurable: true,
    },
  });
  return newNode;
}

export function createNode<T>(node: T & BaseNodeData): T & BaseNodeData {
  return node;
}

export function createIgnoreNode(source?: Source) {
  return assignSourceNode(
    {
      type: NodeTypeKind.Source,
      kind: InternalNodeKind.Ignore,
    },
    source
  );
}
