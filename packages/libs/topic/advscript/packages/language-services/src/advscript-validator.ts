import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from "langium";
import { template, camelCase } from "lodash";
import { AdvscriptServices } from "./advscript-module";
import * as ast from "./ast";

/**
 * Map AST node types to validation checks.
 */
type AdvscriptChecks = {
  [type in ast.AdvscriptAstType]?: ValidationCheck | ValidationCheck[];
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
    grammar: ast.CharactersDeclare | ast.MacroPipe | ast.MacroDeclare | ast.Macro | ast.CallMacro,
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
  checkNameStartsWithCapital(character: ast.Macro | ast.Param, accept: ValidationAcceptor): void {
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
  checkNameStartsWithUpper(character: ast.Character, accept: ValidationAcceptor): void {
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


