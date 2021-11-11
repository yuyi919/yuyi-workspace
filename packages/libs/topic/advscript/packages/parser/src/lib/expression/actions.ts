import { Base } from "../actions/base";
import { assignNode, toSource } from "../actions/_util";
import {
  CallExpression,
  CallMacroExpression,
  createCallExpression,
  createCallMacroExpression,
  defineExpressionActions,
  ExpressionNodeData,
  MacroMeta,
  Node,
  TemplateExpression,
} from "../interface";
import { Exp } from "./Exp";
import {
  CallMacroExpressionNode,
  Expression,
  ExpressionNode,
  TemplateExpressionNode,
} from "./Expression";
import { Keyvalue } from "./keyvalue";

// const semantics = grammar.createSemantics();

export const ExpressionActions = defineExpressionActions({
  ...Exp,
  ...Expression,
  ...Keyvalue,
  ...Base,
  Statement(node) {
    return assignNode(node.parse(), {}, toSource(node)) as ExpressionNodeData;
  },
  Statement_Exp(exp, end) {
    return exp.parse();
  },
  Statement_Macro(_, command: CallMacroExpressionNode, pipe, $) {
    return assignNode(command.parse(), {
      pipe: pipe.parse(),
    });
  },
  Statement_Inline(template: TemplateExpressionNode, end): TemplateExpression {
    return template.parse();
  },
  Statement_Pipe(pipe, end) {
    return pipe.parse();
  },
  Statement_AnonymousPipe(pipe, end) {
    return pipe.parse();
  },
  Macro_Pipe_Call(awesome, commandNode: CallMacroExpressionNode) {
    return commandNode.parse() || awesome.parse();
  },
  Macro_Pipe_Expr(awesome, _equal, exprNode: ExpressionNode): CallExpression {
    return assignNode(awesome.parse(), {
      argumentList: [exprNode.parse()],
    });
  },
  pipeFlag(_): CallExpression {
    return createCallExpression();
  },
  Macro_Call(commandNode: CallMacroExpressionNode) {
    return commandNode.parse();
  },
  End(_) {
    return void 0;
  },
  exprEnd(_) {
    return void 0;
  },
  Macro_Call_Expr(commandNode, paramsNode: Node<MacroMeta>): CallMacroExpression {
    const params = paramsNode.parse() || {};
    return createCallMacroExpression(
      commandNode.parse(),
      params,
      toSource(commandNode, paramsNode)
    );
  },
});
