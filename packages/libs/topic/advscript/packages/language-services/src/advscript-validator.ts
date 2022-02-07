import {
  AstNode,
  DiagnosticInfo,
  getDocument,
  ValidationAcceptor,
  ValidationCheck,
  ValidationRegistry,
} from "langium";
import { template, camelCase } from "lodash";
import { DiagnosticRelatedInformation, DiagnosticTag } from "vscode-languageserver-protocol";
import { AdvScriptServices } from "./advscript-module";
import * as ast from "./ast-utils";

/**
 * Map AST node types to validation checks.
 */
type AdvscriptChecks = {
  [type in ast.AdvScriptAstType]?: ValidationCheck | ValidationCheck[];
};

/**
 * Registry for validation checks.
 */
export class AdvscriptValidationRegistry extends ValidationRegistry {
  constructor(services: AdvScriptServices) {
    super(services);
    const validator = services.validation.AdvscriptValidator;
    const checks: AdvscriptChecks = {
      Character: validator.checkNameStartsWithUpper,
      Param: validator.checkNameStartsWithCapital,
      CharactersDeclare: validator.checkUniqueElementName,
      MacroDeclare: validator.checkUniqueElementName,
      Dialog: validator.checkUniqueElementName,
      Macro: validator.checkUniqueElementName,
      MacroPipe: validator.checkUniqueElementName,
      Call: validator.checkUniqueElementName,
      List: [validator.checkUniqueElementName],
      RefExpression: [
        (node: ast.RefExpression, accept) => {
          const { ref } = node.ref || {};
          if (ref) {
            if (ast.isVariable(node.$container) && node.$container === ref) {
              accept("error", "变量初始值不能引用自身", {
                node: node,
                property: "ref",
              });
            }
            const target = ref.$cstNode.range.start,
              source = node.$cstNode.range.start;
            if (
              target.line > source.line ||
              (target.line === source.line && target.character > source.character)
            ) {
              accept("error", "不能使用未定义的参数", {
                node: node,
                property: "ref",
              });
            }
          }
        },
      ],
    };
    this.register(checks, validator);
  }
}

export namespace IssueCodes {
  export const identifierNameLowercase = "identifier-name-lowercase-first";
  export const identifierNameUppercase = "identifier-name-uppercase-first";
}
/**
 * Implementation of custom validations.
 */
export class AdvscriptValidator {
  constructor(private services: AdvScriptServices) {}
  checkUniqueElementName = (
    grammar:
      | ast.CharactersDeclare
      | ast.MacroPipe
      | ast.MacroDeclare
      | ast.Macro
      | ast.CallMacro
      | ast.List
      | ast.Dialog,
    accept: ValidationAcceptor
  ) => {
    const ruleMap = new Map<string, true>();
    const elements = [
      ...(grammar.elements || []),
      ...(ast.isMacro(grammar) || ast.isDialog(grammar) ? grammar.modifiers?.elements || [] : []),
    ];
    if (!elements?.length) return;
    const tmpl = template("A ${$type}'s name has to be unique.");
    const relatedInformation: DiagnosticRelatedInformation[] = [];
    const messages = [] as {
      severity: "error" | "warning" | "info" | "hint";
      message: string;
      info: DiagnosticInfo<AstNode>;
    }[];
    for (const elm of elements) {
      const lowerCaseName = this.services.references.NameProvider.getName(elm)?.toLowerCase();
      if (lowerCaseName) {
        if (ruleMap.has(lowerCaseName)) {
          const range = this.services.references.NameProvider.getNameNode(elm).range;
          const message = tmpl(elm);
          messages.push({
            severity: "warning",
            message,
            info: {
              node: elm,
              range,
              tags: [DiagnosticTag.Unnecessary],
            },
          });
          relatedInformation.push({
            location: {
              range,
              uri: getDocument(elm).uri.toString(),
            },
            message,
          });
        } else {
          ruleMap.set(lowerCaseName, true);
        }
      }
    }
    for (const { severity, message, info } of messages) {
      accept(severity, message, {
        ...info,
        relatedInformation: relatedInformation.filter((o) => o.location.range !== info.range),
      });
    }
  };
  checkNameStartsWithCapital(target: ast.Macro | ast.Param, accept: ValidationAcceptor): void {
    if (target.name) {
      const firstChar = target.name.text.substring(0, 1);
      if (firstChar?.toLowerCase() !== firstChar) {
        accept("warning", target.$type + " name should start with [a-z].", {
          node: target,
          property: "name",
          code: IssueCodes.identifierNameLowercase,
        });
      }
    }
  }
  checkNameStartsWithUpper(target: ast.Character, accept: ValidationAcceptor): void {
    if (target.name) {
      const firstChar = target.name.text.substring(0, 1);
      if (firstChar?.toUpperCase() !== firstChar) {
        accept("warning", target.$type + " name should start with [A-Z].", {
          node: target.name,
          property: "text",
          code: IssueCodes.identifierNameUppercase,
        });
      }
    }
  }
}
