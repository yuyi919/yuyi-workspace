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
    const Provider: monaco.languages.RenameProvider = {
      provideRenameEdits: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        newName: string,
        token: Monaco.CancellationToken
      ) => {
        if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
          return undefined;
        }
        const word = model.getWordAtPosition(position);
        if (!word) return;
        const params = this.m2p.asRenameParams(model, this.usePosition(position, word), newName);
        const result = await provider.provideRenameEdits(params, token);
        return result && this.p2m.asWorkspaceEdit(result);
      },
    };
    if (!provider.resolveRenameLocation) return Provider;
    return Object.assign(Provider, {
      resolveRenameLocation: async (
        model: Monaco.editor.ITextModel,
        position: Monaco.Position,
        token: Monaco.CancellationToken
      ) => {
        if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
          return void 0;
        }
        const word = model.getWordAtPosition(position);
        if (word) {
          const result = await provider.resolveRenameLocation(
            this.asTextDocumentPositionParams(model, position, word),
            token
          );
          if (result) {
            console.log("resolveRenameLocation", result, this.p2m.asRange(result.range));
            return { range: this.p2m.asRange(result.range), text: result.text };
          }
        }
        return {
          rejectReason: "此元素无法重命名",
        } as Monaco.languages.RenameLocation & Monaco.languages.Rejection;
      },
    });
  }

  asTextDocumentPositionParams(
    model: Monaco.editor.ITextModel,
    position: Monaco.IPosition,
    wordPosition?: Monaco.editor.IWordAtPosition
  ): Lsp.TextDocumentPositionParams {
    return {
      textDocument: this.m2p.asTextDocumentIdentifier(model),
      position: this.asPosition(position, wordPosition),
    };
  }

  _isCompleting = false;

  private asPosition(
    position: Monaco.IPosition,
    wordPosition?: Monaco.editor.IWordAtPosition
  ): Lsp.Position {
    return this.m2p.asPosition(
      position.lineNumber,
      wordPosition ? wordPosition.startColumn ?? position.column : position.column
    );
  }
  private usePosition(
    position: Monaco.IPosition,
    wordPosition?: Monaco.editor.IWordAtPosition
  ): Monaco.IPosition {
    return {
      lineNumber: position.lineNumber,
      column: wordPosition ? wordPosition?.startColumn ?? position.column : position.column,
    };
  }

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
            if (result) {
              console.log("provideCompletionItems", result);
              if (!(result instanceof Array)) {
                // result.items.unshift({
                //   label: "foo",
                //   command: {
                //     title: "test",
                //     command: 'ssss',
                //     arguments: ['s']
                //   }
                // });
              }
              return result;
            }
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

  registerLinkedEditingRangeProvider(
    selector: Lsp.DocumentSelector,
    provider: LinkedEditingRangeProvider
  ): Disposable {
    const linkedEditingRangeProvider = this.createLinkedEditingRangeProvider(selector, provider);
    const providers = new DisposableCollection();
    for (const language of this.matchLanguage(selector)) {
      providers.push(
        this._monaco.languages.registerLinkedEditingRangeProvider(
          language,
          linkedEditingRangeProvider
        )
      );
    }
    return providers;
  }

  createLinkedEditingRangeProvider(
    selector: Lsp.DocumentSelector,
    provider: LinkedEditingRangeProvider
  ): Monaco.languages.LinkedEditingRangeProvider {
    return {
      provideLinkedEditingRanges: async (model, position, token) => {
        if (!this.matchModel(selector, MonacoModelIdentifier.fromModel(model))) {
          return undefined;
        }
        const word = model.getWordAtPosition(position);
        // console.log("provideLinkedEditingRanges", cursorPosition, position);
        const result = await provider.provideLinkedEditingRanges({
          ...this.asTextDocumentPositionParams(model, position, word),
        });
        if (result && !token.isCancellationRequested) {
          const ranges = this.asLinkedEditingRanges(result);
          return ranges;
        }
      },
    };
  }

  asLinkedEditingRanges(linkedRanges: Lsp.LinkedEditingRanges) {
    const { ranges, wordPattern } = linkedRanges;
    const result = {
      ranges: ranges.map((range) => this.p2m.asRange(range)),
    } as Monaco.languages.LinkedEditingRanges;
    if (wordPattern != null) {
      result.wordPattern = new RegExp(wordPattern);
    }
    return result;
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
        if (
          context.selectedSuggestionInfo ||
          !this.matchModel(selector, MonacoModelIdentifier.fromModel(model))
        ) {
          return undefined;
        }
        await new Promise((r) => setTimeout(r, 0));
        const wordUntil = model.getWordUntilPosition(position);
        // console.log("onprovideInlineCompletions", wordUntil, position)
        const items = [] as Monaco.languages.InlineCompletion[];
        if (this._isCompleting) return;
        if (wordUntil.word.trim() !== "") {
          // if (context.selectedSuggestionInfo) {
          //   items.push(context.selectedSuggestionInfo);
          //   return { items }
          // }
          // 可能
          console.log(
            "provideInlineCompletions",
            wordUntil,
            this._monaco.languages.InlineCompletionTriggerKind[context.triggerKind],
            context.selectedSuggestionInfo,
            position
          );
          const defaultRange = new this._monaco.Range(
            position.lineNumber,
            wordUntil.startColumn,
            position.lineNumber,
            wordUntil.endColumn
          );
          const params = this.m2p.asCompletionParams(model, position, {
            triggerCharacter: wordUntil.word,
            triggerKind: this._monaco.languages.CompletionTriggerKind.Invoke,
          });
          const result = await provider.provideCompletionItems(params, token);
          if (!result) return;
          const { suggestions, incomplete } = this.p2m.asCompletionResult(result, defaultRange);
          console.log("provideInlineCompletions", { suggestions, incomplete });
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
          items,
        };
      },
      freeInlineCompletions(completions: {}) {
        // console.log("freeInlineCompletions", completions);
      },
    };
  }
}
interface LinkedEditingRangeProvider {
  provideLinkedEditingRanges(
    params: Lsp.LinkedEditingRangeParams
  ): ProviderResult<Lsp.LinkedEditingRanges>;
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
