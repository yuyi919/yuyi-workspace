import { AssertWrapper, extendTest, extendWrapper, test } from "@yuyi919/zora";
import { parseExpression } from ".";
import {
  CallMacroExpression,
  createBinaryExpression,
  createCallExpression,
  createCallMacroExpression,
  createIncrementExpression,
  createLiteralExpression,
  createPrecetLiteralExpression,
  createVariableIdentifier,
  ExpressionKind,
  ExpressionNodeData,
  NodeTypeKind,
  TemplateExpression,
} from "../interface";
import { createScope, Scope } from "../scope";

const describe = extendTest(test, (expect) => ({
  eval(expr: string, name: string, scope: Scope = createScope()) {
    const result = eval(expr);
    expect.equal(
      scope.eval(expr),
      result,
      `${name}[${expr}] === [eval(${JSON.stringify(expr)}) => ${JSON.stringify(result)}]`
    );
  },
  evalWith(expr: string, evalExpr: string, name: string, scope: Scope = createScope()) {
    const result = eval(evalExpr);
    expect.equal(
      scope.eval(expr),
      result,
      `${name}[${expr}] === [eval(${JSON.stringify(evalExpr)}) => ${JSON.stringify(result)}]`
    );
  },
  calc(expr: string, result: any, name: string, scope: Scope = createScope()) {
    expect.equal(scope.eval(expr), result, `${name}[${expr}] === [${result}]`);
  },
  baseTest(
    exprs: string | string[],
    expectKind: ExpressionKind,
    name: string,
    extend?: (data: ExpressionNodeData) => any
  ) {
    for (let exp of exprs instanceof Array ? exprs : [exprs]) {
      expect.test(`${name} - ${exp}`, (expect) => {
        const data = parseExpression(exp);
        expect.is(data.type, NodeTypeKind.Expression, `应该解析为表达式`);
        expect.is(data.kind, expectKind, `应该是${name}表达式`);
        // expect.is(data.sourceString.trim(), exp.trim(), "source字段保留");
        extend?.(data);
      });
    }
  },
}));

describe("表达式解析", ({ test }) => {
  // expect.test("测试", (expect) => {
  //   // expect.baseTest(["1,2"], ExpressionKind.Comma, "逗号运算");
  // });
  test("基本表达式", (expect) => {
    expect.baseTest(["1,2", "   1,       2 "], ExpressionKind.Comma, "逗号运算");
    expect.baseTest("1+2", ExpressionKind.Binary, "二元运算");
    expect.baseTest(
      ["call(123)", "call(123)", "@call(123)", "@call(123)|"],
      ExpressionKind.CallFunction,
      "函数调用"
    );
    expect.baseTest("@call a=1", ExpressionKind.CallMacro, "宏调用", console.log);

    expect.throwError(() => parseExpression("+"), `Expected $Exp$`, "正确的错误提示");
    expect.throwError(() => parseExpression("1a=2"), `Expected $END$ or $Exp$`, "错误提示");

    expect.same(
      parseExpression("1||2||3"),
      createBinaryExpression(
        createLiteralExpression(1),
        "||",
        createBinaryExpression(
          createLiteralExpression(2),
          "||",
          createLiteralExpression(3),
          "2||3"
        ),
        "1||2||3"
      ),
      "正确解析逻辑运算符"
    );

    expect.equals(parseExpression("1%"), createPrecetLiteralExpression(1), "百分比字面量");
    expect.equals(
      parseExpression("a++"),
      createIncrementExpression("a", "++", false, "a++"),
      "百分比字面量"
    );
    expect.equals(
      parseExpression("++a"),
      createIncrementExpression("a", "++", true, "++a"),
      "百分比字面量"
    );
    expect.throwError(() => parseExpression("1||2??3"), `Expected $CatchOrNullExp$`, "错误提示");
    expect.throwError(() => parseExpression("1??2&&3"), `Expected $CatchOrNullExp$`, "错误提示");

    expect.same(
      parseExpression("1??(2&&3)"),
      createBinaryExpression(
        createLiteralExpression(1),
        "??",
        createBinaryExpression(
          createLiteralExpression(2),
          "&&",
          createLiteralExpression(3),
          "2&&3"
        ),
        "1??(2&&3)"
      ),
      "正确解析逻辑运算符"
    );
  });
  test("基本算法", (expect) => {
    const test = createScope();
    expect.evalWith(
      "((246 + 20) * 2 ^ 4 - 20 * 1 - 2) * 20",
      "((246 + 20) * Math.pow(2, 4) - 20 * 1 - 2) * 20",
      "计算表达式",
      test
    );
    expect.calc("-1-1", -2, "计算表达式", test);
    expect.calc("-1+-1", -2, "计算表达式", test);
    expect.calc("1+-1", 0, "计算表达式", test);
    expect.calc("-9*-9", 81, "计算表达式", test);
    expect.calc("9*-9", -81, "计算表达式", test);
    expect.calc("4%2", 0, "计算表达式", test);
    expect.calc("11%2", 1, "计算表达式", test);
    expect.calc("1 - 2 - 3", -4, "计算表达式", test);
    expect.calc("1 - (2 + 3)", -4, "计算表达式", test);
    expect.calc("1 - 2 + 3", 2, "计算表达式", test);
    expect.calc("2 ^ 3", 8, "计算表达式", test);
    expect.calc("2 ^ -0.5", Math.pow(2, -0.5), "计算表达式", test);
    expect.eval("null + null ?? 2", "计算表达式", test);
    expect.eval("null + (null ?? 2)", "计算表达式", test);
    expect.eval("0 / (null ?? 1)", "计算表达式", test);
    expect.eval("0 / null ?? 1", "计算表达式", test);
    expect.eval("1 / 2 + (null ?? 2)", "计算表达式", test);
    expect.eval("0 || 1 && 2", "计算表达式", test);
    expect.eval("1 / 2 + null ?? 2", "计算表达式", test);
    expect.eval("(1 || 2 + 1) ?? 1", "计算表达式", test);
    expect.eval("((1 || 2) + 1) ?? 1", "计算表达式", test);
  });
  test("管道语法", (expect) => {
    expect.baseTest("|", ExpressionKind.CallFunction, "缺省(函数)管道");
    expect.baseTest("|test a=1", ExpressionKind.CallMacro, "宏管道");
    expect.baseTest("|test(a, b)", ExpressionKind.CallFunction, "函数管道");
    expect.baseTest("@test a=1 b", ExpressionKind.CallMacro, "宏调用");
    expect.baseTest("@test(a, b)", ExpressionKind.CallFunction, "宏调用(函数语法)");
    expect.throwError(() => parseExpression("|="), `Expected $Exp$`, "表达式管道");
  });

  test("宏调用", (expect) => {
    expect.throwError(
      () => parseExpression("@command a=1 | #0x1234;"),
      `Expected $END$, $Exp$, $pipeExprBegin$, $validIdentifierPrefixChar$, or $CallExpression$`,
      "管道不应以字面量结尾"
    );
    expect.throwError(
      () => parseExpression("@command a=1 |0x1234;"),
      "Expected $END$ or $Exp$",
      "管道不应以字面量结尾"
    );
    expect.throwError(
      () => parseExpression("@command a=1 | 0x1234;"),
      `Expected $END$, $Exp$, $pipeExprBegin$, not $invalidIdentifier$, or $CallExpression$`,
      "管道不应以字面量结尾"
    );
    const { pipe } = parseExpression("@command a=1 |= 0x1234;") as CallMacroExpression;

    expect.same(
      pipe,
      createCallExpression(void 0, [createLiteralExpression(0x1234, "0x1234")]),
      "匿名管道表达式"
    );

    const data = parseExpression("@command a=1;") as CallMacroExpression;
    expect.truthy(data.kind === ExpressionKind.CallMacro, "应该是CallMacro表达式");
    expect.same(
      data,
      createCallMacroExpression(
        "command",
        {
          params: {
            a: createLiteralExpression(1),
          },
          flags: [],
        },
        "@command a=1;"
      )
    );
  });
  test("模板", (expect) => {
    const { pipe, ...data } = parseExpression("{{ $app | }}") as TemplateExpression;
    expect.throwError(
      () => parseExpression("{{ app | #_a123(123) }}"),
      `Expected $tmplEnd$, $pipeExprBegin$, $validIdentifierPrefixChar$, or $CallExpression$`,
      "管道不应以字面量结尾"
    );
    expect.truthy(data.kind === ExpressionKind.Template, "应该是模板表达式");
    expect.same(data, {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.Template,
      value: createVariableIdentifier("$", "app"),
      // kindName: "Template",
      sourceString: "{{ $app | }}",
    });
    const data2 = parseExpression("{{ app(123) }}") as TemplateExpression;

    expect.same(data2, {
      type: NodeTypeKind.Expression,
      kind: ExpressionKind.Template,
      value: createCallExpression("app", [createLiteralExpression(123, "123")], "app(123)"),
      // kindName: "Template",
      sourceString: "{{ app(123) }}",
    });
    expect.same(pipe, createCallExpression(), "管道语法解析正常");
  });
});
