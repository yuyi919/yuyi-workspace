import { TMonaco, Monaco } from "./lib";

export function createEditor(monaco: TMonaco, model: Monaco.editor.ITextModel) {
  return monaco.editor.create(document.querySelector("#editor"), {
    peekWidgetDefaultFocus: "tree",
    theme: "OneDark",
    automaticLayout: true,
    model: model,
    codeActionsOnSaveTimeout: 1000,
    "semanticHighlighting.enabled": true,
    useShadowDOM: true,
    glyphMargin: true,
    lightbulb: {
      enabled: true,
    },
    suggest: {
      showWords: true,
      showStatusBar: true,
      showClasses: true,
      showColors: true,
      showConstants: true,
      shareSuggestSelections: true,
      showConstructors: true,
      showDeprecated: true,
      showEnums: true,
      showEnumMembers: true,
      showEvents: true,
      showFields: true,
      showSnippets: true,
    },
    inlineSuggest: {
      enabled: true,
      mode: "prefix"
    },
    wordBasedSuggestions: false,
    // tabCompletion: "on",
  });
}
