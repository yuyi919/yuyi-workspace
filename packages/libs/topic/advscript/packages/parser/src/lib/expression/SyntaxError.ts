import { getRealLength } from "../actions/_util";

export class SyntaxError extends Error {
  name = "SyntaxError";

  constructor(e: Error | string, template?: Record<string, any>) {
    super();
    const isErr = typeof e !== "string";
    const message = isErr ? e.message : e;
    if (template) {
      this.message = this.transformMessage(message, template);
    } else {
      this.message = message;
    }
    if (isErr) {
      const stack = e.stack
        .split("\n")
        .filter((e) => e.trimStart().startsWith("at"))
        .join("\n");
      // console.error(stack);
      this.stack = this.name + "\n" + this.message + "\n" + stack;
    }
  }
  transformKeyword(m: string, template: Record<string, any>) {
    switch (m) {
      case MessageTemplate.End:
        return;
      default:
        return (
          template[m] ||
          m
            .replace(/(\$(.+?)\$)/g, (_, key, content) =>
              template[key] ? this.transformKeyword(template[key], template) : `${content}`
            )
            .replace(/^not (.+)/, `${template[MessageTemplate.Not] ?? NotKeyword} - ($1)`)
            .replaceAll("[", " - (")
            .replaceAll("]", ")")
        );
    }
  }
  transformMessage(source: string, template: Record<string, any>) {
    const [start, message] = source.split(ExpectedKeyword);
    const msgs = message
      .split(/, +or +|,| +or +/g)
      .map((value) => this.transformKeyword(value.trim(), template))
      .filter(Boolean);
    // console.log(message, msgs);
    const msg =
      msgs.length > 0
        ? msgs.filter((msg) => msg !== template[MessageTemplate.Exp] && msg !== ExpKeyword).length >
          0
          ? msgs
              .join(msgs.length === 2 ? " 或 " : "、")
              .replace(/^(.+)$/, template[MessageTemplate.Expected] ?? ExpectedKeyword + ": $1")
          : template[MessageTemplate.ExpectedExp] ?? ExpectedExpKeyword
        : template[MessageTemplate.ExpectedEndOfInput] ?? ExpectedEndOfInputKeyword;
    return start + msg + `\n${" ".repeat(getRealLength(msg))}    ——鲁迅`;
  }
}
const ExpectedKeyword = "Expected";
const ExpectedEndOfInputKeyword = "Unexpected end of input";
const ExpectedExpKeyword = "Unexpected expression syntax";
const NotKeyword = "not";
const ExpKeyword = "Exp";
export const MessageTemplate = {
  Not: "$Not$",
  ExpectedEndOfInput: "$ExpectedEndOfInput$",
  Expected: "$Expected$",
  End: "$END$",
  Exp: "$Exp$",
  ExpectedExp: "$ExpectedExp$",
} as const;

export const Zh_CN = {
  $validIdentifierChar$: `合法的标识字符 - ([a-zA-Z0-9_$]+)`,
  $invalidIdentifierChar$: "非法的标识字符",
  $validIdentifierPrefixChar$: `合法的标识符前缀`,
  $invalidIdentifier$: `混淆的标识符 - ($numberical$、$boolean$)`,
  $numberical$: `纯数字`,
  $boolean$: `布尔值`,
  $identifier$: "合法的标识符",

  $variableName$: "合法的变量名",
  $variableNamePrefix$: `变量名前缀 - ($ | %)`,

  [MessageTemplate.Exp]: "正确的表达式",
  $macroBegin$: `宏调用标志符 - "@"`,
  $pipeFlag$: `管道标志符 - "|"`,
  $pipeExprBegin$: `管道表达式前缀 - "="`,
  $CallExpression$: "函数调用表达式",
  $tmplBegin$: `模板表达式头 - "{{"`,
  $tmplEnd$: `模板表达式尾 - "}}"`,
  $spicalChar$: "特殊字符",
  $CatchOrNullExp$: `逻辑运算符 ("&&" | "||") 和 非空运算符 ("??") 一起使用时必须使用括号`,
  $literal$: "字面量",
  [MessageTemplate.Expected]: "预期的输入：$1",
  [MessageTemplate.ExpectedExp]: "正确的语法救不了中国人",
  [MessageTemplate.ExpectedEndOfInput]: "学语法救不了中国人",
  [MessageTemplate.Not]: "不能是",
};
