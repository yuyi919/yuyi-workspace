import * as vscode from "vscode";

export class CommandTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    //throw new Error("Method not implemented.");
    return element;
  }
  getChildren(/*element?: vscode.TreeItem*/): vscode.ProviderResult<any[]> {
    const elements: vscode.TreeItem[] = [];
    const treeExportPdf = new vscode.TreeItem("Export PDF");
    //const treeExportPdfDebug = new vscode.TreeItem("Export PDF with default name");
    const treeExportPdfCustom = new vscode.TreeItem("Export PDF with highlighted characters");
    const treeExportHtml = new vscode.TreeItem("Export HTML");
    treeExportPdf.tooltip = "Export live preview as .html document";
    const treeLivePreview = new vscode.TreeItem("Show live preview");
    const numberScenesOverwrite = new vscode.TreeItem("Number scenes - overwrite");
    numberScenesOverwrite.tooltip = "Replaces existing scene numbers.";
    const numberScenesUpdate = new vscode.TreeItem("Number scenes - update");
    numberScenesUpdate.tooltip =
      "Retains existing numbers as much as possible. Fills gaps and re-numbers moved scenes.";
    const statistics = new vscode.TreeItem("Calculate screenplay statistics");
    treeExportPdf.command = {
      command: "advscript.exportpdf",
      title: "",
    };
    /*treeExportPdfDebug.command = {
            command: 'advscript.exportpdfdebug',
            title: ''
        };*/
    treeExportPdfCustom.command = {
      command: "advscript.exportpdfcustom",
      title: "",
    };
    treeExportHtml.command = {
      command: "advscript.exporthtml",
      title: "",
    };
    treeLivePreview.command = {
      command: "advscript.livepreview",
      title: "",
    };
    treeLivePreview.command = {
      command: "advscript.livepreviewstatic",
      title: "",
    };
    numberScenesOverwrite.command = {
      command: "advscript.overwriteSceneNumbers",
      title: "",
    };
    numberScenesUpdate.command = {
      command: "advscript.updateSceneNumbers",
      title: "",
    };
    statistics.command = {
      command: "advscript.statistics",
      title: "",
    };
    elements.push(treeExportPdf);
    //	elements.push(treeExportPdfDebug);
    elements.push(treeExportPdfCustom);
    elements.push(treeExportHtml);
    elements.push(treeLivePreview);
    elements.push(numberScenesOverwrite);
    elements.push(numberScenesUpdate);
    elements.push(statistics);
    return elements;
  }
}
