import { LangiumDocument, ValidationAcceptor, ValidationCheck, ValidationRegistry } from "langium";
import { CodeActionProvider } from "langium/lib/lsp/code-action";
import { template } from "lodash";
import { CodeAction, CodeActionKind, CodeActionParams, Command, Diagnostic } from "vscode-languageserver-protocol";
import { AdvscriptServices } from "./advscript-module";
import {
  AdvscriptAstType,
  Call,
  Character,
  CharactersDeclare,
  Macro,
  MacroDeclare,
  Param
} from "./generated/ast";

/**
 * Map AST node types to validation checks.
 */
type AdvscriptChecks = {
  [type in AdvscriptAstType]?: ValidationCheck | ValidationCheck[];
};

/**
 * Registry for validation checks.
 */
export class AdvscriptValidationRegistry extends ValidationRegistry {
  constructor(services: AdvscriptServices) {
    super(services);
    const validator = services.validation.AdvscriptValidator;
    const checks: AdvscriptChecks = {
      Character: validator.checkNameStartsWithCapital,
      Param: validator.checkNameStartsWithCapital,
      CharactersDeclare: validator.checkUniqueElementName,
      MacroDeclare: validator.checkUniqueElementName,
      Macro: validator.checkUniqueElementName,
      Call: validator.checkUniqueElementName,
    };
    this.register(checks, validator);
  }
}

export namespace IssueCodes {
  export const identifierNameLowercase = "identifier-name-lowercase-first";
}
/**
 * Implementation of custom validations.
 */
export class AdvscriptValidator {
  constructor(private services: AdvscriptServices) {}
  checkUniqueElementName = (
    grammar: CharactersDeclare | MacroDeclare | Macro | Call,
    accept: ValidationAcceptor
  ) => {
    const ruleMap = new Map<string, true>();
    const message = template("A ${$type}'s name has to be unique.");
    for (const elm of grammar.elements) {
      const lowerCaseName = this.services.references.NameProvider.getName(elm)?.toLowerCase();
      if (lowerCaseName) {
        if (ruleMap.has(lowerCaseName)) {
          accept("error", message(elm), { node: elm });
        } else {
          ruleMap.set(lowerCaseName, true);
        }
      }
    }
  };
  checkNameStartsWithCapital(
    character: Character | Macro | Param,
    accept: ValidationAcceptor
  ): void {
    if (character.name) {
      const firstChar = character.name.substring(0, 1);
      if (firstChar?.toLowerCase() !== firstChar) {
        accept("warning", character.$type + " name should start with [a-z].", {
          node: character,
          property: "name",
          code: IssueCodes.identifierNameLowercase,
        });
      }
    }
  }
}

export class AdvscriptCodeActionProvider implements CodeActionProvider {
  constructor(private services: AdvscriptServices) {}
  async getCodeActions(document: LangiumDocument, params: CodeActionParams) {
    const result: (Command | CodeAction)[] = [];
    for (const diagnostic of params.context.diagnostics) {
      const codeAction = await this.createCodeAction(diagnostic, document);
      if (codeAction) {
        result.push(codeAction);
      }
    }
    return result;
  }
  private createCodeAction(diagnostic: Diagnostic, document: LangiumDocument) {
    switch (diagnostic.code) {
      case IssueCodes.identifierNameLowercase:
        return this.makeLowerCase(diagnostic, document);
      default:
        return undefined;
    }
  }
  private async makeLowerCase(diagnostic: Diagnostic, document: LangiumDocument) {
    const range = {
      start: diagnostic.range.start,
      end: {
        line: diagnostic.range.end.line,
        character: diagnostic.range.end.character,
      },
    };
    return {
      title: "First letter to lower case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: await this.services.lsp.RenameHandler.renameElement(document, {
        textDocument: document.textDocument,
        position: diagnostic.range.start,
        newName: document.textDocument.getText(range).toLowerCase(),
      }),
    } as CodeAction;
  }
}
