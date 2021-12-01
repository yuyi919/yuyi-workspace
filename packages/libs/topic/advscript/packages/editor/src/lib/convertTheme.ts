import { castArray } from "lodash";
import { monaco } from "./monaco.export";
import theme from "./theme";
export interface IVSCodeTheme {
  type: "dark" | "light";
  colors: { [name: string]: string };
  tokenColors: {
    name?: string;
    scope: string[] | string;
    settings: {
      foreground?: string;
      background?: string;
      fontStyle?: string;
    };
  }[];
}

export type IMonacoThemeRule = monaco.editor.ITokenThemeRule[];
export function convertTheme2(input: IVSCodeTheme): monaco.editor.IStandaloneThemeData {
  const theme: monaco.editor.IStandaloneThemeData = {
    inherit: false,
    base: "vs-dark",
    colors: {},
    rules: [],
    encodedTokensColors: [],
  };

  input.tokenColors.map((color) => {
    if (!color.scope) {
      color.scope = "";
    }

    const colorScopes: Array<string> =
      typeof color.scope == "string" ? color.scope.split(",").map((v) => v.trim()) : color.scope;

    for (const scope of colorScopes) {
      theme.rules.push(
        Object.assign({
          ...Object.keys(color.settings).reduce((r, k) => {
            const colorStr = color.settings[k];
            return {
              ...r,
              [k]:
                colorStr === "white" || colorStr === "inherit"
                  ? "000000"
                  : colorStr?.replace(/^#/, ""),
            };
          }, {}),
          token: scope,
        })
      );
    }
  });

  for (const colorKey of Object.keys(input.colors)) {
    if (MONACO_COLOR_KEYS.includes(colorKey)) {
      theme.colors[colorKey] = input.colors[colorKey];
    }
  }

  return theme;
}
export function convertTheme() {
  const newTheme = {
    ...theme,
    tokenColors: [...(appendTheme as typeof theme.tokenColors), ...theme.tokenColors],
  };
  const rules = newTheme.tokenColors
    .map((setting) => {
      return castArray(setting.scope).map(
        (scope) =>
          ({
            token: scope,
            ...Object.keys(setting.settings).reduce(
              (r, k) => ({ ...r, [k]: setting.settings[k]?.replace(/^#/, "") }),
              {}
            ),
          } as monaco.editor.ITokenThemeRule)
      );
    })
    .flat();

  return {
    theme: {
      name: newTheme.name,
      settings: newTheme.tokenColors,
    },
    monacoTheme: convertTheme2(newTheme),
    // {
    //   base: "vs-dark",
    //   inherit: true,
    //   colors: theme.colors || {},
    //   rules: rules,
    // } as monaco.editor.IStandaloneThemeData,
  };
}

const appendTheme = Object.freeze([
  {
    settings: {
      foreground: "#D4D4D4",
      background: "#1E1E1E",
    },
  },
  // {
  //   scope: ["operator"],
  //   name: "operator",
  //   settings: {
  //     foreground: "#000000",
  //   },
  // },
  // {
  //   scope: ["namespace"],
  //   name: "namespace",
  //   settings: {
  //     foreground: "#66afce",
  //   },
  // },
  // {
  //   scope: ["type"],
  //   name: "type",
  //   settings: {
  //     foreground: "#1db010",
  //   },
  // },
  // {
  //   scope: ["struct"],
  //   name: "struct",
  //   settings: {
  //     foreground: "#0000ff",
  //   },
  // },
  // {
  //   scope: ["class"],
  //   name: "class",
  //   settings: {
  //     foreground: "#0000ff",
  //     fontStyle: "bold",
  //   },
  // },
  // {
  //   scope: ["interface"],
  //   name: "interface",
  //   settings: {
  //     foreground: "#007700",
  //     fontStyle: "bold",
  //   },
  // },
  // {
  //   scope: ["enum"],
  //   name: "enum",
  //   settings: {
  //     foreground: "#0077ff",
  //     fontStyle: "bold",
  //   },
  // },
  // {
  //   scope: ["typeParameter"],
  //   name: "typeParameter",
  //   settings: {
  //     foreground: "#1db010",
  //   },
  // },
  // {
  //   scope: ["function"],
  //   name: "function",
  //   settings: {
  //     foreground: "#94763a",
  //   },
  // },
  // {
  //   scope: ["member"],
  //   name: "member",
  //   settings: {
  //     foreground: "#94763a",
  //   },
  // },
  // {
  //   scope: ["macro"],
  //   name: "macro",
  //   settings: {
  //     foreground: "#615a60",
  //   },
  // },
  // {
  //   scope: ["variable"],
  //   name: "variable",
  //   settings: {
  //     foreground: "#3e5bbf",
  //   },
  // },
  // {
  //   scope: ["parameter"],
  //   name: "parameter",
  //   settings: {
  //     foreground: "#3e5bbf",
  //   },
  // },
  // {
  //   scope: ["property"],
  //   name: "property",
  //   settings: {
  //     foreground: "#3e5bbf",
  //   },
  // },
  // {
  //   scope: ["label"],
  //   name: "label",
  //   settings: {
  //     foreground: "#615a60",
  //   },
  // },
  // {
  //   scope: ["type.static"],
  //   name: "type.static",
  //   settings: {
  //     fontStyle: "bold",
  //   },
  // },
  // {
  //   scope: ["function.macro"],
  //   name: "function.macro",
  //   settings: {
  //     foreground: "#61afef",
  //   },
  // },
]);

// See https://github.com/microsoft/monaco-editor/issues/1631#issuecomment-541910487
export const MONACO_COLOR_KEYS = [
  "foreground",
  "errorForeground",
  "icon.foreground",
  "focusBorder",
  "contrastBorder",
  "contrastActiveBorder",
  "textLink.foreground",
  "textLink.activeForeground",
  "textCodeBlock.background",
  "widget.shadow",
  "input.background",
  "input.foreground",
  "input.border",
  "inputOption.activeBorder",
  "inputOption.activeBackground",
  "inputOption.activeForeground",
  "inputValidation.infoBackground",
  "inputValidation.infoForeground",
  "inputValidation.infoBorder",
  "inputValidation.warningBackground",
  "inputValidation.warningForeground",
  "inputValidation.warningBorder",
  "inputValidation.errorBackground",
  "inputValidation.errorForeground",
  "inputValidation.errorBorder",
  "dropdown.background",
  "dropdown.foreground",
  "button.foreground",
  "button.background",
  "button.hoverBackground",
  "badge.background",
  "badge.foreground",
  "scrollbar.shadow",
  "scrollbarSlider.background",
  "scrollbarSlider.hoverBackground",
  "scrollbarSlider.activeBackground",
  "progressBar.background",
  "editorError.background",
  "editorError.foreground",
  "editorError.border",
  "editorWarning.background",
  "editorWarning.foreground",
  "editorWarning.border",
  "editorInfo.background",
  "editorInfo.foreground",
  "editorInfo.border",
  "editorHint.foreground",
  "editorHint.border",
  "editor.background",
  "editor.foreground",
  "editorWidget.background",
  "editorWidget.foreground",
  "editorWidget.border",
  "editorWidget.resizeBorder",
  "quickInput.background",
  "quickInput.foreground",
  "quickInputTitle.background",
  "pickerGroup.foreground",
  "pickerGroup.border",
  "keybindingLabel.background",
  "keybindingLabel.foreground",
  "keybindingLabel.border",
  "keybindingLabel.bottomBorder",
  "editor.selectionBackground",
  "editor.selectionForeground",
  "editor.inactiveSelectionBackground",
  "editor.selectionHighlightBackground",
  "editor.selectionHighlightBorder",
  "editor.findMatchBackground",
  "editor.findMatchHighlightBackground",
  "editor.findRangeHighlightBackground",
  "editor.findMatchBorder",
  "editor.findMatchHighlightBorder",
  "editor.findRangeHighlightBorder",
  "editor.hoverHighlightBackground",
  "editorHoverWidget.background",
  "editorHoverWidget.foreground",
  "editorHoverWidget.border",
  "editorHoverWidget.statusBarBackground",
  "editorLink.activeForeground",
  "editorInlayHint.foreground",
  "editorInlayHint.background",
  "editorLightBulb.foreground",
  "editorLightBulbAutoFix.foreground",
  "diffEditor.insertedTextBackground",
  "diffEditor.removedTextBackground",
  "diffEditor.insertedTextBorder",
  "diffEditor.removedTextBorder",
  "diffEditor.border",
  "diffEditor.diagonalFill",
  "list.focusBackground",
  "list.focusForeground",
  "list.focusOutline",
  "list.activeSelectionBackground",
  "list.activeSelectionForeground",
  "list.activeSelectionIconForeground",
  "list.inactiveSelectionBackground",
  "list.inactiveSelectionForeground",
  "list.inactiveSelectionIconForeground",
  "list.inactiveFocusBackground",
  "list.inactiveFocusOutline",
  "list.hoverBackground",
  "list.hoverForeground",
  "list.dropBackground",
  "list.highlightForeground",
  "list.focusHighlightForeground",
  "listFilterWidget.background",
  "listFilterWidget.outline",
  "listFilterWidget.noMatchesOutline",
  "tree.indentGuidesStroke",
  "tree.tableColumnsBorder",
  "quickInput.list.focusBackground",
  "quickInputList.focusForeground",
  "quickInputList.focusIconForeground",
  "quickInputList.focusBackground",
  "menu.border",
  "menu.foreground",
  "menu.background",
  "menu.selectionForeground",
  "menu.selectionBackground",
  "menu.selectionBorder",
  "menu.separatorBackground",
  "editor.snippetTabstopHighlightBackground",
  "editor.snippetTabstopHighlightBorder",
  "editor.snippetFinalTabstopHighlightBackground",
  "editor.snippetFinalTabstopHighlightBorder",
  "editorOverviewRuler.findMatchForeground",
  "editorOverviewRuler.selectionHighlightForeground",
  "minimap.findMatchHighlight",
  "minimap.selectionHighlight",
  "minimap.errorHighlight",
  "minimap.warningHighlight",
  "minimap.background",
  "minimapSlider.background",
  "minimapSlider.hoverBackground",
  "minimapSlider.activeBackground",
  "problemsErrorIcon.foreground",
  "problemsWarningIcon.foreground",
  "problemsInfoIcon.foreground",
  "editor.lineHighlightBackground",
  "editor.lineHighlightBorder",
  "editor.rangeHighlightBackground",
  "editor.rangeHighlightBorder",
  "editor.symbolHighlightBackground",
  "editor.symbolHighlightBorder",
  "editorCursor.foreground",
  "editorCursor.background",
  "editorWhitespace.foreground",
  "editorIndentGuide.background",
  "editorIndentGuide.activeBackground",
  "editorLineNumber.foreground",
  "editorActiveLineNumber.foreground",
  "editorLineNumber.activeForeground",
  "editorRuler.foreground",
  "editorCodeLens.foreground",
  "editorBracketMatch.background",
  "editorBracketMatch.border",
  "editorOverviewRuler.border",
  "editorOverviewRuler.background",
  "editorGutter.background",
  "editorUnnecessaryCode.border",
  "editorUnnecessaryCode.opacity",
  "editorGhostText.border",
  "editorGhostText.foreground",
  "editorOverviewRuler.rangeHighlightForeground",
  "editorOverviewRuler.errorForeground",
  "editorOverviewRuler.warningForeground",
  "editorOverviewRuler.infoForeground",
  "symbolIcon.arrayForeground",
  "symbolIcon.booleanForeground",
  "symbolIcon.classForeground",
  "symbolIcon.colorForeground",
  "symbolIcon.constantForeground",
  "symbolIcon.constructorForeground",
  "symbolIcon.enumeratorForeground",
  "symbolIcon.enumeratorMemberForeground",
  "symbolIcon.eventForeground",
  "symbolIcon.fieldForeground",
  "symbolIcon.fileForeground",
  "symbolIcon.folderForeground",
  "symbolIcon.functionForeground",
  "symbolIcon.interfaceForeground",
  "symbolIcon.keyForeground",
  "symbolIcon.keywordForeground",
  "symbolIcon.methodForeground",
  "symbolIcon.moduleForeground",
  "symbolIcon.namespaceForeground",
  "symbolIcon.nullForeground",
  "symbolIcon.numberForeground",
  "symbolIcon.objectForeground",
  "symbolIcon.operatorForeground",
  "symbolIcon.packageForeground",
  "symbolIcon.propertyForeground",
  "symbolIcon.referenceForeground",
  "symbolIcon.snippetForeground",
  "symbolIcon.stringForeground",
  "symbolIcon.structForeground",
  "symbolIcon.textForeground",
  "symbolIcon.typeParameterForeground",
  "symbolIcon.unitForeground",
  "symbolIcon.variableForeground",
  "editorOverviewRuler.bracketMatchForeground",
  "editor.linkedEditingBackground",
  "editor.wordHighlightBackground",
  "editor.wordHighlightStrongBackground",
  "editor.wordHighlightBorder",
  "editor.wordHighlightStrongBorder",
  "editorOverviewRuler.wordHighlightForeground",
  "editorOverviewRuler.wordHighlightStrongForeground",
  "peekViewTitle.background",
  "peekViewTitleLabel.foreground",
  "peekViewTitleDescription.foreground",
  "peekView.border",
  "peekViewResult.background",
  "peekViewResult.lineForeground",
  "peekViewResult.fileForeground",
  "peekViewResult.selectionBackground",
  "peekViewResult.selectionForeground",
  "peekViewEditor.background",
  "peekViewEditorGutter.background",
  "peekViewResult.matchHighlightBackground",
  "peekViewEditor.matchHighlightBackground",
  "peekViewEditor.matchHighlightBorder",
  "editorMarkerNavigationError.background",
  "editorMarkerNavigationWarning.background",
  "editorMarkerNavigationInfo.background",
  "editorMarkerNavigation.background",
  "editor.foldBackground",
  "editorGutter.foldingControlForeground",
  "editorSuggestWidget.background",
  "editorSuggestWidget.border",
  "editorSuggestWidget.foreground",
  "editorSuggestWidget.selectedForeground",
  "editorSuggestWidget.selectedIconForeground",
  "editorSuggestWidget.selectedBackground",
  "editorSuggestWidget.highlightForeground",
  "editorSuggestWidget.focusHighlightForeground",
];
