import {
  AstNode,
  createDefaultModule,
  DefaultJsonSerializer,
  DefaultModuleContext,
  inject,
  LangiumServices,
  Module,
  PartialLangiumServices,
} from "langium";
import { AstNodeLocator, AstNodeDescriptionProvider, HoverProvider } from "./advscript-provider";
import {
  AdvscriptCodeActionProvider,
  AdvscriptValidationRegistry,
  AdvscriptValidator,
} from "./advscript-validator";
import { createCustomParser, CustomParser } from "./CustomParser";
import { CustomTokenBuilder } from "./customTokens";
import { DocumentSemanticProvider } from "./DocumentSemanticProvider";
// import { OhmParser } from "./custom";
import { AdvscriptGeneratedModule } from "./generated/module";
import * as References from "./references";

/**
 * Declaration of custom services - add your own service classes here.
 */
export type AdvscriptAddedServices = {
  validation: {
    AdvscriptValidator: AdvscriptValidator;
  };
  parser: {
    TokenBuilder: CustomTokenBuilder;
    LangiumParser: CustomParser;
  };
  references: References.Providers;
  lsp: {
    HoverProvider: HoverProvider;
    CodeActionProvider: AdvscriptCodeActionProvider;
    DocumentSemanticProvider: DocumentSemanticProvider;
  };
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type AdvscriptServices = LangiumServices & AdvscriptAddedServices;

class JsonSerializer extends DefaultJsonSerializer {
  serialize(node: AstNode, space?: string | number): string {
    try {
      return super.serialize(node, space);
    } catch (error) {
      return "<node:" + node.$type + ">";
    }
  }
}
/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const AdvscriptModule: Module<
  AdvscriptServices,
  PartialLangiumServices & AdvscriptAddedServices
> = {
  validation: {
    ValidationRegistry: (injector) => new AdvscriptValidationRegistry(injector),
    AdvscriptValidator: (injector) => new AdvscriptValidator(injector),
  },
  references: {
    Linker: (injector) => new References.Linker(injector),
    ScopeComputation: (injector) => new References.ScopeComputation(injector),
    NameProvider: (injector) => new References.NameProvider(injector),
    ScopeProvider: (i) => new References.AdvscriptScopeProvider(i),
    References: (s) => new References.References(s),
  },
  index: {
    AstNodeLocator: () => new AstNodeLocator(),
    AstNodeDescriptionProvider: (injector) => new AstNodeDescriptionProvider(injector),
  },
  serializer: {
    JsonSerializer: (i) => new JsonSerializer(i),
  },
  // parser: {
  //     LangiumParser: (service) => new OhmParser(service) as any,
  // },
  parser: {
    TokenBuilder: () => new CustomTokenBuilder(),
    LangiumParser: (services) => createCustomParser(services),
  },
  lsp: {
    HoverProvider: (service) => new HoverProvider(service),
    CodeActionProvider: (service) => new AdvscriptCodeActionProvider(service),
    DocumentSemanticProvider: (service) => new DocumentSemanticProvider(service),
  },
};
/**
 * Inject the full set of language services by merging three modules:
 *  - Langium default services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 */
export function createAdvscriptServices(context?: DefaultModuleContext): AdvscriptServices {
  return inject(createDefaultModule(context), AdvscriptGeneratedModule, AdvscriptModule);
}
