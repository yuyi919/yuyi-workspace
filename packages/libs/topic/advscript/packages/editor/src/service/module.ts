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
import { CancellationToken, Diagnostic, TextDocuments } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { Monaco } from "../editor";
import { createDefaultModule } from "./adapter";
import { AdvscriptModule } from "./modules/advscript-module";
import { AdvscriptGeneratedModule } from "./modules/generated/module";

function createBrowerServices<T extends Module<LangiumServices, PartialLangiumServices>>(
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

export function createLangiumServices(_monaco: typeof Monaco): LangiumServices {
  class TextDocumentFactory extends DefaultTextDocumentFactory {
    fromUri(uri: URI): TextDocument {
      console.log([...textDocuments.keys(), uri.toString()]);
      return textDocuments.get(uri.toString());
    }
  }
  const onSendDiagnostics = new _monaco.Emitter<Diagnostic[]>();
  class DocumentBuilder extends DefaultDocumentBuilder {
    async validate(
      document: LangiumDocument,
      cancelToken = CancellationToken.None,
      forceDiagnostics?: boolean
    ): Promise<Diagnostic[]> {
      let diagnostics: Diagnostic[] = [];
      const validator = this.documentValidator;
      diagnostics = await validator.validateDocument(document, cancelToken);
      if (this.connection) {
        // Send the computed diagnostics to VS Code.
        this.connection.sendDiagnostics({ uri: document.textDocument.uri, diagnostics });
      }
      onSendDiagnostics.fire(diagnostics);
      document.state = DocumentState.Validated;
      console.log("diagnostics", document, diagnostics);
      return diagnostics;
    }
  }
  // MonacoServices.install(_monaco);
  onSendDiagnostics.dispose();
  const textDocuments = new TextDocuments(TextDocument);
  const services: LangiumServices = createBrowerServices({
    documents: {
      TextDocumentFactory: (injector) => new TextDocumentFactory(injector),
      DocumentBuilder: (injector) => new DocumentBuilder(injector),
      TextDocuments: () => textDocuments,
    },
  });
  return services;
}

function createUrl(path: string): string {
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${location.host}${location.pathname}${path}`;
}

function createWebSocket(url: string): WebSocket {
  return new ReconnectingWebSocket(
    url,
    [],
    Object.create({
      maxReconnectionDelay: 10000,
      minReconnectionDelay: 1000,
      reconnectionDelayGrowFactor: 1.3,
      connectionTimeout: 10000,
      maxRetries: Infinity,
      debug: false,
    })
  );
}
