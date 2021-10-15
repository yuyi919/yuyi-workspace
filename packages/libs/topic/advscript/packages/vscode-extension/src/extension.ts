/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getConfig,
  changeUIPersistence,
  uiPersistence,
  initUIPersistence,
  ExportConfig,
} from "./configloader";
import { ExtensionContext, languages, TextDocument } from "vscode";
import * as vscode from "vscode";
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import {
  secondsToString,
  overwriteSceneNumbers,
  updateSceneNumbers,
  openFile,
  shiftScenes,
} from "./utils";
import * as telemetry from "./telemetry";

import { FoldingRangeProvider } from "./providers/Folding";
import { CompletionProvider } from "./providers/Completion";
import { SymbolProvider } from "./providers/Symbols";
import { showDecorations, clearDecorations } from "./providers/Decorations";

import {
  createPreviewPanel,
  previews,
  PreviewSerializer,
  getPreviewsToUpdate,
} from "./providers/Preview";
import {
  createStatisticsPanel,
  StatsPanelserializer,
  getStatisticsPanels,
  refreshPanel,
  updateDocumentVersion,
} from "./providers/Statistics";
import { OutlineTreeDataProvider } from "./providers/Outline";
import { performance } from "perf_hooks";
import { exportHtml } from "./providers/StaticHtml";
import { CommandTreeDataProvider } from "./CommandTreeDataProvider";

/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 */

function updateStatus(lengthAction: number, lengthDialogue: number): void {
  if (durationStatus != undefined) {
    if (activeDocument() != undefined) {
      durationStatus.show();
      //lengthDialogue is in syllables, lengthAction is in characters
      const durationDialogue = lengthDialogue;
      const durationAction = lengthAction;
      durationStatus.tooltip =
        "Dialogue: " +
        secondsToString(durationDialogue) +
        "\nAction: " +
        secondsToString(durationAction);
      //durationStatus.text = "charcount: " + (lengthAction)+"c"
      durationStatus.text = secondsToString(durationDialogue + durationAction);
    } else {
      durationStatus.hide();
    }
  }
}

let durationStatus: vscode.StatusBarItem;
const outlineViewProvider: OutlineTreeDataProvider = new OutlineTreeDataProvider();
const commandViewProvider: CommandTreeDataProvider = new CommandTreeDataProvider();
let lastShiftedParseId = "";

export const diagnosticCollection = languages.createDiagnosticCollection("advscript");
export const diagnostics: vscode.Diagnostic[] = [];

//return the relevant advscript document for the currently selected preview or text editor
export function activeDocument(): vscode.Uri {
  //first check if any previews have focus
  for (let i = 0; i < previews.length; i++) {
    if (previews[i].panel.active) return vscode.Uri.parse(previews[i].uri);
  }
  //no previews were active, is activeTextEditor a advscript document?
  if (
    vscode.window.activeTextEditor != undefined &&
    vscode.window.activeTextEditor.document.languageId == "advscript"
  ) {
    return vscode.window.activeTextEditor.document.uri;
  }
  //As a last resort, check if there are any visible advscript text editors
  for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    if (vscode.window.visibleTextEditors[i].document.languageId == "advscript")
      return vscode.window.visibleTextEditors[i].document.uri;
  }
  //all hope is lost
  return undefined;
}

export function getEditor(uri: vscode.Uri): vscode.TextEditor {
  //search visible text editors
  // console.log("Attempting to get editor ");
  // console.log(uri);
  for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
    if (vscode.window.visibleTextEditors[i].document.uri.toString() == uri.toString())
      return vscode.window.visibleTextEditors[i];
  }
  //the editor was not visible,
  return undefined;
}
export async function exportPdf(
  showSaveDialog: boolean = true,
  openFileOnSave: boolean = false,
  highlightCharacters = false
) {
  const canceled = false;
  if (canceled) return;
  const editor = getEditor(activeDocument());

  const config = getConfig(activeDocument());
  telemetry.reportTelemetry("command:advscript.exportpdf");

  const parsed = await afterparser.parse(editor.document.getText(), config, false);

  const exportconfig: ExportConfig = { highlighted_characters: [] };
  let filename = editor.document.fileName.replace(/(\.(avs|spmd|txt))$/, ""); //screenplay.advscript -> screenplay
  if (highlightCharacters) {
    const highlighted_characters = await vscode.window.showQuickPick(
      Array.from(parsed.properties.characters.keys()),
      { canPickMany: true }
    );
    exportconfig.highlighted_characters = highlighted_characters;

    if (highlighted_characters.length > 0) {
      const filenameCharacters = [...highlighted_characters]; //clone array
      if (filenameCharacters.length > 3) {
        filenameCharacters.length = 3;
        filenameCharacters.push("+" + (highlighted_characters.length - 3)); //add "+n" if there's over 3 highlighted characters
      }
      filename += "(" + filenameCharacters.map((v) => v.replace(" ", "")).join(",") + ")"; //remove spaces from names and join
    }
  }
  filename += ".pdf"; //screenplay -> screenplay.pdf

  const saveuri = vscode.Uri.file(filename);
  let filepath: vscode.Uri = undefined;
  if (showSaveDialog) {
    filepath = await vscode.window.showSaveDialog({
      filters: { "PDF File": ["pdf"] },
      defaultUri: saveuri,
    });
  } else {
    filepath = saveuri;
  }
  if (filepath == undefined) return;
  vscode.window.withProgress(
    { title: "Exporting PDF...", location: vscode.ProgressLocation.Notification },
    async (progress) => {
      GeneratePdf(filepath.fsPath, config, exportconfig, parsed, progress);
    }
  );
  if (openFileOnSave) {
    openFile(filepath.fsPath);
  }
}

export function activate(context: ExtensionContext) {
  //Init telemetry
  telemetry.initTelemetry();

  //Register for outline tree view
  vscode.window.registerTreeDataProvider("advscript-outline", outlineViewProvider);
  outlineViewProvider.treeView = vscode.window.createTreeView("advscript-outline", {
    treeDataProvider: outlineViewProvider,
    showCollapseAll: true,
  });

  //Register command tree view
  vscode.window.registerTreeDataProvider("advscript-commands", outlineViewProvider);
  vscode.window.createTreeView("advscript-commands", { treeDataProvider: commandViewProvider });

  //Register for line duration length
  durationStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(durationStatus);

  //Register for live preview (dynamic)
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.livepreview", () => {
      // Create and show a new dynamic webview for the active text editor
      createPreviewPanel(vscode.window.activeTextEditor, true);
      telemetry.reportTelemetry("command:advscript.livepreview");
    })
  );
  //Register for live preview (static)
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.livepreviewstatic", () => {
      // Create and show a new dynamic webview for the active text editor
      createPreviewPanel(vscode.window.activeTextEditor, false);
      telemetry.reportTelemetry("command:advscript.livepreviewstatic");
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.statistics", async () => {
      createStatisticsPanel(getEditor(activeDocument()));
    })
  );

  //Jump to line command
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.jumpto", (args) => {
      const editor = getEditor(activeDocument());
      const range = editor.document.lineAt(Number(args)).range;
      editor.selection = new vscode.Selection(range.start, range.start);
      editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
      //If live screenplay is visible scroll to it with
      if (getConfig(editor.document.uri).synchronized_markup_and_preview) {
        previews.forEach((p) => {
          if (p.uri == editor.document.uri.toString())
            p.panel.webview.postMessage({ command: "scrollTo", content: args });
        });
      }
      telemetry.reportTelemetry("command:advscript.jumpto");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.exportpdf", async () => exportPdf())
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.exportpdfdebug", async () => exportPdf(false, true))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.exportpdfcustom", async () =>
      exportPdf(true, false, true)
    )
  );
  context.subscriptions.push(vscode.commands.registerCommand("advscript.exporthtml", exportHtml));
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.overwriteSceneNumbers", overwriteSceneNumbers)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.updateSceneNumbers", updateSceneNumbers)
  );

  initUIPersistence(); //create the ui persistence save file
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.outline.visibleitems", () => {
      const quickpick = vscode.window.createQuickPick();
      quickpick.canSelectMany = true;

      quickpick.items = [
        {
          alwaysShow: true,
          label: "Notes",
          detail: "[[Text enclosed between two brackets]]",
          picked: uiPersistence.outline_visibleNotes,
        },
        {
          alwaysShow: true,
          label: "Synopses",
          detail: "= Any line which starts like this",
          picked: uiPersistence.outline_visibleSynopses,
        },
        {
          alwaysShow: true,
          label: "Sections",
          detail: "# Sections begin with one or more '#'",
          picked: uiPersistence.outline_visibleSections,
        },
        {
          alwaysShow: true,
          label: "Scenes",
          detail:
            "Any line starting with INT. or EXT. is a scene. Can also be forced by starting a line with '.'",
          picked: uiPersistence.outline_visibleScenes,
        },
      ];
      quickpick.selectedItems = quickpick.items.filter((item) => item.picked);
      quickpick.onDidChangeSelection((e) => {
        let visibleScenes = false;
        let visibleSections = false;
        let visibleSynopses = false;
        let visibleNotes = false;
        for (let i = 0; i < e.length; i++) {
          if (e[i].label == "Notes") visibleNotes = true;
          if (e[i].label == "Scenes") visibleScenes = true;
          if (e[i].label == "Sections") visibleSections = true;
          if (e[i].label == "Synopses") visibleSynopses = true;
        }
        changeUIPersistence("outline_visibleNotes", visibleNotes);
        changeUIPersistence("outline_visibleScenes", visibleScenes);
        changeUIPersistence("outline_visibleSections", visibleSections);
        changeUIPersistence("outline_visibleSynopses", visibleSynopses);
        outlineViewProvider.update();
      });
      quickpick.show();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.outline.reveal", () => {
      outlineViewProvider.reveal();
      telemetry.reportTelemetry("command:advscript.outline.reveal");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.debugtokens", () => {
      const uri = activeDocument();
      const advscript = getEditor(uri).document.getText();
      vscode.workspace
        .openTextDocument({ language: "json" })
        .then((doc) => vscode.window.showTextDocument(doc))
        .then((editor) => {
          const editBuilder = (textEdit: vscode.TextEditorEdit) => {
            textEdit.insert(
              new vscode.Position(0, 0),
              JSON.stringify(afterparser.parse(advscript, getConfig(uri), false), null, 4)
            );
          };
          return editor.edit(editBuilder, {
            undoStopBefore: true,
            undoStopAfter: false,
          });
        });
    })
  );

  const shiftScenesUpDn = (direction: number) => {
    const editor = getEditor(activeDocument());
    const parsed = parsedDocuments.get(editor.document.uri.toString());

    /* prevent the shiftScenes() being processed again before the document is reparsed from the previous 
      shiftScenes() (like when holding down the command key) so the selection doesn't slip */
    if (lastShiftedParseId == parsed.parseTime + "_" + direction) return;

    shiftScenes(editor, parsed, direction);
    telemetry.reportTelemetry("command:advscript.shiftScenes");
    lastShiftedParseId = parsed.parseTime + "_" + direction;
  };
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.shiftScenesUp", () => shiftScenesUpDn(-1))
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("advscript.shiftScenesDown", () => shiftScenesUpDn(1))
  );

  vscode.workspace.onWillSaveTextDocument((e) => {
    const config = getConfig(e.document.uri);
    if (config.number_scenes_on_save === true) {
      overwriteSceneNumbers();
    }
  });

  registerTyping();

  //Setup custom folding mechanism
  languages.registerFoldingRangeProvider(
    { scheme: "file", language: "advscript" },
    new FoldingRangeProvider()
  );

  //Setup autocomplete
  languages.registerCompletionItemProvider(
    { scheme: "file", language: "advscript" },
    new CompletionProvider(),
    "\n",
    "-",
    " "
  );

  //Setup symbols (outline)
  languages.registerDocumentSymbolProvider(
    { scheme: "file", language: "advscript" },
    new SymbolProvider()
  );

  //parse the document
  if (vscode.window.activeTextEditor?.document?.languageId === "advscript")
    parseDocument(vscode.window.activeTextEditor.document);

  vscode.window.registerWebviewPanelSerializer("advscript-preview", new PreviewSerializer());
  vscode.window.registerWebviewPanelSerializer("advscript-statistics", new StatsPanelserializer());
}

let disposeTyping: vscode.Disposable;
function registerTyping() {
  try {
    const config = getConfig(activeDocument());
    if (config.parenthetical_newline_helper) {
      // type命令实现有问题,先注释掉了
      // disposeTyping = vscode.commands.registerCommand("type", (args) => {
      //   // Automatically skip to the next line at the end of parentheticals
      //   if (args.text == "\n") {
      //     const editor = vscode.window.activeTextEditor;
      //     if (editor.selection.isEmpty) {
      //       const position = editor.selection.active;
      //       const linetext = editor.document.getText(
      //         new vscode.Range(
      //           new vscode.Position(position.line, 0),
      //           new vscode.Position(position.line, 256)
      //         )
      //       );
      //       if (position.character == linetext.length - 1) {
      //         if (
      //           linetext.match(/^\s*\(.*\)$/g) ||
      //           linetext.match(/^\s*((([A-Z0-9 ]+|@.*)(\([A-z0-9 '\-.()]+\))+|)$)/)
      //         ) {
      //           const newpos = new vscode.Position(position.line, linetext.length);
      //           editor.selection = new vscode.Selection(newpos, newpos);
      //         }
      //       }
      //     }
      //     vscode.commands.executeCommand("default:type", {
      //       text: args.text,
      //     });
      //   }
      // });
    }
  } catch {
    // const moreDetails = "More details";
    // const openGithub1 = "View issue on vscode repo";
    // vscode.window
    //   .showInformationMessage(
    //     "Conflict with another extension! The 'type' command for vscode can only be registered by a single extension. You may want to disable the 'Parenthetical New Line Helper' setting in order to avoid further conflicts from BetterFountain",
    //     moreDetails,
    //     openGithub1
    //   )
    //   .then((val) => {
    //     switch (val) {
    //       case moreDetails: {
    //         vscode.env.openExternal(
    //           vscode.Uri.parse("https://github.com/piersdeseilligny/betterfountain/issues/84")
    //         );
    //         break;
    //       }
    //       case openGithub1: {
    //         vscode.env.openExternal(
    //           vscode.Uri.parse("https://github.com/Microsoft/vscode/issues/13441")
    //         );
    //         break;
    //       }
    //     }
    //   });
  }
}

vscode.workspace.onDidChangeTextDocument((change) => {
  if (change.document.languageId == "advscript") {
    parseDocument(change.document);
    updateDocumentVersion(change.document.uri, change.document.version);
  }
});

vscode.workspace.onDidChangeConfiguration((change) => {
  if (change.affectsConfiguration("advscript.general.parentheticalNewLineHelper")) {
    const config = getConfig(activeDocument());
    if (disposeTyping) disposeTyping.dispose();
    if (config.parenthetical_newline_helper) {
      registerTyping();
    }
  }
});

//var lastFountainDocument:TextDocument;
export const parsedDocuments = new Map<string, afterparser.parseoutput>();
let lastParsedUri = "";

export function activeParsedDocument(): afterparser.parseoutput {
  const texteditor = getEditor(activeDocument());
  if (texteditor) {
    return parsedDocuments.get(texteditor.document.uri.toString());
  } else {
    return parsedDocuments.get(lastParsedUri);
  }
}

export class StructureProperties {
  scenes: { scene: number; line: number }[];
  sceneLines: number[];
  sceneNames: string[];
  titleKeys: string[];
  firstTokenLine: number;
  fontLine: number;
  lengthAction: number; //Length of the action character count
  lengthDialogue: number; //Length of the dialogue character count
  characters: Map<string, number[]>;
}

let fontTokenExisted: boolean = false;
const decortypesDialogue = vscode.window.createTextEditorDecorationType({});

let parseTelemetryLimiter = 5;
const parseTelemetryFrequency = 5;

export function parseDocument(document: TextDocument) {
  const t0 = performance.now();

  clearDecorations();

  const previewsToUpdate = getPreviewsToUpdate(document.uri);
  const souceCode = document.getText();
  const output = afterparser.parse(souceCode, getConfig(document.uri), previewsToUpdate.length > 0);

  if (previewsToUpdate) {
    //lastDocument = document;
    for (let i = 0; i < previewsToUpdate.length; i++) {
      previewsToUpdate[i].panel.webview.postMessage({
        command: "updateTitle",
        content: output.titleHtml,
      });
      previewsToUpdate[i].panel.webview.postMessage({
        command: "updateScript",
        content: output.scriptHtml,
      });

      if (previewsToUpdate[i].dynamic) {
        previewsToUpdate[i].uri = document.uri.toString();
        previewsToUpdate[i].panel.webview.postMessage({
          command: "setstate",
          uri: previewsToUpdate[i].uri,
        });
      }
    }
  }
  lastParsedUri = document.uri.toString();
  parsedDocuments.set(lastParsedUri, output);
  let tokenlength = 0;
  const decorsDialogue: vscode.DecorationOptions[] = [];
  tokenlength = 0;
  parsedDocuments.get(document.uri.toString()).properties.titleKeys = [];
  let fontTokenExists = false;
  while (tokenlength < output.title_page.length) {
    if (
      output.title_page[tokenlength].type == "font" &&
      output.title_page[tokenlength].text.trim() != ""
    ) {
      parsedDocuments.get(document.uri.toString()).properties.fontLine =
        output.title_page[tokenlength].line;
      const fontname = output.title_page[tokenlength].text;
      previewsToUpdate.forEach((p) => {
        p.panel.webview.postMessage({ command: "updateFont", content: fontname });
      });
      fontTokenExists = true;
      fontTokenExisted = true;
    }
    tokenlength++;
  }
  if (!fontTokenExists && fontTokenExisted) {
    previewsToUpdate.forEach((p) => {
      p.panel.webview.postMessage({ command: "removeFont" });
    });
    fontTokenExisted = false;
    diagnosticCollection.set(document.uri, []);
  }
  const editor = getEditor(document.uri);
  if (editor) editor.setDecorations(decortypesDialogue, decorsDialogue);

  if (document.languageId == "advscript") outlineViewProvider.update();
  updateStatus(output.lengthAction, output.lengthDialogue);
  showDecorations(document.uri);

  const t1 = performance.now();
  const parseTime = t1 - t0;
  console.info("parsed in " + parseTime);
  if (parseTelemetryLimiter == parseTelemetryFrequency) {
    telemetry.reportTelemetry("afterparser.parsing", undefined, {
      linecount: document.lineCount,
      parseduration: parseTime,
    });
  }
  parseTelemetryLimiter--;
  if (parseTelemetryLimiter == 0) parseTelemetryLimiter = parseTelemetryFrequency;
}

vscode.window.onDidChangeActiveTextEditor((change) => {
  if (change == undefined || change.document == undefined) return;
  if (change.document.languageId == "advscript") {
    parseDocument(change.document);
    /*if(previewpanels.has(change.document.uri.toString())){
      var preview = previewpanels.get(change.document.uri.toString());
      if(!preview.visible && preview.viewColumn!=undefined)
        preview.reveal(preview.viewColumn);
    }*/
  }
});

vscode.workspace.onDidSaveTextDocument((e) => {
  if (e.languageId !== "advscript") return;
  const config = getConfig(e.uri);
  if (config.refresh_stats_on_save) {
    const statsPanel = getStatisticsPanels(e.uri);
    for (const sp of statsPanel) {
      refreshPanel(sp.panel, e, config);
    }
  }
});

vscode.workspace.onDidCloseTextDocument((e) => {
  parsedDocuments.delete(e.uri.toString());
});
