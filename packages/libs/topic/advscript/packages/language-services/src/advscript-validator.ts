import { LangiumDocument, ValidationAcceptor, ValidationCheck, ValidationRegistry } from "langium";
import { CodeActionProvider } from "langium/lib/lsp/code-action";
import { template, camelCase } from "lodash";
import {
  CodeAction,
  CodeActionKind,
  CodeActionParams,
  Command,
  Diagnostic,
  Range,
} from "vscode-languageserver-protocol";
import { AdvscriptServices } from "./advscript-module";
import {
  AdvscriptAstType,
  Call,
  Character,
  CharactersDeclare,
  Macro,
  MacroDeclare,
  Param,
  MacroPipe,
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
      Character: validator.checkNameStartsWithUpper,
      Param: validator.checkNameStartsWithCapital,
      CharactersDeclare: validator.checkUniqueElementName,
      MacroDeclare: validator.checkUniqueElementName,
      Macro: validator.checkUniqueElementName,
      MacroPipe: validator.checkUniqueElementName,
      Call: validator.checkUniqueElementName,
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
  constructor(private services: AdvscriptServices) {}
  checkUniqueElementName = (
    grammar: CharactersDeclare | MacroPipe | MacroDeclare | Macro | Call,
    accept: ValidationAcceptor
  ) => {
    const ruleMap = new Map<string, true>();
    if (!grammar.elements?.length) return;
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
  checkNameStartsWithCapital(character: Macro | Param, accept: ValidationAcceptor): void {
    if (character.name) {
      const firstChar = character.name.text.substring(0, 1);
      if (firstChar?.toLowerCase() !== firstChar) {
        accept("warning", character.$type + " name should start with [a-z].", {
          node: character,
          property: "name",
          code: IssueCodes.identifierNameLowercase,
        });
      }
    }
  }
  checkNameStartsWithUpper(character: Character, accept: ValidationAcceptor): void {
    if (character.name) {
      const firstChar = character.name.text.substring(0, 1);
      if (firstChar?.toUpperCase() !== firstChar) {
        accept("warning", character.$type + " name should start with [A-Z].", {
          node: character.name,
          property: "text",
          code: IssueCodes.identifierNameUppercase,
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
      case IssueCodes.identifierNameUppercase:
        return this.makeUpperCase(diagnostic, document);
      default:
        return undefined;
    }
  }

  _makeUpperOrLowerCase(range: Range, document: LangiumDocument, type: "Upper" | "Lower") {
    const name = document.textDocument.getText(range);
    return this.services.lsp.RenameHandler.renameElement(document, {
      textDocument: document.textDocument,
      position: range.start,
      newName: name[0][`to${type}Case`]() + name.slice(1, name.length),
    });
  }

  private async makeLowerCase(diagnostic: Diagnostic, document: LangiumDocument) {
    return {
      title: "First letter to lower case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: await this._makeUpperOrLowerCase(diagnostic.range, document, "Lower"),
    } as CodeAction;
  }

  private async makeUpperCase(diagnostic: Diagnostic, document: LangiumDocument) {
    return {
      title: "First letter to upper case",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      isPreferred: true,
      edit: await this._makeUpperOrLowerCase(diagnostic.range, document, "Upper"),
    } as CodeAction;
  }
}
