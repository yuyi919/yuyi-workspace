import {
  DocumentSelector,
  TextDocumentIdentifier,
  CancellationToken,
} from "vscode-languageserver-protocol";
import type { RenameProvider } from "./languageclient/services";
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
} from "./languageclient/monaco-converter";
import { MonacoLanguages, MonacoModelIdentifier } from "./languageclient/monaco-languages";
import { Monaco, TMonaco, TLanguages } from "./monaco.export";
import { Position, Range } from "vscode-languageserver-types";

declare module "./languageclient/services" {
  interface RenameProvider {
    resolveRenameLocation?: (
      params: {
        textDocument: TextDocumentIdentifier;
        position: Position;
      },
      token: CancellationToken
    ) => Thenable<{
      text: string;
      range: Range;
    }>;
  }
}

export class WrapperMonacoLanguages extends MonacoLanguages {
  createRenameProvider(
    selector: DocumentSelector,
    provider: RenameProvider
  ): monaco.languages.RenameProvider {
    return {
      ...super.createRenameProvider(selector, provider as any),
      resolveRenameLocation: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        token: Monaco.CancellationToken
      ) => {
        if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
          return void 0;
        }
        const result = await provider.resolveRenameLocation(
          {
            textDocument: this.m2p.asTextDocumentIdentifier(model),
            position: this.m2p.asPosition(position.lineNumber, position.column),
          },
          token
        );
        console.log("resolveRenameLocation", result)
        if (result) {
          return { range: this.p2m.asRange(result.range), text: result.text };
        }
        return {
          rejectReason: "此元素无法重命名"
        }
      },
    } as monaco.languages.RenameProvider;
  }
}

export class MonacoEditorRegisterAdapter implements Monaco.IDisposable {
  _onDispose: Monaco.Emitter<void>;
  readonly languages: WrapperMonacoLanguages;
  readonly _languages: TLanguages;
  m2p: MonacoToProtocolConverter;
  p2m: ProtocolToMonacoConverter;

  constructor(_monaco: TMonaco) {
    const m2p = new MonacoToProtocolConverter(_monaco);
    const p2m = new ProtocolToMonacoConverter(_monaco);
    this.m2p = m2p;
    this.p2m = p2m;
    this._onDispose = new _monaco.Emitter<void>();
    this.languages = new Proxy<WrapperMonacoLanguages>(
      new WrapperMonacoLanguages(_monaco, p2m, m2p) as WrapperMonacoLanguages,
      {
        get: (
          target: WrapperMonacoLanguages,
          key: keyof WrapperMonacoLanguages,
          receiver: WrapperMonacoLanguages
        ) => {
          if (/^register[A-Z]/.test(key)) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            return function () {
              console.debug("[proxy] Monaco.languages", key);
              // eslint-disable-next-line prefer-rest-params
              const dispose = Reflect.apply(target[key] as any, receiver, arguments);
              if (dispose) {
                self.addDispose(dispose as Monaco.IDisposable);
                return dispose;
              }
            };
          }
          return target[key];
        },
      }
    );
    this._languages = new Proxy<TLanguages>(_monaco.languages as TLanguages, {
      get: (target: TLanguages, key: keyof TLanguages, receiver: TLanguages) => {
        if (/^register[A-Z]/.test(key)) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const self = this;
          return function () {
            console.log("[proxy] Monaco.languages", key);
            // eslint-disable-next-line prefer-rest-params
            const dispose = Reflect.apply(target[key] as any, receiver, arguments);
            if (dispose) {
              self.addDispose(dispose as Monaco.IDisposable);
              return dispose;
            }
          };
        }
        return target[key];
      },
    });
  }

  addDispose(dispose: Monaco.IDisposable): Monaco.IDisposable {
    return this._onDispose.event(dispose.dispose);
  }

  dispose() {
    this._onDispose.fire();
    this._onDispose.dispose();
  }
}
