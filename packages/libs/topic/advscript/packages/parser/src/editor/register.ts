import type { Monaco } from "./monaco.export";
import { monaco } from "./monaco.export";

/** String identifier like 'cpp' or 'java'. */
export type LanguageId = string;

export type LanguageInfo = {
  tokensProvider: monaco.languages.EncodedTokensProvider | null;
  configuration: monaco.languages.LanguageConfiguration | null;
  formatProvider?: monaco.languages.DocumentFormattingEditProvider | null;
  formatRangeProvider?: monaco.languages.DocumentRangeFormattingEditProvider | null;
  highlightProvider?: monaco.languages.DocumentHighlightProvider | null;
  foldingRangeProvider?: monaco.languages.FoldingRangeProvider | null;
  completionItemProvider?: monaco.languages.CompletionItemProvider | null;
  inlineCompletionProvider?: monaco.languages.InlineCompletionsProvider | null;
  declarationProvider?: monaco.languages.DeclarationProvider | null;
  documentSymbolProvider?: monaco.languages.DocumentSymbolProvider | null;
  typeDefinitionProvider?: monaco.languages.TypeDefinitionProvider | null;
  inlayHintsProvider?: monaco.languages.InlayHintsProvider | null;
};
/**
 * This function needs to be called before monaco.editor.create().
 *
 * @param languages the set of languages Monaco must know about up front.
 * @param fetchLanguageInfo fetches full language configuration on demand.
 * @param monaco instance of Monaco on which to register languages information.
 */
export function registerLanguages(
  languages: monaco.languages.ILanguageExtensionPoint[],
  fetchLanguageInfo: (language: LanguageId) => Promise<LanguageInfo>,
  monaco: Monaco
) {
  // We have to register all of the languages with Monaco synchronously before
  // we can configure them.
  for (const extensionPoint of languages) {
    // Recall that the id is a short name like 'cpp' or 'java'.
    const { id: languageId } = extensionPoint;
    if (!monaco.languages.getLanguages().find((o) => o.id === languageId)) {
      monaco.languages.register(extensionPoint);
      console.log("Register language:", languageId, extensionPoint);
    }

    // Lazy-load the tokens provider and configuration data.
    monaco.languages.onLanguage(languageId, async () => {
      console.log("load", languageId);
      const {
        tokensProvider,
        configuration,
        foldingRangeProvider,
        formatProvider,
        formatRangeProvider,
        highlightProvider,
        declarationProvider,
        inlineCompletionProvider,
        completionItemProvider,
        documentSymbolProvider,
        inlayHintsProvider,
      } = await fetchLanguageInfo(languageId);

      if (tokensProvider != null) {
        monaco.languages.setTokensProvider(languageId, tokensProvider);
      }
      if (inlayHintsProvider) {
        monaco.languages.registerInlayHintsProvider(languageId, inlayHintsProvider);
      }
      if (formatProvider) {
        monaco.languages.registerDocumentFormattingEditProvider(languageId, formatProvider);
      }
      if (formatRangeProvider) {
        monaco.languages.registerDocumentRangeFormattingEditProvider(
          languageId,
          formatRangeProvider
        );
      }

      if (documentSymbolProvider) {
        monaco.languages.registerDocumentSymbolProvider(languageId, documentSymbolProvider);
      }

      if (completionItemProvider) {
        monaco.languages.registerCompletionItemProvider(languageId, completionItemProvider);
      }
      if (inlineCompletionProvider) {
        monaco.languages.registerInlineCompletionsProvider(languageId, inlineCompletionProvider);
      }
      if (declarationProvider) {
        monaco.languages.registerDeclarationProvider(languageId, declarationProvider);
      }

      if (foldingRangeProvider) {
        monaco.languages.registerFoldingRangeProvider(languageId, foldingRangeProvider);
      }

      if (highlightProvider) {
        monaco.languages.registerDocumentHighlightProvider(languageId, highlightProvider);
      }

      if (configuration != null) {
        monaco.languages.setLanguageConfiguration(languageId, configuration);
      }
    });
  }
}
