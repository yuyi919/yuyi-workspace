import {
  DefaultDocumentBuilder,
  DefaultModuleContext,
  DefaultTextDocumentFactory,
  DocumentState,
  inject,
  LangiumDocument,
  LangiumServices,
  Module,
  PartialLangiumServices,
} from "langium";
import { merge } from "lodash";
import ReconnectingWebSocket from "reconnecting-websocket";
import { CancellationToken, Diagnostic, TextDocuments, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { Monaco } from "../lib";
import { createDefaultModule, OhmParser } from "./adapter";
import { AdvscriptModule } from "./modules/advscript-module";
import { AdvscriptGeneratedModule } from "./modules/generated/module";

function createBrowerServices<T extends PartialLangiumServices>(
  module?: Module<LangiumServices, T>,
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

export interface ILSPModuleContext extends DefaultModuleContext {}

export function createLangiumServices(_monaco: typeof Monaco, context?: ILSPModuleContext) {
  class TextDocumentFactory extends DefaultTextDocumentFactory {
    fromUri(uri: URI): TextDocument {
      console.log([...textDocuments.keys(), uri.toString()]);
      return textDocuments.get(uri.toString());
    }
  }
  class DocumentBuilder extends DefaultDocumentBuilder {
    async validate(
      document: LangiumDocument,
      cancelToken = CancellationToken.None
    ): Promise<Diagnostic[]> {
      let diagnostics: Diagnostic[] = [];
      const validator = this.documentValidator;
      diagnostics = await validator.validateDocument(document, cancelToken);
      console.log(this.connection);
      if (this.connection) {
        console.log("diagnostics", document, diagnostics);
        // Send the computed diagnostics to VS Code.
        this.connection.sendDiagnostics({ uri: document.textDocument.uri, diagnostics });
      }
      document.state = DocumentState.Validated;
      return diagnostics;
    }
  }
  const textDocuments = new TextDocuments(TextDocument);
  const services = createBrowerServices(
    {
      documents: {
        TextDocumentFactory: (injector) => new TextDocumentFactory(injector),
        DocumentBuilder: (injector) => new DocumentBuilder(injector),
        TextDocuments: () => textDocuments,
      },
      parser: {
        // LangiumParser: (inj) => new OhmParser(inj),
      },
    },
    context
  ) as LangiumServices;
  return services;
}
