/* eslint-disable @typescript-eslint/no-this-alias */
import { Uri, languages, editor } from "../monaco.export";
import type { LanguageId } from "../register";
import { LanguageServiceDefaults } from "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import * as languageFeatures from "./tsLanguageFeatures";
import type { TypeScriptWorker } from "monaco-editor/esm/vs/language/typescript/monaco.contribution";

type LibLoader = Record<string, string | (() => Promise<string>)>;

export class EmbeddedTypescriptWorker {
  suggestService: languageFeatures.SuggestAdapter;
  quickInfoService: languageFeatures.QuickInfoAdapter;
  parser: languageFeatures.ParserAdapter;

  private _inited = false;
  private _worker: (...uris: Uri[]) => Promise<languages.typescript.TypeScriptWorker>;
  signatureHelpService: languageFeatures.SignatureHelpAdapter;

  setupEditor(editor: editor.IStandaloneCodeEditor) {
    this.parser = new languageFeatures.ParserAdapter(editor);
    editor.onDidChangeModelContent((e) => {
      this.parser.handleOnContentChange(e.changes);
    });
    this.parser.parse(editor.getValue());
  }

  constructor(
    private defaults: LanguageServiceDefaults = languages.typescript.typescriptDefaults,
    private getWorker = languages.typescript.getTypeScriptWorker
  ) {
    this.setupTypescript();
  }

  private _emitWait?: (e: this) => void;

  wait() {
    return new Promise<this>((r) => {
      if (this._inited) {
        r(this);
        this._emitWait = void 0;
        return;
      }
      this._emitWait = r;
    });
  }

  model!: editor.ITextModel;

  async init() {
    if (!this._inited) {
      this.getModel("./mock.ts");
      return new Promise<void>((resolve, reject) => {
        setTimeout(async () => {
          try {
            const worker = await this.getWorker();
            this.suggestService = new languageFeatures.SuggestAdapter(worker);
            this.quickInfoService = new languageFeatures.QuickInfoAdapter(worker);
            this._worker = worker;
            this._inited = true;
            if (this._emitWait) {
              this._emitWait(this);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        }, 500);
      });
    }
  }

  getModel(file: string) {
    const uri = this.getUri(file);
    const model = editor.getModel(uri) || editor.createModel("", "typescript", uri);
    // console.log(model)
    return (this.model = model);
  }

  getUri(file?: string) {
    return Uri.file(file || "./__mock.ts");
  }

  setContent(content: string) {
    this.model.setValue(content);
  }

  registerCompletionItemProvider(languageId: LanguageId) {
    const services = this;
    languages.registerHoverProvider(languageId, {
      async provideHover(model, position, token) {
        services.model.setValue(model.getValue());
        const result: languages.Hover = await services.quickInfoService.provideHover(
          services.model,
          position,
          token
        );
        return result;
      },
    });
    services.signatureHelpService = new languageFeatures.SignatureHelpAdapter(this._worker);
    languages.registerSignatureHelpProvider(languageId, {
      signatureHelpTriggerCharacters: services.signatureHelpService.signatureHelpTriggerCharacters,
      async provideSignatureHelp(model, position, token, context) {
        services.model.setValue(model.getValue());
        const result = await services.signatureHelpService.provideSignatureHelp(
          services.model,
          position,
          token,
          context
        );
        return result;
      },
    });
    languages.registerCompletionItemProvider(languageId, {
      triggerCharacters: services.suggestService.triggerCharacters,
      async resolveCompletionItem(item, token) {
        await services.wait();
        const completions = await services.suggestService.resolveCompletionItem(item, token);
        // console.log("resolveCompletionItem", item, "=>", completions);
        return completions;
      },
      async provideCompletionItems(model, position, context, token) {
        services.model.setValue(model.getValue());
        const suggestions = [] as languages.CompletionItem[];
        await services.wait();
        const completions: languages.CompletionList | undefined =
          await services.suggestService.provideCompletionItems(model, position, context, token);
        // console.log("provideCompletionItems", completions);

        // await tsWorker.getCompletionsAtPosition(
        //   tsModel.uri.toString(),
        //   model.getOffsetAt(position)
        // );
        // console.log(
        //   "provideCompletionItems",
        //   completions,
        //   languages.CompletionTriggerKind[context.triggerKind]
        // );
        if (completions) {
          suggestions.push(...completions.suggestions);
        }
        return {
          suggestions,
        };
      },
    });
  }

  async addExtraLib(getLoader: LibLoader | (() => Promise<LibLoader> | LibLoader)) {
    const loader = (await (getLoader instanceof Function ? getLoader() : getLoader)) || {};
    for await (const { path, result } of Object.entries(loader).map(([path, load]) =>
      Promise.resolve(load instanceof Function ? load() : load).then((result) => ({ result, path }))
    )) {
      // console.log(path, result)
      languages.typescript.typescriptDefaults.addExtraLib(result, Uri.file(path).toString());
    }
    // validation settings
    // languages.typescript.typescriptDefaults.addExtraLib(
    //   `export declare const toolUtils: {
    //   /**
    //    * convert obj to string
    //    */
    //   toString2(): string
    // }
    // export declare function toTool(): void
    // `,
    //   Uri.file("./tool.ts").toString()
    // );
  }

  getExtraLibs() {
    languages.typescript.typescriptDefaults.getExtraLibs();
  }

  private setupTypescript() {
    languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    // compiler options
    languages.typescript.typescriptDefaults.setCompilerOptions({
      target: languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      lib: [],
    });
  }
}
// export async function setupTsModel(defaults: LanguageServiceDefaults, modeId: LanguageId) {
//   const worker = await languages.typescript.getTypeScriptWorker();
//   // var libFiles = new languageFeatures.LibFiles(worker);
//   languages.registerCompletionItemProvider(modeId, new languageFeatures.SuggestAdapter(worker));
//   // languages.registerSignatureHelpProvider(modeId, new languageFeatures.SignatureHelpAdapter(worker));
//   languages.registerHoverProvider(modeId, new languageFeatures.QuickInfoAdapter(worker));
//   // languages.registerDocumentHighlightProvider(modeId, new languageFeatures.OccurrencesAdapter(worker));
//   // languages.registerDefinitionProvider(modeId, new languageFeatures.DefinitionAdapter(libFiles, worker));
//   // languages.registerReferenceProvider(modeId, new languageFeatures.ReferenceAdapter(libFiles, worker));
//   // languages.registerDocumentSymbolProvider(modeId, new languageFeatures.OutlineAdapter(worker));
//   // languages.registerDocumentRangeFormattingEditProvider(modeId, new languageFeatures.FormatAdapter(worker));
//   // languages.registerOnTypeFormattingEditProvider(modeId, new languageFeatures.FormatOnTypeAdapter(worker));
//   // languages.registerCodeActionProvider(modeId, new languageFeatures.CodeActionAdaptor(worker));
//   // languages.registerRenameProvider(modeId, new languageFeatures.RenameAdapter(libFiles, worker));
//   // languages.registerInlayHintsProvider(modeId, new languageFeatures.InlayHintsAdapter(worker));
//   // new languageFeatures.DiagnosticsAdapter(libFiles, defaults, modeId, worker);
//   return worker;
// }
export type { TypeScriptWorker };
