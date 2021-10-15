import * as fs from "fs";
import * as vscode from "vscode";
import * as afterparser from "../afterwriting-parser";
import { getConfig } from "../configloader";
import {
  courierprimeB64,
  courierprimeB64_bold,
  courierprimeB64_bolditalic,
  courierprimeB64_italic,
} from "../courierprime";
import { activeDocument, getEditor } from "../extension";
import { openFile, revealFile } from "../utils";

export async function exportHtml() {
  const editor = getEditor(activeDocument());
  const filename = editor.document.fileName.replace(/(\.(avs|spmd|txt))$/, "");
  const saveuri = vscode.Uri.file(filename);
  const filepath = await vscode.window.showSaveDialog({
    filters: { "HTML File": ["html"] },
    defaultUri: saveuri,
  });
  const fountainconfig = getConfig(editor.document.uri);
  const output = afterparser.parse(editor.document.getText(), fountainconfig, true);
  const htmlpath = require.resolve("../../assets/staticexport.html"); // __filename + "/../../../assets/staticexport.html";
  let rawhtml = fs.readFileSync(htmlpath, "utf8");

  let pageClasses = "innerpage";
  if (fountainconfig.scenes_numbers == "left") pageClasses = "innerpage numberonleft";
  else if (fountainconfig.scenes_numbers == "right") pageClasses = "innerpage numberonright";
  else if (fountainconfig.scenes_numbers == "both")
    pageClasses = "innerpage numberonleft numberonright";

  rawhtml = rawhtml.replace("$SCRIPTCLASS$", pageClasses);

  rawhtml = rawhtml
    .replace("$COURIERPRIME$", courierprimeB64)
    .replace("$COURIERPRIME-BOLD$", courierprimeB64_bold)
    .replace("$COURIERPRIME-ITALIC$", courierprimeB64_italic)
    .replace("$COURIERPRIME-BOLD-ITALIC$", courierprimeB64_bolditalic);

  if (output.titleHtml) {
    rawhtml = rawhtml.replace("$TITLEPAGE$", output.titleHtml);
  } else {
    rawhtml = rawhtml.replace("$TITLEDISPLAY$", "hidden");
  }
  rawhtml = rawhtml.replace("$SCREENPLAY$", output.scriptHtml);
  fs.writeFile(filepath.fsPath, rawhtml, (err) => {
    if (err) {
      vscode.window.showErrorMessage("Failed to export HTML: " + err.message);
    } else {
      const open = "Open";
      let reveal = "Reveal in File Explorer";
      if (process.platform == "darwin") reveal = "Reveal in Finder";
      vscode.window
        .showInformationMessage("Exported HTML Succesfully!", open, reveal)
        .then((val) => {
          switch (val) {
            case open: {
              openFile(filepath.fsPath);
              break;
            }
            case reveal: {
              revealFile(filepath.fsPath);
              break;
            }
          }
        });
    }
  });
}
