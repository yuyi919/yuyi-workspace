import type { TMonaco, Monaco } from "./lib/monaco.export";

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
      enabled: true
    },
    linkedEditing: true,
    autoClosingDelete: "always",
    autoClosingOvertype: "always",
    parameterHints: {},
    suggest: {
      shareSuggestSelections: true,
      preview: true,
      localityBonus: true,
      previewMode: "subwordSmart",
      showInlineDetails: true,
      showStatusBar: true,
      snippetsPreventQuickSuggestions: true,
      filterGraceful: true,

      showWords: true,
      showClasses: true,
      showColors: true,
      showConstants: true,
      showConstructors: true,
      showDeprecated: true,
      showEnums: true,
      showEnumMembers: true,
      showEvents: true,
      showFields: true,
      showSnippets: true,
      showFiles: true,
      showFolders: true,
      showFunctions: true,
      showIcons: true,
      showInterfaces: true,
      showIssues: true,
      showKeywords: true,
      showMethods: true,
      showModules: true,
      showOperators: true,
      showProperties: true,
      showReferences: true,
      showStructs: true,
      showTypeParameters: true,
      showUnits: true,
      showUsers: true,
      showValues: true,
      showVariables: true
    },
    inlineSuggest: {
      enabled: true,
      mode: "subword"
    },
    comments: {},
    showDeprecated: true,
    showUnused: true,

    // snippetSuggestions: "inline",
    quickSuggestions: {
      comments: true,
      strings: true,
      other: true
    },
    wordBasedSuggestions: false
    // tabCompletion: "on",
  });
}
