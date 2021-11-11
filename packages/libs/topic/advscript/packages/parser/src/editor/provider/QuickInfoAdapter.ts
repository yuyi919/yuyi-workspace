import { Adapter, tagToString, displayPartsToString } from "./_util";
import { editor, languages, Position, CancellationToken } from "monaco-editor";
import { QuickInfo } from "typescript";

// --- hover ------

export class QuickInfoAdapter extends Adapter implements languages.HoverProvider {
  public async provideHover(
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken
  ): Promise<languages.Hover | undefined> {
    const resource = model.uri;
    const offset = model.getOffsetAt(position);
    const worker = await this._worker(resource);

    if (model.isDisposed()) {
      return;
    }

    const info: QuickInfo = await worker.getQuickInfoAtPosition(resource.toString(), offset);

    if (!info || model.isDisposed()) {
      return;
    }

    const documentation = displayPartsToString(info.documentation);
    const tags = info.tags ? info.tags.map((tag) => tagToString(tag)).join("  \n\n") : "";
    const contents = displayPartsToString(info.displayParts);
    return {
      range: this._textSpanToRange(model, info.textSpan),
      contents: [
        {
          value: "```typescript\n" + contents + "\n```\n",
        },
        {
          value: documentation + (tags ? "\n\n" + tags : ""),
        },
      ],
    };
  }
}
