import {
  inject,
  DefaultModuleContext,
  Module,
  LangiumServices,
  PartialLangiumServices,
} from "langium";
import { merge } from "lodash";
import { createDefaultModule } from "./adapter";
import { AdvscriptModule } from "./modules/advscript-module";
import { AdvscriptGeneratedModule } from "./modules/generated/module";

export function createBrowerServices<T extends Module<LangiumServices, PartialLangiumServices>>(
  module?: T,
  context?: DefaultModuleContext
) {
  // const AdvscriptModule: Module<LangiumServices, PartialLangiumServices> = {
  //   // validation: {
  //   //     ValidationRegistry: (injector) =>
  //   //         new AdvscriptValidationRegistry(injector),
  //   //     AdvscriptValidator: () => new AdvscriptValidator(),
  //   // },
  //   parser: {
  //     LangiumParser: (service) => new OhmParser(service) as any,
  //   },
  //   Grammar: {
  //     rules: () => [],
  //   },
  //   lsp: {
  //     HoverProvider: (service) => new HoverProvider(service),
  //   },
  // };
  const defaultModule = createDefaultModule(context);
  return inject(
    defaultModule,
    AdvscriptGeneratedModule,
    merge(AdvscriptModule, module)
  ) as unknown as LangiumServices & T;
}
