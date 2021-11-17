import { ValidationAcceptor, ValidationCheck, ValidationRegistry } from "langium";
import { AdvscriptAstType, Character } from "./generated/ast";
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
    };
    this.register(checks, validator);
  }
}

/**
 * Implementation of custom validations.
 */
export class AdvscriptValidator {
  checkPersonStartsWithCapital(person: Character, accept: ValidationAcceptor): void {
    if (person.name) {
      const firstChar = person.name.substring(0, 1);
      if (firstChar?.toUpperCase() !== firstChar) {
        accept("warning", "Person name should start with a capital.", {
          node: person,
          property: "name",
        });
      }
    }
  }
}
