import { monaco } from "../monaco.export";
// const decortype_DialogueNumbers = vscode.window.createTextEditorDecorationType({});

export class DecorationProvider<T> {
  decorations: monaco.editor.IModelDeltaDecoration[] = [];
  oldIds: string[];

  clear() {
    this.decorations = [];
  }

  add(decoration: monaco.editor.IModelDeltaDecoration) {
    this.decorations.push(decoration);
  }

  add2(range: monaco.Range, options: monaco.editor.IModelDecorationOptions) {
    this.decorations.push({ range, options });
  }

  delta(editor: monaco.editor.ITextModel) {
    this.oldIds = editor.deltaDecorations(this.oldIds, this.decorations);
  }
}

// export let DialogueNumbers: monaco.editor.IModelDeltaDecoration[] = [];
// const provider = new DecorationProvider()

// export function AddDialogueNumberDecoration(thistoken: token) {
//   const decrange = new vscode.Range(
//     new vscode.Position(thistoken.line, 0),
//     new vscode.Position(thistoken.line, thistoken.text.length)
//   );
//   DialogueNumbers.push({
//     range: decrange,
//     renderOptions: {
//       before: {
//         contentText: thistoken.takeNumber.toString() + " - ",
//         textDecoration: ";opacity:0.5;",
//         color: new vscode.ThemeColor("editor.foreground"),
//       },
//     },
//   });
// }
// export function clearDecorations() {
//   provider.clear()
//   // DialogueNumbers = [];
// }
// export function showDecorations(vscode: string) {
//   provider.delta(editor)
//   // getEditor(vscode).setDecorations(decortype_DialogueNumbers, DialogueNumbers);
// }
