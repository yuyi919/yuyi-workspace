import { parseExpression } from "../expression";
import {
  CallExpression,
  CallMacroExpression,
  ContentLine,
  createCallExpression,
  createCallExpressionWith,
  createContentLine,
  createContentRaw,
  createEmptyLine,
  createExprTemplate,
  createInlineMacro,
  createLabelTemplate,
  createLines,
  createStyledContent,
  defineActions,
  DocumentLine,
  LabelRaw,
  Node,
  StoryMacro,
  StyledRaw,
  TemplateExpression,
} from "../interface";
import { assignNode, toSource } from "./_util";

export type MacroExpressionNode = Node<StoryMacro>;
export type AwesomeExpressionData = string & {};
export type AwesomeExpressionNode = Node<AwesomeExpressionData>;

export function getCtorName(node: Node<any>) {
  const name = node.ctorName;
  if (name === "lineOf") {
    return name + `<${node.children[0].ctorName}>`;
  }
  return name;
}

export const StoryLine = defineActions<ContentLine>({
  // textSyntax_plain(prefix, text, pipe: MacroExpressionNode, space) {
  //   // console.log("textSyntax_plain", text.parse());
  //   return createContentLine("text", [text.parse()], pipe.parse(), toSource(prefix, text, pipe));
  // },
  textSyntax_dialogue(prefix, action, text, pipe: MacroExpressionNode) {
    // console.log("textSyntax_dialogue");
    // console.log("textSyntax_line", expr.parse(), expr.ctorName, pipe.parse());
    return createContentLine(
      "text:dialogue",
      [text.parse()],
      pipe.parse(),
      toSource(prefix, text, pipe)
    );
  },
  textSyntax_action(prefix, text, pipe: MacroExpressionNode) {
    // console.log("textSyntax_action", { source: prefix.sourceString }, text.parse());
    // console.log("textSyntax_line", expr.parse(), expr.ctorName, pipe.parse());
    return createContentLine(
      "text:action",
      [text.parse()],
      pipe.parse(),
      toSource(prefix, text, pipe)
    );
  },
  command_macro(command: MacroExpressionNode) {
    const commandData = command.parse();
    // console.log(commandData);
    const { name, ...other } = commandData;
    return createContentLine(name, other.argumentList, other.pipe, toSource(command));
  },
  // command_centered(_flag, text, _flag2) {
  //   const textContent = text.parse();
  //   return createContentLine("center", [textContent], null, toSource(_flag, text, _flag2));
  // },
  // action_centered(_flag, text, _flag2) {
  //   const textContent = text.parse();
  //   return createContentLine("center", [textContent], null, toSource(_flag, text, _flag2));
  // },
  command_transition(_flag, text, pipe) {
    const textContent = text.parse();
    // pipe.parserContext.addInlayHint(":@transition", "post", toSource(_flag, text, pipe));
    return createContentLine(
      "transition",
      [textContent],
      pipe.parse(),
      toSource(_flag, text, pipe)
    );
  },
  textSyntax_space(spaces) {
    return createContentLine("text:space", [], null, toSource(spaces));
  },
  dialogue_end(node) {
    node.parserContext.addInlayHint(":dialogue_end", "pre", toSource(node));
    return node.parse();
  },
  action_end(block) {
    block.parserContext.addInlayHint(":action_end", "pre", toSource(block));
    return block.parse();
  },
  character_call(name, macro: Node<StoryMacro>) {
    macro.parserContext.addInlayHint(":dialogue_begin", "post", toSource(macro));
    return createContentLine("character", [name.parse()], macro.parse(), toSource(name, macro));
  },
  action_start(node) {
    node.parserContext.addInlayHint(":action_begin", "post", toSource(node));
    if (node.child(0).ctorName === "textSyntax_space") {
      node.parserContext.addInlayHint(":space x" + node.children.length, "post", toSource(node));
    }
    return node.parse();
  },
  action_content(node) {
    if (node.ctorName === "textSyntax_space") {
      node.parserContext.addInlayHint(
        ":action_space x" + node.child(0).children.length,
        "post",
        toSource(node)
      );
    }
    return node.parse();
  },
  dialogue_content(node) {
    const data = node.parse();
    if (node.ctorName === "textSyntax_space") {
      node.parserContext.addInlayHint(
        ":space x" + node.child(0).children.length,
        "post",
        toSource(node)
      );
    }
    return data;
  },
  dialogue_action(macro: MacroExpressionNode) {
    macro.parserContext.addInlayHint(":@dialogue_action", "post", toSource(macro));
    return createContentLine("character-action", [macro.parse()], null, toSource(macro));
  },
  command_pageBreak(content) {
    return createContentLine("pageBreak", [], null, toSource(content));
  },
  command(content) {
    content.parserContext.addInlayHint(":@" + content.ctorName, "post", toSource(content));
    return content.parse();
  },
});

export const Expr = defineActions<any>({
  errorBoundary(e) {
    if (e.ctorName === "ignoreError") {
      return e.parse();
    }
    // console.log(e.parse(), e)
    return {
      source: e.parse(),
      error: e.ctorName,
    };
  },
  // statmentOf(padLine, pad, content, end, padline2) {
  //   return content.parse();
  // },
  // startStatmentOf(padLine, content, end, padline2) {
  //   return content.parse();
  // },
  nonemptyBlockOf(startLine: Node<DocumentLine>, linesNode: Node<DocumentLine[]>, end) {
    const data = startLine.parse();
    const lines = linesNode.parse() || [];
    if (lines?.length > 0)
      return createLines([data, ...lines, end.parse()], toSource(startLine, linesNode, end));
    return data;
  },
  emptyLine(space) {
    return createEmptyLine(toSource(space));
  },
  blockEnd(a, end) {
    // return createEmptyLine(toSource(end));
    return createContentLine("end", [], null, toSource(end));
  },
  blockEndOf(end) {
    // end.parserContext.addInlayHint(":blockEnd", "post", toSource(end.child(0)))
    // return createEmptyLine(toSource(end));
    return createContentLine("end", [], null, toSource(end));
  },
  linesOf(nodes) {
    return createLines(nodes.parse(), toSource(nodes));
  },
  syntaxBlockOf(startLine, linesNode, end) {
    const data = startLine.parse();
    const lines = linesNode.parse() || [];
    return createLines([data, ...lines].filter(Boolean), toSource(startLine, linesNode, end));
  },
  contentBlockOf(startLine, linesNode, end) {
    const data = startLine.parse();
    const lines = linesNode.parse() || [];
    return createLines(
      [data, ...lines, end.parse()].filter(Boolean),
      toSource(startLine, linesNode, end)
    );
  },
  character_call_macro(text: Node<string>, command: MacroExpressionNode): StoryMacro {
    return assignNode(command.parse(), {
      text: text.parse(),
      source: toSource(text, command),
    });
  },
  macro(expression): StoryMacro {
    const data = parseExpression(`@${expression.parse()};`) as CallMacroExpression | CallExpression;
    return createCallExpressionWith(data, toSource(expression));
  },
  // plainTextOf(text) {
  //   // console.log(text.parse())
  //   return text.parse();
  // },
  // plainText(raw, end) {
  //   return createContentRaw([raw.parse(), end.parse()].filter(Boolean), toSource(raw, end));
  // },
  rawOf(text) {
    return createContentRaw(text.parse(), toSource(text));
  },
  withText(content) {
    return createStyledContent(content.parse(), null, toSource(content));
  },
  styled_centered(start, content, end) {
    // console.log("centered", content.parse());
    return createCenteredAction(content, start, end);
  },
  // centeredContent_esc(start, content) {
  //   return createStyledContent([start.parse(), content.parse()], null, toSource(start, content));
  // },
  styled_italic(start, content, end): StyledRaw {
    const valid = end.parse();
    // console.log(valid, valid ? content.parse() : [start.parse(), content.parse()]);
    // printError(createNodeError("测试", content));
    return createStyledContent(
      valid ? content.parse() : [start.parse(), content.parse()],
      valid ? "italic" : null,
      toSource(start, content, end)
    );
  },
  styled_bold(start, content, end): StyledRaw {
    const valid = end.parse();
    return createStyledContent(
      valid ? content.parse() : [start.parse(), content.parse()],
      valid ? "bold" : null,
      toSource(start, content, end)
    );
  },
  styled_underline(start, content, end): StyledRaw {
    const valid = end.parse();
    // console.log(valid ? content.parse() : [start.parse(), content.parse()]);
    return createStyledContent(
      valid ? content.parse() : [start.parse(), content.parse()],
      valid ? "underline" : null,
      toSource(start, content, end)
    );
  },
  // styled_raw1(s, content, end) {
  //   return createStyledContent([content.parse(), end.parse()], null, toSource(content, end));
  // },
  // styled_raw2(s, content, end) {
  //   return createStyledContent([content.parse(), end.parse()], null, toSource(content, end));
  // },
  // styled_fix(start, content, end) {
  //   const data = content.parse();
  //   const source = toSource(start, content, end);
  //   return data
  //     ? createStyledContent(
  //         [
  //           start.parse().replace(/\*$/, ""),
  //           createStyledContent(data, "italic", toSource(content)),
  //         ],
  //         null,
  //         source
  //       )
  //     : createContentRaw(start.sourceString + end.sourceString, source);
  // },
  template_macro(node) {
    return createInlineMacro(node.parse(), toSource(node));
  },
  template_label(
    text: AwesomeExpressionNode,
    expr_auto: Node<CallMacroExpression | CallExpression>
  ): LabelRaw {
    return createLabelTemplate(text.parse(), expr_auto.parse(), toSource(text, expr_auto));
  },
  template_native(expr_template: Node<TemplateExpression>) {
    // console.log(data);
    return createExprTemplate(expr_template.parse(), toSource(expr_template));
  },
});
const InlineExpr = defineActions({
  expr_pipe(_, text) {
    try {
      return parseExpression(`|${text.sourceString}`) as unknown as CallMacroExpression;
    } catch (error) {
      console.warn(error);
      return parseExpression(`|=${text.sourceString}`) as unknown as CallExpression;
    }
  },
  expr_logic(expression: AwesomeExpressionNode) {
    return parseExpression(`(${expression.parse()})`);
  },
  expr_template(text: AwesomeExpressionNode) {
    return parseExpression(`{{${text.parse()}}}`) as TemplateExpression;
  },
  expr_auto(text: AwesomeExpressionNode) {
    try {
      // console.log(text.parseExpression)
      return parseExpression(`@${text.sourceString};`) as unknown as CallMacroExpression;
    } catch (error) {
      console.warn(error);
      return createCallExpression("link", [text.sourceString], toSource(text));
    }
  },
});

const AwesomeContent = defineActions<AwesomeExpressionData>({
  // awesome_a(start, content, end) {
  //   return toSourceString(start, content, end);
  // },
  // awesome_b(start, content, end) {
  //   return toSourceString(start, content, end);
  // },
  // awesome_c(start, content, end) {
  //   return toSourceString(start, content, end);
  // },
});

export const Story = {
  ...AwesomeContent,
  ...InlineExpr,
  ...Expr,
  ...StoryLine,
};
function createCenteredAction(content, start, end): any {
  return createStyledContent(content.parse(), "centered", toSource(start, content, end));
}
