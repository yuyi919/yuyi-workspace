// /* eslint-disable @typescript-eslint/no-explicit-any */
import { printNodes, printNode } from "./printNodes";
import { testModule } from "./testFunction";
// // import { FunctionMacro } from "@yuyi919/ts-transformer-macros";
// // import { AstUtils } from "@yuyi919-ts-transformer/ast-utils";
// // import { extendMap } from "@yuyi919/shared-utils";
// import ts, { factory } from "typescript";
describe("printNodes", () => {
  it("base use", () => {
    expect(printNodes(testModule.statements)).toMatchSnapshot();
  });

//   class NodeContext<T extends ts.Node = ts.Node, Parent extends ts.Node = ts.Node> {
//     constructor(
//       public node?: T,
//       public parentStatement?: ts.Statement,
//       public parent?: NodeContext<Parent>,
//       public level = 0,
//       public debugText = printNode(node),
//       public kind = node.kind,
//       public kindText = ts.SyntaxKind[node.kind]
//     ) {
//       if (parent) {
//         parent.statements.push(this);
//         parent.statementsText.push(debugText);
//         this._context = parent._context;
//       } else {
//         this._context = new WeakMap();
//       }
//       this.locals = extendMap();
//     }

//     // children: (NodeContext<ts.Node> | ts.Statement)[] = [];

//     statements: (NodeContext<ts.Node> | ts.Statement)[] = [];
//     statementsText: string[] = [];

//     topStatements: ts.Statement[] = [];
//     bottomStatements: ts.Statement[] = [];

//     prependStatements: ts.Statement[] = [];
//     appendStatements: ts.Statement[] = [];

//     nextBlock<NT extends ts.Node>(node?: NT, parentStatement?: ts.Statement): NodeContext<NT, T> {
//       return new NodeContext<NT, T>(node, parentStatement, this, this.level + 1);
//     }

//     locals: Map<string, IdentifierContext[]>;
//     collected = new Map();
//     collectLocal(name: ts.Identifier, parent: ts.Statement, param?: boolean) {
//       const nameText = name.escapedText as string;
//       if (this.collected.has(name)) {
//         return this.collected.get(name);
//       }
//       const collected = this.locals.get(nameText) || [];
//       const nextName =
//         collected.length > 0
//           ? factory.createIdentifier(nameText + "_" + (collected.length - 0))
//           : name;
//       this.locals.set(
//         nameText,
//         collected.concat([new IdentifierContext(nextName, parent, param ? "paramater" : "local")])
//       );
//       this.collected.set(name, nextName);
//       return nextName;
//     }
//     getLocalIdentifierText(escapedText: string | ts.__String): string {
//       const arr = this.locals.get(escapedText as string);
//       return ((arr && arr.length > 1 && arr[arr.length - 1].name.escapedText) ||
//         escapedText) as string;
//     }

//     // identifierReplacer: Map<string, any> = new Map();
//     // setLocalIdentifier(key: string, value: string) {
//     //   this.identifierReplacer.set(key, value);
//     // }
//     // getLocalIdentifier(node: ts.Identifier | ts.BindingName): ts.Identifier {
//     //   //@ts-ignore
//     //   node.escapedText = this.getLocalIdentifierText(
//     //     this.identifierReplacer.get(
//     //       (<ts.Identifier>node).escapedText as string
//     //     ) || (<ts.Identifier>node).escapedText
//     //   );
//     //   return node as any;
//     // }

//     nextStatment(node?: ts.Statement): this {
//       this.statements.push(node);
//       this.statementsText.push(printNode(node));
//       return this;
//     }

//     collectPreVariableDeclaration(name) {
//       const statement = this.prependStatements.pop();
//       // if ()
//     }

//     collectPrevStatement = (nextStatements: ts.Statement) => {
//       this.prependStatements.push(nextStatements);
//     };
//     collectNextStatement = (nextStatements: ts.Statement) => {
//       this.appendStatements.push(nextStatements);
//     };

//     newStatements: ts.Statement[] = [];
//     recordStatement(nextStatements: ts.Statement, newStatements = this.newStatements) {
//       newStatements.push(...this.prependStatements);
//       newStatements.push(nextStatements);
//       newStatements.push(...this.appendStatements);
//       this.prependStatements = [];
//       this.appendStatements = [];
//       return this;
//     }

//     recordBlock(newStatements = this.newStatements) {
//       const r2 = {
//         [ts.SyntaxKind.VariableStatement]: 0,
//         [ts.SyntaxKind.FunctionDeclaration]: 0,
//         [ts.SyntaxKind.ImportDeclaration]: -1,
//         [ts.SyntaxKind.ExpressionStatement]: 1,
//       };
//       const result = this.topStatements.concat(newStatements).concat(this.bottomStatements);
//       return result.sort((a, b) => r2[a.kind] - r2[b.kind]);
//     }

//     _context: WeakMap<ContextDefine<any>, any>;

//     injectCustom<T>(type: ContextDefine<T>, value?: T): T | undefined {
//       return this._context.get(type) ?? type.default() ?? value;
//     }

//     provideCustom<T>(type: ContextDefine<T>, value: T) {
//       return this._context.set(type, value), value;
//     }

//     static createCustom<T>(name: string, initVal?: () => T): ContextDefine<T>;
//     static createCustom<T>(name: string, initVal?: T): ContextDefine<T>;
//     static createCustom<T>(name: string, initVal?: (() => T) | T): ContextDefine<T> {
//       return {
//         name,
//         default: initVal && (initVal instanceof Function ? initVal : () => initVal),
//       };
//     }
//   }
//   type ContextDefine<T> = {
//     name: string;
//     default?: () => T;
//   };
//   class IdentifierContext {
//     constructor(
//       public name: ts.Identifier,
//       public parent: ts.Statement,
//       public type: "paramater" | "local"
//     ) {}
//   }

//   type CustomTransformerContext = {
//     node: ts.Node;
//     parentNode?: ts.Node;
//     parentStatement?: ts.Statement;
//     blockContext?: NodeContext;
//     rootContext: NodeContext;
//     transformationContext: ts.TransformationContext;
//     hooks?: ((node: ts.Node, context: CustomTransformerContext) => void)[];
//     resolvers: {
//       type: "all" | "childOnly";
//       test(node: ts.Node, context: CustomTransformerContext): boolean;
//       replace(node: ts.Node, context: CustomTransformerContext): ts.Node;
//     }[];
//   };

//   const transform = (context: CustomTransformerContext): ts.Node => {
//     const { node, parentNode, parentStatement, blockContext, transformationContext } = context;
//     //@ts-ignore
//     node.parent = node.parent || parentNode;
//     if (node.kind === ts.SyntaxKind.Block || node.kind === ts.SyntaxKind.SourceFile) {
//       const nextBlockContext =
//         node.kind === ts.SyntaxKind.SourceFile
//           ? blockContext
//           : blockContext.nextBlock(node, parentStatement);

//       for (const child of Array.from((<ts.Block>node).statements)) {
//         const nextStatements = transform({
//           ...context,
//           resolvers: context.resolvers.filter((o) => o.type === "all"),
//           node: child,
//           parentNode: node,
//           parentStatement: child,
//           blockContext: nextBlockContext.nextStatment(child),
//         }) as ts.Statement;
//         nextBlockContext.recordStatement(nextStatements);
//       }
//       const result = AstUtils.updateBlockOrSourceFile(
//         <ts.Block>node,
//         nextBlockContext.recordBlock().map((child) =>
//           transform({
//             ...context,
//             // resolvers: context.resolvers.filter((o) => o.type === 'childOnly'),
//             node: child,
//             parentNode: node,
//             parentStatement: child,
//             blockContext: nextBlockContext,
//           })
//         ) as any
//       );
//       return result as ts.Node;
//     }

//     if (context.hooks) {
//       context.hooks?.forEach((hook) => {
//         hook(node, context);
//       });
//     }

//     // 收集本地参数
//     if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
//       blockContext.collectLocal(node.name, parentStatement);
//     }

//     // 收集本地解构参数
//     if (ts.isObjectBindingPattern(node) && ts.isVariableDeclaration(node.parent)) {
//       const visitor = (child: ts.Node) => {
//         if (ts.isBindingElement(child) && ts.isIdentifier(child.name)) {
//           blockContext.collectLocal(child.name, parentStatement);
//           return child;
//         } else return ts.visitEachChild(child, visitor, transformationContext);
//       };
//       ts.visitEachChild(node, visitor, transformationContext);
//     }
//     if (context.resolvers.length > 0) {
//       let nextNode = node;
//       for (const resolver of context.resolvers) {
//         if (resolver.test(nextNode, context)) {
//           nextNode = resolver.replace(nextNode, context);
//         }
//       }
//       return ts.visitEachChild(
//         nextNode,
//         (child) =>
//           transform({
//             ...context,
//             node: child,
//             parentNode: nextNode,
//             parentStatement: parentStatement,
//             blockContext: blockContext,
//           }),
//         transformationContext
//       );
//     }
//     return ts.visitEachChild(
//       node,
//       (child) =>
//         transform({
//           ...context,
//           node: child,
//           parentNode: node,
//           parentStatement: parentStatement,
//           blockContext: blockContext,
//         }),
//       transformationContext
//     );
//   };

//   it("ts block", () => {
//     ts.transform(testModule, [
//       (context) => {
//         function dumpName(str: string, index: number) {
//           if (index > 0) {
//             //@ts-ignore
//             return str + "_" + index;
//           }
//           return str;
//         }
//         const ArgReplacerContext = NodeContext.createCustom(
//           "test",
//           () => new Map<string | ts.__String, ts.Identifier>()
//         );
//         return (node) => {
//           const i = 0;
//           const rootContext = new NodeContext(node);
//           const result = transform({
//             node,
//             rootContext,
//             blockContext: rootContext,
//             transformationContext: context,
//             resolvers: [
//               {
//                 type: "all",
//                 replace(callExpr: ts.CallExpression, { parentStatement, blockContext }) {
//                   const argReplacer = ArgReplacerContext.default();
//                   // const
//                   const Args = [
//                     factory.createParameterDeclaration(
//                       undefined,
//                       undefined,
//                       undefined,
//                       factory.createIdentifier("target"),
//                       undefined,
//                       factory.createArrayTypeNode(
//                         factory.createTypeReferenceNode(factory.createIdentifier("T"), undefined)
//                       ),
//                       undefined
//                     ),
//                     factory.createParameterDeclaration(
//                       undefined,
//                       undefined,
//                       undefined,
//                       factory.createIdentifier("callbackfn"),
//                       undefined,
//                       factory.createFunctionTypeNode(
//                         undefined,
//                         [
//                           factory.createParameterDeclaration(
//                             undefined,
//                             undefined,
//                             undefined,
//                             factory.createIdentifier("value"),
//                             undefined,
//                             factory.createTypeReferenceNode(
//                               factory.createIdentifier("T"),
//                               undefined
//                             ),
//                             undefined
//                           ),
//                           factory.createParameterDeclaration(
//                             undefined,
//                             undefined,
//                             undefined,
//                             factory.createIdentifier("index"),
//                             undefined,
//                             factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
//                             undefined
//                           ),
//                           factory.createParameterDeclaration(
//                             undefined,
//                             undefined,
//                             undefined,
//                             factory.createIdentifier("array"),
//                             undefined,
//                             factory.createArrayTypeNode(
//                               factory.createTypeReferenceNode(
//                                 factory.createIdentifier("T"),
//                                 undefined
//                               )
//                             ),
//                             undefined
//                           ),
//                         ],
//                         factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
//                       ),
//                       undefined
//                     ),
//                   ];

//                   const Type = factory.createTypeReferenceNode("T");
//                   const statements = [
//                     AstUtils.createMultipleVariableStatement(
//                       Args.map((arg, index) => {
//                         const paramExpr = callExpr.arguments[index];
//                         const prevName = arg.name as ts.Identifier;
//                         let name = arg.name as ts.Identifier;
//                         if (ts.isArrowFunction(paramExpr) || ts.isFunctionExpression(paramExpr)) {
//                           const next = factory.createIdentifier(prevName.escapedText + "__Macro");
//                           name = next;
//                         }

//                         const next = blockContext.collectLocal(name, parentStatement);
//                         argReplacer.set(name.escapedText, next);
//                         return [next, paramExpr];
//                       }),
//                       true
//                     ),
//                     AstUtils.createMultipleVariableStatement(
//                       [
//                         ["i", factory.createNumericLiteral("-1"), Type],
//                         [
//                           "length",
//                           factory.createBinaryExpression(
//                             factory.createPropertyAccessExpression(
//                               factory.createIdentifier("target"),
//                               factory.createIdentifier("length")
//                             ),
//                             factory.createToken(ts.SyntaxKind.MinusToken),
//                             factory.createNumericLiteral("1")
//                           ),
//                           factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword),
//                         ],
//                         ["item", undefined, Type],
//                       ],
//                       true
//                     ),
//                     factory.createWhileStatement(
//                       factory.createBinaryExpression(
//                         factory.createIdentifier("i"),
//                         factory.createToken(ts.SyntaxKind.LessThanToken),
//                         factory.createIdentifier("len")
//                       ),
//                       factory.createBlock(
//                         [
//                           factory.createExpressionStatement(
//                             factory.createBinaryExpression(
//                               factory.createIdentifier("item"),
//                               factory.createToken(ts.SyntaxKind.EqualsToken),
//                               factory.createElementAccessExpression(
//                                 factory.createIdentifier("target"),
//                                 factory.createPrefixUnaryExpression(
//                                   ts.SyntaxKind.PlusPlusToken,
//                                   factory.createIdentifier("i")
//                                 )
//                               )
//                             )
//                           ),
//                           factory.createExpressionStatement(
//                             factory.createCallExpression(
//                               factory.createIdentifier("callbackfn"),
//                               undefined,
//                               [
//                                 factory.createIdentifier("item"),
//                                 factory.createIdentifier("i"),
//                                 factory.createIdentifier("target"),
//                               ]
//                             )
//                           ),
//                         ],
//                         true
//                       )
//                     ),
//                     factory.createReturnStatement(),
//                   ];

//                   blockContext.provideCustom(ArgReplacerContext, argReplacer);
//                   for (const statement of statements) {
//                     if (ts.isReturnStatement(statement)) {
//                       return statement.expression || factory.createToken(ts.SyntaxKind.NullKeyword);
//                     } else {
//                       blockContext.collectPrevStatement(statement);
//                     }
//                   }
//                   return factory.createToken(ts.SyntaxKind.NullKeyword);
//                 },
//                 test(node: ts.Node) {
//                   return (
//                     ts.isCallExpression(node) &&
//                     ts.isIdentifier(node.expression) &&
//                     node.expression.escapedText === "map"
//                   );
//                 },
//               },
//               {
//                 type: "childOnly",
//                 test(node, { blockContext }) {
//                   const argReplacer = blockContext.injectCustom(ArgReplacerContext);
//                   return (
//                     ts.isIdentifier(node) &&
//                     (blockContext.locals.has(node.escapedText as string) ||
//                       argReplacer.has(node.escapedText as string))
//                   );
//                 },
//                 replace(node: ts.Identifier, { blockContext }) {
//                   const argReplacer = blockContext.injectCustom(ArgReplacerContext);
//                   return factory.createIdentifier(
//                     blockContext.getLocalIdentifierText(
//                       argReplacer.get(node.escapedText)?.escapedText || node.escapedText
//                     )
//                   );
//                 },
//               },
//             ],
//             hooks: [
//               (node, { parentStatement, blockContext }) => {
//                 // 收集函数参数
//                 if (ts.isParameter(node)) {
//                   const name = node.name as ts.Identifier;
//                   // blockContext.collectLocal(name, parentStatement, true);
//                   // blockContext.collectPrevStatement(
//                   //   AstUtils.createVariableStatement(
//                   //     dumpName(
//                   //       name.escapedText as string, // + `_level${i++}_`,
//                   //       blockContext.locals.get(name.escapedText as string)
//                   //         ?.length - 1
//                   //     ),
//                   //     undefined,
//                   //     true
//                   //   )
//                   // );
//                 }
//                 if (ts.isIdentifier(node)) {
//                   // const argReplacer = blockContext.injectCustom(
//                   //   ArgReplacerContext
//                   // );
//                   // //@ts-ignore
//                   // node.escapedText = blockContext.getLocalIdentifierText(
//                   //   argReplacer.get(node.escapedText as string) ||
//                   //     node.escapedText
//                   // );
//                 }
//               },
//             ],
//           });
//           // expect(rootContext.context).toMatchSnapshot();

//           expect(printNode(result)).toMatchSnapshot();
//           return result as ts.SourceFile;
//         };
//       },
//     ]);
//   });
});
