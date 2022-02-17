import ts from "typescript";
import { DynamicString } from "@yuyi919/shared-types";

export type TypeName<K extends string = DynamicString> =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "undefined"
  | "void"
  | "null"
  | "any"
  | "unknown"
  /**
   * 字面量，字符串/数字/布尔值等等
   */
  | "literal"
  | K;

export type TypeText<K extends string = DynamicString> =
  | "string"
  | "number"
  | "boolean"
  | "undefined"
  | "void"
  | "null"
  | "any"
  | "unknown"
  | "Array"
  | K;

export type TypeDefine<Key extends DynamicString = DynamicString> = {
  name: TypeName<Key>;
  text: TypeText<Key>;
  defineText: string;
  type: "string" | "number" | "boolean" | "keyword" | "reference";
  node?: ts.TypeNode;
  element?: TypeDefine<Key>[];
};

export const Types = {
  string: createNodeTypeDefine("string"),
  number: createNodeTypeDefine("number"),
  boolean: createNodeTypeDefine("boolean"),
  undefined: createNodeTypeDefine("undefined"),
  null: createNodeTypeDefine("null"),
  any: createNodeTypeDefine("any"),
  True: createNodeTypeDefine("literal", "true", "boolean"),
  False: createNodeTypeDefine("literal", "false", "boolean"),
};

export function getNodeTypeWithKind<T extends TypeName = TypeName>(
  node: ts.TypeNode | ts.LiteralTypeNode["literal"]
): TypeDefine<T> {
  switch (node.kind) {
    case ts.SyntaxKind.BooleanKeyword:
      return Types.boolean as TypeDefine<T>;
    case ts.SyntaxKind.NumberKeyword:
      return Types.number as TypeDefine<T>;
    case ts.SyntaxKind.StringKeyword:
      return Types.string as TypeDefine<T>;
    case ts.SyntaxKind.UndefinedKeyword:
      return Types.undefined as TypeDefine<T>;
    case ts.SyntaxKind.NullKeyword:
      return Types.null as TypeDefine<T>;
    case ts.SyntaxKind.TrueKeyword:
      return Types.True as TypeDefine<T>;
    case ts.SyntaxKind.FalseKeyword:
      return Types.False as TypeDefine<T>;
    case ts.SyntaxKind.LiteralType:
      return getNodeTypeWithKind((node as ts.LiteralTypeNode).literal);
    case ts.SyntaxKind.AnyKeyword:
      return createNodeTypeDefine("any", void 0, void 0, node as ts.TypeNode) as TypeDefine<T>;
    case ts.SyntaxKind.UnknownKeyword:
      return createNodeTypeDefine("unknown", void 0, void 0, node as ts.TypeNode) as TypeDefine<T>;
    case ts.SyntaxKind.StringLiteral:
      return createNodeTypeDefine(
        "literal",
        (node as ts.StringLiteral).text,
        "string",
        node
      ) as TypeDefine<T>;
    case ts.SyntaxKind.NumericLiteral:
      return createNodeTypeDefine(
        "literal",
        (node as ts.NumericLiteral).text,
        "number",
        node
      ) as TypeDefine<T>;
    case ts.SyntaxKind.ArrayType:
      return createNodeTypeDefine("array", "Array", "reference", node) as TypeDefine<T>;
    case ts.SyntaxKind.TypeReference: {
      const typeName = (node as ts.TypeReferenceNode).typeName as ts.Identifier | ts.QualifiedName;
      const id = ts.isQualifiedName(typeName) ? typeName.right : typeName;
      // console.log(ts.SyntaxKind[typeName.kind], ts.isQualifiedName(typeName), ts.idText(id), printNode(typeName))
      return createNodeTypeDefine(ts.idText(id) as T, void 0, "reference", node) as TypeDefine<T>;
    }
  }
  return createNodeTypeDefine("unknown") as TypeDefine<T>;
}

function createNodeTypeDefine<T extends TypeName, Text extends DynamicString | T>(
  name: T,
  text: Text = name as Text,
  type: TypeDefine["type"] = "keyword",
  node?: ts.TypeNode | ts.LiteralExpression
): TypeDefine<T> {
  return {
    name,
    text,
    type,
    defineText: node?.getFullText()?.trim(),
    element:
      node &&
      (ts.isArrayTypeNode(node)
        ? ([getNodeTypeWithKind<T>(node.elementType)] as TypeDefine<T>[])
        : ts.isTypeReferenceNode(node) &&
          node.typeArguments?.map((node) => getNodeTypeWithKind<T>(node))),
    node,
  } as TypeDefine<T>;
}

export function getBaseType<K extends string>(node: ts.TypeNode): TypeDefine<K> | TypeDefine<K>[] {
  if (ts.isArrayTypeNode(node)) {
    return getNodeTypeWithKind(node) as TypeDefine<K>;
  }
  if (ts.isUnionTypeNode(node)) {
    return node.types.map((key) => getBaseType<K>(key)) as TypeDefine<K>[];
  }
  return getNodeTypeWithKind(node) as TypeDefine<K>;
}
