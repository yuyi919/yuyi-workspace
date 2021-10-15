import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getEditor, activeDocument } from "../extension";
import { CoreConfig, getConfig } from "../configloader";
import { assetsPath } from "../utils";
import * as afterparser from "../afterwriting-parser";
import { retrieveScreenPlayStatistics } from "../statistics";

interface statisticsPanel {
  uri: string;
  panel: vscode.WebviewPanel;
  id: number;
}

export const statsPanels: statisticsPanel[] = [];

export function getStatisticsPanels(docuri: vscode.Uri): statisticsPanel[] {
  const selectedPanels: statisticsPanel[] = [];
  for (let i = 0; i < statsPanels.length; i++) {
    if (statsPanels[i].uri == docuri.toString()) selectedPanels.push(statsPanels[i]);
  }
  return selectedPanels;
}

export function updateDocumentVersion(docuri: vscode.Uri, version: number) {
  for (const panel of getStatisticsPanels(docuri)) {
    panel.panel.webview.postMessage({ command: "updateversion", version: version });
  }
}

export function removeStatisticsPanel(id: number) {
  for (let i = statsPanels.length - 1; i >= 0; i--) {
    if (statsPanels[i].id == id) {
      statsPanels.splice(i, 1);
    }
  }
}

export async function refreshPanel(
  statspanel: vscode.WebviewPanel,
  document: vscode.TextDocument,
  config: CoreConfig
) {
  statspanel.webview.postMessage({
    command: "updateversion",
    version: document.version,
    loading: true,
  });
  const parsed = afterparser.parse(document.getText(), config, false);
  const stats = await retrieveScreenPlayStatistics(document.getText(), parsed, config, undefined);
  statspanel.webview.postMessage({
    command: "updateStats",
    content: stats,
    version: document.version,
  });
}

export function createStatisticsPanel(editor: vscode.TextEditor): vscode.WebviewPanel {
  if (editor.document.languageId != "advscript") {
    vscode.window.showErrorMessage("You can only view statistics of advscript documents!");
    return undefined;
  }
  let statspanel: vscode.WebviewPanel;
  const presentstatsPanels = getStatisticsPanels(editor.document.uri);
  presentstatsPanels.forEach((p) => {
    if (p.uri == editor.document.uri.toString()) {
      //The stats panel already exists
      p.panel.reveal();
      statspanel = p.panel;
    }
  });

  if (statspanel == undefined) {
    //The stats panel didn't already exist
    const panelname = path.basename(editor.document.fileName).replace(".advscript", "");
    statspanel = vscode.window.createWebviewPanel(
      "advscript-statistics", // Identifies the type of the webview. Used internally
      panelname, // Title of the panel displayed to the user
      vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
      { enableScripts: true }
    );
  }
  loadWebView(editor.document.uri, statspanel);
  return statspanel;
}

async function loadWebView(docuri: vscode.Uri, statspanel: vscode.WebviewPanel) {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  statsPanels.push({ uri: docuri.toString(), panel: statspanel, id: id });

  const extensionpath = vscode.extensions.getExtension("yuyi919.vscode-advscript").extensionPath;

  const statsDir = path.join(extensionpath, "out/webviews/stats");
  const statsHtml = fs.readFileSync(path.join(statsDir, "index.html"), "utf8");
  
  const cssDiskPath = vscode.Uri.file(
    path.join(extensionpath, "node_modules", "vscode-codicons", "dist", "codicon.css")
  );

  statspanel.webview.html = statsHtml
    .replace("$CODICON_CSS$", statspanel.webview.asWebviewUri(cssDiskPath).toString())
    .replaceAll(
      "/$ROOTDIR$",
      statspanel.webview.asWebviewUri(vscode.Uri.file(statsDir)).toString()
    );

  let config = getConfig(docuri);
  statspanel.webview.postMessage({ command: "setstate", uri: docuri.toString() });
  statspanel.webview.postMessage({ command: "updateconfig", content: config });

  const editor = getEditor(activeDocument());
  config = getConfig(activeDocument());

  statspanel.webview.onDidReceiveMessage(async (message) => {
    if (message.command == "revealLine") {
      const sourceLine = message.content;
      let editor = getEditor(vscode.Uri.parse(message.uri));
      if (editor == undefined) {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
        editor = await vscode.window.showTextDocument(doc);
      } else {
        await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
      }
      if (editor && !Number.isNaN(sourceLine)) {
        editor.selection = new vscode.Selection(
          new vscode.Position(sourceLine, 0),
          new vscode.Position(sourceLine, 0)
        );
        editor.revealRange(
          new vscode.Range(sourceLine, 0, sourceLine + 1, 0),
          vscode.TextEditorRevealType.Default
        );
      }
    }
    if (message.command == "selectLines") {
      const startline = Math.floor(message.content.start);
      const endline = Math.floor(message.content.end);
      let editor = getEditor(vscode.Uri.parse(message.uri));
      if (editor == undefined) {
        const doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
        editor = await vscode.window.showTextDocument(doc);
      } else {
        await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
      }
      if (editor && !Number.isNaN(startline) && !Number.isNaN(endline)) {
        const startpos = new vscode.Position(startline, 0);
        const endpos = new vscode.Position(endline, editor.document.lineAt(endline).text.length);
        editor.selection = new vscode.Selection(startpos, endpos);
        editor.revealRange(new vscode.Range(startpos, endpos), vscode.TextEditorRevealType.Default);
        vscode.window.showTextDocument(editor.document);
      }
    }
    if (message.command == "saveUiPersistence") {
      //save ui persistence
    }
    if (message.command == "refresh") {
      refreshPanel(statspanel, editor.document, config);
    }
  });
  statspanel.onDidDispose(() => {
    removeStatisticsPanel(id);
  });

  refreshPanel(statspanel, editor.document, config);
}

vscode.workspace.onDidChangeConfiguration((change) => {
  if (change.affectsConfiguration("advscript")) {
    statsPanels.forEach((p) => {
      const config = getConfig(vscode.Uri.parse(p.uri));
      p.panel.webview.postMessage({ command: "updateconfig", content: config });
      p.panel.webview.postMessage({ command: "updateversion", version: -1 });
    });
  }
});

let previousCaretLine = 0;
let previousSelectionStart = 0;
let previousSelectionEnd = 0;

vscode.window.onDidChangeTextEditorSelection((change) => {
  let selection: vscode.Selection;
  if (change.textEditor.document.languageId == "advscript") selection = change.selections[0];
  statsPanels.forEach((p) => {
    if (p.uri == change.textEditor.document.uri.toString()) {
      if (selection.active.line != previousCaretLine) {
        previousCaretLine = selection.active.line;
        p.panel.webview.postMessage({
          command: "updatecaret",
          content: selection.active.line,
          linescount: change.textEditor.document.lineCount,
          source: "click",
        });
      }
      if (
        previousSelectionStart != selection.start.line ||
        previousSelectionEnd != selection.end.line
      ) {
        previousSelectionStart = selection.start.line;
        previousSelectionEnd = selection.end.line;
        p.panel.webview.postMessage({
          command: "updateselection",
          content: { start: selection.start.line, end: selection.end.line },
        });
      }
    }
  });
});

export class StatsPanelserializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    // `state` is the state persisted using `setState` inside the webview

    // Restore the content of our webview.
    //
    // Make sure we hold on to the `webviewPanel` passed in here and
    // also restore any event listeners we need on it.

    const docuri = vscode.Uri.parse(state.docuri);
    loadWebView(docuri, webviewPanel);
    //webviewPanel.webview.postMessage({ command: 'updateTitle', content: state.title_html });
    //webviewPanel.webview.postMessage({ command: 'updateScript', content: state.screenplay_html });
  }
}
