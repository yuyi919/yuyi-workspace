/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ts, { factory, Expression, Identifier } from "typescript";
import { castArray } from "lodash";
export * from "./elide-import-export";

export * from "./isLiteralOrIdentifier";

export * as Visitor from "./visit";

/**
 * 创建简单变量行
 * @param name 名称
 * @param value 表达式
 */
export function createVariableStatement(
  name: string | ts.Identifier | ts.ObjectBindingPattern | ts.ArrayBindingPattern,
  value?: ts.Expression,
  isLet = false,
  preModifier: ts.Modifier[] | ts.ModifiersArray = []
) {
  return factory.createVariableStatement(
    preModifier,
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(name, undefined, undefined, value)],
      !isLet ? ts.NodeFlags.Const : ts.NodeFlags.Let
    )
  );
}
/**
 * 创建简单变量行
 * @param name 名称
 * @param value 表达式
 */
export function createMultipleVariableStatement(
  id: [
    string | ts.Identifier | ts.ObjectBindingPattern | ts.ArrayBindingPattern,
    ts.Expression,
    ts.TypeNode?
  ][],
  isLet = false,
  preModifier: ts.Modifier[] | ts.ModifiersArray = []
) {
  return factory.createVariableStatement(
    preModifier,
    factory.createVariableDeclarationList(
      id.map(([name, value]) =>
        factory.createVariableDeclaration(name, undefined, undefined, value)
      ),
      !isLet ? ts.NodeFlags.Const : ts.NodeFlags.Let
    )
  );
}

/**
 * 创建是否为null的判断语句
 * @param sub
 */
export function createIsNotNil(sub: ts.Expression, strict: boolean = false) {
  return createIsNot(sub, factory.createNull(), strict);
}

/**
 * 创建是否为XXX的判断语句
 * @param sub
 * @param target
 */
export function createSetVar(
  sub: ts.Identifier,
  target: ts.Expression = factory.createIdentifier("undefined")
) {
  const { EqualsToken } = ts.SyntaxKind;
  return factory.createExpressionStatement(
    factory.createBinaryExpression(sub, EqualsToken, target)
  );
}
/**
 * 创建是否为XXX的判断语句
 * @param sub
 * @param target
 */
export function createIsNot(
  sub: ts.Expression,
  target: ts.Expression = factory.createIdentifier("undefined"),
  strict: boolean = true
) {
  const { ExclamationEqualsToken, ExclamationEqualsEqualsToken } = ts.SyntaxKind;
  return factory.createBinaryExpression(
    sub,
    strict ? ExclamationEqualsEqualsToken : ExclamationEqualsToken,
    target
  );
}

export function createIs(sub: ts.Expression, target: ts.Expression, strict: boolean = true) {
  return factory.createBinaryExpression(
    sub,
    strict ? ts.SyntaxKind.EqualsEqualsEqualsToken : ts.SyntaxKind.EqualsEqualsToken,
    target
  );
}

/**
 * 创建typeof xx === target的判断语句
 * @param sub
 * @param target
 */
export function createTypeof(
  sub: ts.Expression,
  target: ts.StringLiteral = factory.createStringLiteral("object")
) {
  const { EqualsEqualsEqualsToken } = ts.SyntaxKind;
  return factory.createBinaryExpression(
    factory.createTypeOfExpression(sub),
    EqualsEqualsEqualsToken,
    target
  );
}

/**
 * 创建简单的匿名函数闭包调用
 * @param line - 闭包行
 * @param isCall - 是否立即调用
 */
export function createArrowCall(line: ts.Statement[], isCall = true) {
  const func = ts.createParen(
    ts.createArrowFunction(
      [],
      [],
      [],
      ts.createLiteralTypeNode(ts.createLiteral("any")),
      ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      ts.createBlock(line, true)
    )
  );
  return isCall ? ts.createCall(func, [], []) : func;
}

/**
 * 创建三元运算符节点
 * @param express - 判断语句
 * @param whenTrue - 当为真
 * @param whenFalse - 当为false(默认值为undefined)
 */
export function createConditional(
  express: ts.Expression,
  whenTrue: ts.Expression,
  whenFalse?: ts.Expression
) {
  // tslint:disable-next-line: deprecation
  return ts.factory.createConditionalExpression(
    express,
    factory.createToken(ts.SyntaxKind.QuestionToken),
    whenTrue,
    factory.createToken(ts.SyntaxKind.ColonToken),
    whenFalse || factory.createVoidZero()
  );
}

/**
 * 根据字符串创建ast语法树
 * @param input
 * @param node 节点信息获取
 */
export function createAstFromString(input: string) {
  // console.log(ts.createSourceFile('temp.ts', input, ts.ScriptTarget.ES5).getFullText())
  return ts.createSourceFile("", input, ts.ScriptTarget.ES5, true, ts.ScriptKind.TS).statements;
}
/**
 * 根据字符串创建ast语法树
 * @param input
 * @param node 节点信息获取
 */
export function createAstExpressionFromString(input: string) {
  // console.log(ts.createSourceFile('temp.ts', input, ts.ScriptTarget.ES5).getFullText())
  return (
    ts.createSourceFile("", input, ts.ScriptTarget.ES5, true, ts.ScriptKind.TS)
      .statements[0] as ts.ExpressionStatement
  ).expression;
}

export function isSimpleDeclareOrLiteral(target: ts.Node) {
  return ts.isLiteralExpression(target) || ts.isIdentifier(target) || ts.isToken(target);
}

/**
 * 创建连续的三元判断运算
 * @param source 元素表达式集合
 * @param when 条件表达式
 */
export function createConditionalChainsFromExpression(
  source: ts.Expression[],
  when: (tmpDeclare: ts.Identifier) => ts.Expression = createIsNotNil,
  latestValue?: ts.Expression,
  resultTransformer: (expr: ts.Expression) => ts.Expression = (expr) => expr,
  conditionalFunction = createConditional
) {
  let sub = latestValue || (source.pop() as ts.Expression);
  while (source.length > 0) {
    const a = source.pop() as ts.Identifier;
    // console.log(ts.isLiteralExpression(a) || ts.isIdentifier(a), a.getFullText());
    const prev: ts.Identifier = a && isSimpleDeclareOrLiteral(a) ? a : (ts.createParen(a) as any);
    sub = conditionalFunction(when(prev), resultTransformer(prev), ts.createParen(sub));
    // console.log(sub.getFullText());
  }
  return sub;
}
/**
 * 创建while判断运算
 * @param source 元素表达式集合
 * @param when 条件表达式
 */
export function createWhileFromExpressions(
  source: ts.Expression[],
  when: (tmpDeclare: ts.Identifier | ts.Expression) => ts.Expression = createIsNotNil,
  latestValue: ts.Expression = source.pop() as ts.Expression,
  resultTransformer: (expr: ts.Expression) => ts.Statement = ts.createExpressionStatement,
  createIdentifier = ts.createIdentifier,
  hasSpread = source.some((i) => ts.isSpreadElement(i))
) {
  const tmpArrDeclare = createIdentifier("tempArr");
  const tmpResultDeclare = createIdentifier("tempResult");
  const tmpLengthDeclare = createIdentifier("tempLength");
  const tmpIndexDeclare = createIdentifier("tempIndex");
  const tmpResult = createVariableStatement(tmpResultDeclare);
  const tmpArr = createVariableStatement(tmpArrDeclare, ts.createArrayLiteral(source));
  const tmpLength = createVariableStatement(
    tmpLengthDeclare,
    hasSpread
      ? ts.createPropertyAccess(tmpArrDeclare, "length")
      : ts.createNumericLiteral(source.length + "")
  );
  const tmpIndex = createVariableStatement(tmpIndexDeclare, ts.createNumericLiteral("0"));
  const todo: ts.Statement[] = [
    ts.createIf(
      when(
        ts.createParen(
          ts.createBinary(
            tmpResultDeclare,
            ts.SyntaxKind.EqualsToken,
            ts.createElementAccess(tmpArrDeclare, ts.createPostfixIncrement(tmpIndexDeclare))
          )
        )
      ),
      ts.createBreak()
    ),
  ];
  return [
    tmpArr,
    tmpLength,
    tmpIndex,
    tmpResult,
    ts.createWhile(
      ts.createBinary(tmpIndexDeclare, ts.SyntaxKind.LessThanToken, tmpLengthDeclare),
      ts.createBlock(todo)
    ),
    resultTransformer(createConditional(when(tmpResultDeclare), tmpResultDeclare, latestValue)),
  ];
}
/**
 * 创建连续的if else判断运算
 * @param source 元素表达式集合
 * @param when 条件表达式
 */
export function createIfElseChainsFromExpression(
  source: ts.Expression[],
  when: (tmpDeclare: ts.Identifier) => ts.Expression = createIsNotNil,
  latestValue: ts.Expression = source.pop() as ts.Expression,
  resultTransformer: (expr: ts.Expression) => ts.Statement = ts.createExpressionStatement,
  ifelseFunction = ts.createIf
) {
  let sub: ts.Statement = ts.createExpressionStatement(latestValue);
  const result: ts.Statement[] = [];
  while (source.length > 0) {
    const a = source.pop() as ts.Identifier;
    // console.log(ts.isLiteralExpression(a) || ts.isIdentifier(a), a.getFullText());
    const prev: ts.Identifier = a && isSimpleDeclareOrLiteral(a) ? a : (ts.createParen(a) as any);
    sub = ifelseFunction(when(prev), resultTransformer(prev), sub);
    // console.log(sub.getFullText());
  }
  result.unshift(sub);
  return result;
}

export function createIfReturn(
  expression: ts.Expression,
  when: (tmpDeclare: ts.Expression) => ts.Expression = createIsNotNil,
  whenTrue: (e: ts.Expression) => ts.Statement = ts.createReturn
) {
  return ts.createIf(when(expression), whenTrue(expression));
}

/**
 * 创建if (xxx === void0) { xxx = yyy } 语句
 * @param access
 * @param initialValue
 */
export function createOptionalSetVariable(
  access: ts.Identifier | ts.PropertyAccessExpression,
  initialValue: ts.Expression | ts.Identifier,
  simple = true
) {
  if (simple) {
    return factory.createExpressionStatement(
      factory.createBinaryExpression(
        factory.createBinaryExpression(
          access,
          factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
          factory.createVoidZero()
        ),
        factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        factory.createParenthesizedExpression(
          factory.createBinaryExpression(
            access,
            ts.SyntaxKind.EqualsToken,
            factory.createParenthesizedExpression(initialValue) || factory.createVoidZero()
          )
        )
      )
    );
  }
  return factory.createIfStatement(
    factory.createBinaryExpression(
      access,
      factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
      factory.createVoidZero()
    ),
    createSetVariableStatement(access, initialValue)
  );
}

// const simpleRegexExpression = /^((?!([+-/\\()]^%))\S)+$/

export function getUpperBlock(node: ts.Node) {
  let p = node.parent;
  while (p) {
    if (ts.isBlock(p) || ts.isModuleBlock(p)) {
      break;
    }
    p = p.parent;
  }
  return p as ts.Block;
}

export function getUpperObjectDeclare(node: ts.Node) {
  let p = node.parent;
  while (p) {
    if (ts.isObjectLiteralExpression(p)) {
      break;
    }
    p = p.parent;
  }
  return p as ts.ObjectLiteralExpression;
}

let flag = 0;
const expectMap = new Map<ts.Node, any>();

export function updateObjectPropertyAssignment(
  node: ts.VariableStatement,
  expect: (node: ts.PropertyAssignment) => ts.Expression | false
) {
  return ts.updateVariableStatement(
    node,
    undefined,
    ts.updateVariableDeclarationList(
      node.declarationList,
      node.declarationList.declarations.map((de) => {
        return ts.updateVariableDeclaration(
          de,
          de.name,
          de.type,
          de.initializer && ts.isObjectLiteralExpression(de.initializer)
            ? ts.updateObjectLiteral(
                de.initializer,
                de.initializer.properties.map((property) => {
                  if (ts.isPropertyAssignment(property)) {
                    const replacer = expect(property);
                    return replacer
                      ? ts.updatePropertyAssignment(property, property!.name!, replacer)
                      : property;
                  }
                  return property;
                })
              )
            : de.initializer
        );
      })
    )
  );
}

/**
 * 记录源文件的行节点，返回一个捕获是否为已记录的行节点的函数
 * @param source 搜寻的起始源节点
 * @param value
 * @param expect 判断是否为需要的节点，不满足条件则向上搜寻
 */
export function expectParentStatement(
  source: ts.Node,
  value: any = ++flag,
  expect: (node: ts.Node) => node is ts.Statement = ts.isExpressionStatement
) {
  let node = source.parent;
  while (node) {
    if (expect(node)) {
      // const text = node.flags
      // if (text) {
      // console.log('expect', text, value)
      expectMap.set(node, value);
      // }
      break;
    }
    node = node.parent;
  }
  return (node: ts.Node) => {
    return expectMap.has(node) && expectMap.get(node) === value;
  };
}

/**
 * 创建变量赋值行
 * @param identifier
 * @param expression
 */
export function createSetVariableStatement(
  identifier: ts.Identifier | ts.PropertyAccessExpression,
  expression?: ts.Expression | ts.Identifier
) {
  return factory.createExpressionStatement(
    factory.createBinaryExpression(
      identifier,
      ts.SyntaxKind.EqualsToken,
      expression || factory.createVoidZero()
    )
  );
}
export function createVoid0() {
  return factory.createVoidExpression(factory.createNumericLiteral("0"));
}

export function createCallChain(
  expression: ts.Expression,
  callChains: {
    callName: string | ts.Identifier;
    questionDotToken?: ts.QuestionDotToken;
    typeArguments?: readonly ts.TypeNode[];
    argumentsArray: readonly ts.Expression[];
    comment?: string;
  }[]
) {
  for (const {
    callName,
    questionDotToken: dotToken,
    typeArguments: type,
    argumentsArray: args = [],
    comment,
  } of callChains) {
    expression = factory.createCallExpression(
      factory.createPropertyAccessExpression(
        expression,
        comment
          ? setSyntheticLeadingComments(
              typeof callName === "string" ? ts.factory.createIdentifier(callName) : callName,
              comment
            )
          : callName
      ),
      type,
      args
    );
  }
  return expression;
}
/**
 *
 * @param expressList
 * @param when
 * @param whenTrue 加入解析式为true
 * @param leftReturn
 */
export function createWhenToDoForEach(
  expressList: ts.NodeArray<ts.Expression>,
  when: (tmpDeclare: ts.Expression) => ts.Expression = createIsNotNil,
  whenTrue: (e: ts.Expression) => ts.Statement = (e) => factory.createReturnStatement(e)
): UpdateNodeResults {
  const block: ts.Statement[] = [];
  const tmpDeclare = factory.getGeneratedNameForNode(
    (expressList[0] && expressList[0].parent) || expressList[0]
  );

  const simpleExpression: ts.Expression[] = [];
  const multipleExpressions: ts.Expression[] = [];
  const tmpFlag = ++flag;
  return [
    tmpDeclare,
    [
      createVariableStatement(tmpDeclare, ts.createIdentifier("undefined")),
      ...createWhileFromExpressions(
        [...expressList],
        when,
        factory.createIdentifier("undefined"),
        (expr) => createSetVariableStatement(tmpDeclare, expr),
        (name) => factory.createIdentifier(`_${name}_${tmpFlag}`)
      ),
    ],
  ];
}

export function useName(name: string | ts.Identifier): ts.Identifier;
export function useName(name?: string | ts.Identifier): ts.Identifier | undefined;
export function useName(name: string | ts.Identifier | undefined): ts.Identifier | undefined {
  return typeof name === "string" ? factory.createIdentifier(name) : name;
}
export function useNameOrExpression(
  name: string | ts.Identifier | ts.CallExpression
): ts.Identifier | ts.CallExpression;
export function useNameOrExpression(
  name: string | ts.Identifier | ts.CallExpression | undefined
): ts.Identifier | ts.CallExpression | undefined;
export function useNameOrExpression(
  name: string | ts.Identifier | ts.CallExpression | undefined
): ts.Identifier | ts.CallExpression | undefined {
  return typeof name === "string" ? ts.createIdentifier(name) : name;
}

export function createNamedExports(exportedName: ts.ExportSpecifier[]) {
  return ts.factory.createExportDeclaration(
    undefined,
    undefined,
    undefined,
    ts.factory.createNamedExports(exportedName)
  );
}

export function createNamedImports(
  moduleName: string,
  importNames: (string | ts.Identifier | [ts.Identifier, ts.Identifier])[]
) {
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      undefined /** ？？ **/,
      factory.createNamedImports(
        importNames.map((names) => {
          const [name, asName = undefined] = castArray(names);
          const nameIdent = useName(name);
          return factory.createImportSpecifier(false, useName(asName) /** 别名**/, nameIdent);
        })
      )
    ),
    factory.createStringLiteral(moduleName)
  );
}

export function isValidType(
  node: ts.TypeNode | undefined,
  typeName: string
  // @ts-ignore
): node is ts.CallExpression {
  if (!node) {
    return false;
  }

  // 交叉/联合类型时进行递归检查
  if (ts.isIntersectionTypeNode(node) || ts.isUnionTypeNode(node)) {
    return node.types.some((n) => isValidType(n, typeName));
  }

  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
    if (node.typeName.escapedText === typeName) {
      return true;
    }
  }

  return false;
}

/**
 * 检查并过滤特定的命名导入
 * @param node
 * @param check
 * @returns
 * 如果不为导入语句则不处理，返回false
 * 如果被过滤后的命名导入内容为空集，且没有默认导入语句，将直接返回一个空Statement
 * 否则返回经过过滤后的导入Statement
 */
export function checkAndfilterNamedImports(
  node: ts.Node,
  check: (
    named: ts.ImportSpecifier,
    index?: number,
    names?: readonly ts.ImportSpecifier[]
  ) => boolean
): ts.ImportDeclaration | ts.EmptyStatement | boolean {
  if (ts.isImportDeclaration(node) && node.importClause && node.importClause.namedBindings) {
    let binds: ts.NamedImportBindings | undefined = node.importClause.namedBindings;
    if (ts.isNamedImports(binds)) {
      const nextElements = binds.elements.filter(check);
      if (nextElements.length === 0) {
        if (!node.importClause.name) {
          return true;
        } else {
          binds = undefined;
        }
      } else {
        binds = factory.createNamedImports(nextElements);
      }
    }
    const importClause = factory.updateImportClause(
      node.importClause,
      node.importClause.isTypeOnly,
      node.importClause.name,
      binds
    );
    return Object.assign(node, {
      importClause,
    });
  }
  return false;
}
/**
 *
 * @param expressList
 * @param when
 * @param whenTrue 加入解析式为true
 * @param leftReturn
 */
export function createWhenToReturnConditional(
  expressList: ts.NodeArray<ts.Expression>,
  when: (tmpDeclare: ts.Expression) => ts.Expression = createIsNotNil
) {
  let isSimple = true;
  // const name = '_$tmp_' + flag++
  const tmpDeclare = ts.getGeneratedNameForNode(
    (expressList[0] && expressList[0].parent) || expressList[0]
  );
  const last = ts.createIdentifier("undefined");
  const batchList = expressList.map((expr) => {
    if (isSimpleDeclareOrLiteral(expr)) {
      return expr;
    }
    isSimple = false;
    /**
     * ((_$tmp = (a && 1 || 0 + 2)) || 1) && _$tmp) != null
     * 类似这样的语法结构可以在行内进行缓存计算值&判断是否符合要求&返回计算值
     */
    return ts.createParen(
      ts.createBinary(tmpDeclare, ts.SyntaxKind.EqualsToken, ts.createParen(expr))
    );
    // /**
    //  * ((_$tmp = (a && 1 || 0 + 2)) || 1) && _$tmp) != null
    //  * 类似这样的语法结构可以在行内进行缓存计算值&判断是否符合要求&返回计算值
    //  */
    // return ts.createBinary(
    //   ts.createBinary(
    //     // $a = x
    //     ts.createBinary(tmpDeclare, ts.SyntaxKind.EqualsToken, ts.createParen(expr)),
    //     ts.SyntaxKind.BarBarToken,
    //     ts.createLiteral(1)
    //   ), // ($a = x || 1) 防止x为false
    //   ts.SyntaxKind.AmpersandAmpersandToken, // &&标识符
    //   tmpDeclare
    // )
  });
  if (isSimple) {
    return [createConditionalChainsFromExpression(batchList, when, last)] as UpdateNodeResults;
  } else {
    const block: ts.Statement[] = [];
    const r = createConditionalChainsFromExpression(batchList, when, last, (expr) =>
      isSimpleDeclareOrLiteral(expr) ? expr : (tmpDeclare as ts.Identifier)
    );
    if (tmpDeclare) {
      block.push(
        createVariableStatement(tmpDeclare)
        // ts.createExpressionStatement(
        //   createAstExpressionFromString(`&&`)
        // )
      );
    }
    return [r, block] as UpdateNodeResults;
  }
}

export function createObjectWithDeclare(obj: Record<string, string | Expression | Identifier>) {
  return createObjectWithEntries(Object.entries(obj));
}
export function createObjectWithEntries(
  entries: [
    name: string | ts.Identifier,
    expr:
      | string
      | Expression
      | Identifier
      | ts.MethodDeclaration
      | ts.GetAccessorDeclaration
      | ts.SetAccessorDeclaration,
    comment?: string
  ][],
  stringKey = false
) {
  return factory.createObjectLiteralExpression(
    entries.map(
      ([key, value, comment]: [
        name: string | ts.Identifier,
        expr:
          | string
          | Expression
          | Identifier
          | ts.GetAccessorDeclaration
          | ts.SetAccessorDeclaration
          | ts.MethodDeclaration,
        comment?: string
      ]) => {
        return setSyntheticLeadingComments(
          typeof value === "object" &&
            (ts.isGetAccessorDeclaration(value) ||
              ts.isSetAccessorDeclaration(value) ||
              ts.isMethodDeclaration(value))
            ? value
            : factory.createPropertyAssignment(
                stringKey
                  ? factory.createStringLiteral(
                      typeof key === "string" ? key : (key.escapedText as string)
                    )
                  : key,
                typeof value === "string" ? factory.createIdentifier(value) : value
              ),
          comment
        );
      }
    )
  );
}

export type UpdateNodeResults = [ts.Expression, ts.Statement[]?, ts.Statement[]?];
export type UpdateHook = (
  sourceNode: ts.Node,
  replaceNode: ts.Node,
  rollupParams?: any[]
) => ts.Node[] | false;

/**
 * 抽取类装饰器
 * @param node 类定义节点
 * @param decortor 装饰器（名称或者表达式）
 * @param appendParams 装饰器方法首个参数必定为类自身，通过此追加参数
 * @param placeholderName 如果是无名类，提供默认名称
 */
export function extractClassCallExpression(
  node: ts.ClassDeclaration,
  decortor: string | ts.Identifier | ts.CallExpression,
  appendParams: any[],
  placeholderName?: string | ts.Identifier
) {
  const modifiers = node.modifiers;
  const classT = factory.createClassExpression(
    undefined,
    undefined,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    node.members
  );
  return createVariableStatement(
    node.name || useName(placeholderName) || factory.createIdentifier("tmp"),
    factory.createCallExpression(useNameOrExpression(decortor), undefined, [
      classT,
      ...appendParams,
    ]),
    false,
    modifiers
  );
}

export function setSourceFile<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): T {
  node["getSourceFile"] = function () {
    return sourceFile;
  };
  return node;
}

export function isFuncOrArrowExpr(node: ts.Node): node is ts.ArrowFunction | ts.FunctionExpression {
  return (
    node &&
    (node.kind === ts.SyntaxKind.FunctionExpression || node.kind === ts.SyntaxKind.ArrowFunction)
  );
}

export function createImportImportDeclarationWith(
  importClause: ts.ImportClause,
  moduleName: ts.StringLiteral,
  esmodule = true,
  esModuleInterop: boolean | "preserve" = true,
  transformToDefaultImport = false
) {
  if (esmodule) {
    return ts.factory.createImportDeclaration(void 0, void 0, importClause, moduleName);
  }

  const elements = (importClause.namedBindings as ts.NamedImports).elements;
  const moduleImport = elements.length > 1 && factory.createTempVariable((node) => {});
  const requireCaller = ts.factory.createCallExpression(
    ts.factory.createIdentifier("require"),
    undefined,
    [moduleName]
  );
  return createMultipleVariableStatement(
    (importClause.namedBindings as ts.NamedImports).elements.reduce((r, element) => {
      const { name, propertyName = name } = element;
      const moduleIdentifier = moduleImport || requireCaller;
      if (esModuleInterop === true && transformToDefaultImport) {
        const tmpName = ts.factory.createIdentifier("__" + name.text);
        return [
          ...r,
          [tmpName, moduleIdentifier],
          [
            name,
            ts.factory.createLogicalOr(
              ts.factory.createPropertyAccessExpression(
                tmpName,
                ts.factory.createIdentifier("default")
              ),
              tmpName
            ),
          ],
        ];
      }
      return [
        ...r,
        [
          name,
          esModuleInterop === "preserve"
            ? moduleIdentifier
            : ts.factory.createPropertyAccessExpression(
                moduleIdentifier,
                transformToDefaultImport ? ts.factory.createIdentifier("default") : propertyName
              ),
        ],
      ];
    }, (moduleImport && [[moduleImport, requireCaller]]) || []),
    false
  );
}

export function checkIsCommonjs(context: ts.TransformationContext) {
  return /commonjs/gi.test(ts.ModuleKind[context.getCompilerOptions().module as ts.ModuleKind]);
}
export function checkIsEsModule(context: ts.TransformationContext) {
  return /es/gi.test(ts.ModuleKind[context.getCompilerOptions().module as ts.ModuleKind]);
}

export function convertClassMethodToFunctionExpression(
  method: ts.MethodDeclaration,
  asteriskToken = method.asteriskToken,
  modifiers?: readonly ts.Modifier[]
) {
  return ts.factory.createFunctionExpression(
    modifiers,
    asteriskToken,
    method.name as ts.Identifier,
    method.typeParameters,
    method.parameters,
    method.type,
    method.body
  );
}

export function setSyntheticLeadingComments<T extends ts.Node>(node: T, ...text: string[]): T {
  text = text.filter((text) => typeof text === "string");
  return text.length > 0
    ? ts.setSyntheticLeadingComments(
        node,
        text.map((text) => ({
          text: `* ${text} `,
          pos: -1,
          end: -1,
          kind: ts.SyntaxKind.MultiLineCommentTrivia,
          hasLeadingNewline: true,
        }))
      )
    : node;
}

export * from "./toString";
export * as Comment from "./comment";
