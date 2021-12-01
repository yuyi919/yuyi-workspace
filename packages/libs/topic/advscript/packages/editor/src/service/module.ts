import {
  AdvscriptGeneratedModule,
  AdvscriptModule,
  AdvscriptServices,
} from "@yuyi919/advscript-language-services";
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
import { CancellationToken, Diagnostic, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { Monaco } from "../lib";
import { createDefaultModule } from "./adapter";
import * as OhmDcocument from "./document";

function createBrowerServices<T extends PartialLangiumServices>(
  module?: Module<LangiumServices, T>,
  context?: DefaultModuleContext
) {
  const defaultModule = createDefaultModule(context);
  return inject(
    defaultModule,
    AdvscriptGeneratedModule,
    merge(AdvscriptModule, module)
  ) as unknown as AdvscriptServices & T;
}

export interface ILSPModuleContext extends DefaultModuleContext {}

export function createLangiumServices(_monaco: typeof Monaco, context?: ILSPModuleContext) {
  class TextDocumentFactory extends DefaultTextDocumentFactory {
    TextDocuments: TextDocuments<OhmDcocument.OhmDcocument>;
    constructor(service: LangiumServices) {
      super(service);
      this.TextDocuments = service.documents
        .TextDocuments as TextDocuments<OhmDcocument.OhmDcocument>;
    }
    fromUri(uri: URI): TextDocument {
      console.log([...this.TextDocuments.keys(), uri.toString()]);
      return this.TextDocuments.get(uri.toString());
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
      // console.log(this.connection);
      if (this.connection) {
        console.log("diagnostics", document, diagnostics);
        // Send the computed diagnostics to VS Code.
        this.connection.sendDiagnostics({ uri: document.textDocument.uri, diagnostics });
      }
      document.state = DocumentState.Validated;
      return diagnostics;
    }
  }
  const services = createBrowerServices(
    {
      documents: {
        TextDocumentFactory: (injector) => new TextDocumentFactory(injector),
        DocumentBuilder: (injector) => new DocumentBuilder(injector),
        TextDocuments: () => new TextDocuments(OhmDcocument),
      },
      parser: {
        // LangiumParser: (inj) => new OhmParser(inj),
      },
    },
    context
  ) as AdvscriptServices;
  return services;
}
