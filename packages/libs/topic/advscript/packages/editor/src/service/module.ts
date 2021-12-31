import {
  AdvscriptGeneratedModule,
  AdvScriptGeneratedSharedModule,
  AdvscriptModule,
} from "@yuyi919/advscript-language-services";
import {
  inject,
  createDefaultModule,
  DeepPartial,
  DefaultDocumentBuilder,
  DefaultTextDocumentFactory,
  DocumentState,
  LangiumDocument,
  LangiumServices,
  LangiumSharedServices,
  Module,
  createDefaultSharedModule,
  DefaultSharedModuleContext as SharedModuleContext,
} from "langium";
import { CancellationToken, Diagnostic, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import type { Monaco } from "../lib/monaco.export";
import { IncrementLangiumDocumentFactory } from "./adapter";
import * as OhmDcocument from "./document";

function createBrowerServices<T extends DeepPartial<LangiumSharedServices>>(
  module?: Module<LangiumSharedServices, T>,
  context?: SharedModuleContext
) {
  const shared = inject(createDefaultSharedModule(context), {
    ...AdvScriptGeneratedSharedModule,
    ...module,
  });
  const advscript = inject(
    createDefaultModule({ shared }),
    AdvscriptGeneratedModule,
    AdvscriptModule
  );
  shared.ServiceRegistry.register(advscript);
  return { shared, advscript };
  // const defaultModule = createDefaultModule(context);
  // return injectService(
  //   createDefaultSharedModule(context),
  //   { ...AdvScriptGeneratedSharedModule, ...module },
  //   {
  //     generated: AdvscriptGeneratedModule,
  //     module: AdvscriptModule,
  //   }
  // );
  // return inject(
  //   defaultModule,
  //   AdvscriptGeneratedModule,
  //   merge(AdvscriptModule, module)
  // ) as unknown as AdvScriptServices & T;
}

export interface ILSPModuleContext extends SharedModuleContext {}

export function createLangiumServices(_monaco: typeof Monaco, context?: ILSPModuleContext) {
  class TextDocumentFactory extends DefaultTextDocumentFactory {
    TextDocuments: TextDocuments<OhmDcocument.OhmDcocument>;
    constructor(service: LangiumServices["shared"]) {
      super(service);
      this.TextDocuments = service.workspace
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
      const validator = this.serviceRegistry.getServices(document.uri).validation.DocumentValidator;
      diagnostics = await validator.validateDocument(document, cancelToken);
      // console.log(this.connection);
      if (this.connection) {
        // console.log("diagnostics", document, diagnostics);
        // Send the computed diagnostics to VS Code.
        this.connection.sendDiagnostics({ uri: document.textDocument.uri, diagnostics });
      }
      document.state = DocumentState.Validated;
      return diagnostics;
    }

    protected async buildDocuments(
      documents: LangiumDocument[],
      cancelToken: CancellationToken
    ): Promise<void> {
      await this.indexManager.update(
        documents.filter((e) => e.state < DocumentState.Indexed),
        cancelToken
      );
      await this.runCancelable(documents, DocumentState.Processed, cancelToken, (doc) =>
        this.process(doc, cancelToken)
      );
      await this.runCancelable(documents, DocumentState.Linked, cancelToken, (doc) => {
        const linker = this.serviceRegistry.getServices(doc.uri).references.Linker;
        return linker.link(doc, cancelToken);
      });
      await this.runCancelable(documents, DocumentState.Validated, cancelToken, (doc) =>
        this.validate(doc, cancelToken)
      );
    }
  }
  const services = createBrowerServices(
    {
      workspace: {
        TextDocumentFactory: (injector) => new TextDocumentFactory(injector),
        DocumentBuilder: (injector) => new DocumentBuilder(injector),
        TextDocuments: () => new TextDocuments(OhmDcocument),
        LangiumDocumentFactory: (injector) => new IncrementLangiumDocumentFactory(injector),
      },
    },
    context
  );
  return services.shared;
}
