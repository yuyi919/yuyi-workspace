import type * as Lsp from "vscode-languageserver-protocol";
import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
} from "./languageclient/monaco-converter";
import { MonacoLanguages, MonacoModelIdentifier } from "./languageclient/monaco-languages";
import type {
  ProviderResult,
  RenameProvider,
  CompletionItemProvider,
  Disposable,
} from "./languageclient/services";
import { DisposableCollection } from "./languageclient/disposable";
import { Monaco, TLanguages, TMonaco } from "./monaco.export";

declare module "./languageclient/services" {
  interface RenameProvider {
    resolveRenameLocation?: (
      params: {
        textDocument: Lsp.TextDocumentIdentifier;
        position: Lsp.Position;
      },
      token: Lsp.CancellationToken
    ) => Thenable<{
      text: string;
      range: Lsp.Range;
    }>;
  }
}

export interface InlineCompletionItemProvider {
  provideCompletionItems(
    params: Lsp.CompletionParams,
    token: Lsp.CancellationToken
  ): ProviderResult<Lsp.CompletionItem[] | Lsp.CompletionList>;
  resolveCompletionItem?(
    item: Lsp.CompletionItem,
    token: Lsp.CancellationToken
  ): ProviderResult<Lsp.CompletionItem>;
}

export class WrapperMonacoLanguages extends MonacoLanguages {
  createRenameProvider(
    selector: Lsp.DocumentSelector,
    provider: RenameProvider
  ): monaco.languages.RenameProvider {
    if (!provider.resolveRenameLocation)
      return super.createRenameProvider(selector, provider as any);
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
        const range = model.getWordUntilPosition(position);
        const result = await provider.resolveRenameLocation(
          {
            textDocument: this.m2p.asTextDocumentIdentifier(model),
            position: this.m2p.asPosition(position.lineNumber, range.startColumn),
          },
          token
        );
        if (result) {
          console.log("resolveRenameLocation", result, this.p2m.asRange(result.range));
          return { range: this.p2m.asRange(result.range), text: result.text };
        }
        return {
          rejectReason: "此元素无法重命名",
        };
      },
    } as monaco.languages.RenameProvider;
  }

  _isCompleting = false;
  protected createCompletionProvider(
    selector: Lsp.DocumentSelector,
    provider: CompletionItemProvider,
    ...triggerCharacters: string[]
  ): monaco.languages.CompletionItemProvider {
    return super.createCompletionProvider(
      selector,
      {
        ...provider,
        provideCompletionItems: async (params, token) => {
          this._isCompleting = true;
          try {
            console.log(
              "provideCompletionItems",
              params.position,
              this._monaco.languages.CompletionTriggerKind[params.context.triggerKind],
              params.context.triggerCharacter
            );
            const result = await provider.provideCompletionItems(params, token);
            console.log("provideCompletionItems", result);
            return result;
          } catch (error) {
          } finally {
            this._isCompleting = false;
          }
        },
      },
      ...triggerCharacters
    );
  }
  registerInlineCompletionItemProvider(
    selector: Lsp.DocumentSelector,
    provider: InlineCompletionItemProvider
  ): Disposable {
    const completionProvider = this.createInlineCompletionProvider(selector, provider);
    const providers = new DisposableCollection();
    for (const language of this.matchLanguage(selector)) {
      providers.push(
        this._monaco.languages.registerInlineCompletionsProvider(language, completionProvider)
      );
    }
    return providers;
  }

  protected createInlineCompletionProvider(
    selector: Lsp.DocumentSelector,
    provider: CompletionItemProvider
  ): monaco.languages.InlineCompletionsProvider {
    return {
      provideInlineCompletions: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        context: Monaco.languages.InlineCompletionContext,
        token: Lsp.CancellationToken
      ) => {
        await new Promise((r) => setTimeout(r, 0));
        if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
          return undefined;
        }
        console.log(
          "provideInlineCompletions",
          position,
          this._monaco.languages.InlineCompletionTriggerKind[context.triggerKind],
          context.selectedSuggestionInfo
        );
        const wordUntil = model.getWordUntilPosition(position);
        const defaultRange = new this._monaco.Range(
          position.lineNumber,
          wordUntil.startColumn,
          position.lineNumber,
          wordUntil.endColumn
        );
        const items = [] as Monaco.languages.InlineCompletion[];
        if (this._isCompleting) return { items };
        const params = this.m2p.asCompletionParams(model, position, {
          triggerCharacter: wordUntil.word,
          triggerKind: this._monaco.languages.CompletionTriggerKind.TriggerForIncompleteCompletions,
        });
        if (context.selectedSuggestionInfo) {
          items.push(context.selectedSuggestionInfo);
        } else {
          const result = await provider.provideCompletionItems(params, token);
          const { suggestions } = this.p2m.asCompletionResult(result, defaultRange);
          console.log("provideInlineCompletions", result);
          context.selectedSuggestionInfo && items.push(context.selectedSuggestionInfo);
          suggestions.forEach((suggest) => {
            items.push({
              text: suggest.insertText,
              range: this._monaco.Range.isIRange(suggest.range)
                ? suggest.range
                : suggest.range?.insert || suggest.range?.replace,
            });
          });
        }
        return {
          items: items as Monaco.languages.InlineCompletion[],
        };
      },
      freeInlineCompletions(completions: {}) {
        console.log("freeInlineCompletions", completions);
      },
    };
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
