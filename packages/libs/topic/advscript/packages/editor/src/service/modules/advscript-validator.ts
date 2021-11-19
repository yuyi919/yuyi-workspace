import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from "langium";
import {
  Param,
  isCharactersDeclare,
  isMacroDeclare,
  Macro,
  isParam,
  isMacro,
  AdvscriptAstType,
  Character,
} from "./generated/ast";
import { AdvscriptServices } from "./advscript-module";

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
      Character: validator.checkPersonStartsWithCapital,
      Param: validator.checkPersonStartsWithCapital,
      Macro: validator.checkPersonStartsWithCapital,
    };
    this.register(checks, validator);
  }
}

/**
 * Implementation of custom validations.
 */
export class AdvscriptValidator {
  checkPersonStartsWithCapital(
    character: Character | Macro | Param,
    accept: ValidationAcceptor
  ): void {
    if (character.name) {
      if (isCharactersDeclare(character.$container)) {
        const filters = character.$container.elements.filter((o) => o.name === character.name);
        if (filters?.length > 1) {
          accept("warning", character.$type + " 必须为唯一键.", {
            node: character,
            property: "name",
            index: character.$container.elements.indexOf(filters[filters.length - 1]),
          });
        }
      } else if (isMacroDeclare(character.$container)) {
        const filters = character.$container.elements.filter((o) => o.name === character.name);
        if (filters?.length > 1) {
          accept("warning", character.$type + " 必须为唯一键.", {
            node: character.$container,
            property: "elements",
            index: character.$container.elements.indexOf(filters[0]),
          });
          console.log(character.$container.elements.indexOf(filters[0]));
        }
      }
      const firstChar = character.name.substring(0, 1);
      if (firstChar?.toLowerCase() !== firstChar) {
        accept("warning", character.$type + " name should start with [a-z].", {
          node: character,
          property: "name",
        });
      }
    }
  }
}
