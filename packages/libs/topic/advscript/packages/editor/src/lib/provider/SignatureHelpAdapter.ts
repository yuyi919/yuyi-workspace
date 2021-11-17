import { Adapter, displayPartsToString } from "./_util";
import { editor, languages, Position, CancellationToken } from "../monaco.export";

export class SignatureHelpAdapter extends Adapter implements languages.SignatureHelpProvider {
  public signatureHelpTriggerCharacters = ["(", ","];

  private static _toSignatureHelpTriggerReason(
    context: languages.SignatureHelpContext
  ): ts.SignatureHelpTriggerReason {
    switch (context.triggerKind) {
      case languages.SignatureHelpTriggerKind.TriggerCharacter:
        if (context.triggerCharacter) {
          if (context.isRetrigger) {
            return { kind: "retrigger", triggerCharacter: context.triggerCharacter as any };
          } else {
            return { kind: "characterTyped", triggerCharacter: context.triggerCharacter as any };
          }
        } else {
          return { kind: "invoked" };
        }

      case languages.SignatureHelpTriggerKind.ContentChange:
        return context.isRetrigger ? { kind: "retrigger" } : { kind: "invoked" };

      case languages.SignatureHelpTriggerKind.Invoke:
      default:
        return { kind: "invoked" };
    }
  }

  public async provideSignatureHelp(
    model: editor.ITextModel,
    position: Position,
    token: CancellationToken,
    context: languages.SignatureHelpContext
  ): Promise<languages.SignatureHelpResult | undefined> {
    const resource = model.uri;
    const offset = model.getOffsetAt(position);
    const worker = await this._worker(resource);

    if (model.isDisposed()) {
      return;
    }

    const info = await worker.getSignatureHelpItems(resource.toString(), offset, {
      triggerReason: SignatureHelpAdapter._toSignatureHelpTriggerReason(context),
    });

    if (!info || model.isDisposed()) {
      return;
    }

    const ret: languages.SignatureHelp = {
      activeSignature: info.selectedItemIndex,
      activeParameter: info.argumentIndex,
      signatures: [],
    };

    info.items.forEach((item) => {
      const signature: languages.SignatureInformation = {
        label: "",
        parameters: [],
      };

      signature.documentation = {
        value: displayPartsToString(item.documentation),
      };
      signature.label += displayPartsToString(item.prefixDisplayParts);
      item.parameters.forEach((p, i, a) => {
        const label = displayPartsToString(p.displayParts);
        const parameter: languages.ParameterInformation = {
          label: label,
          documentation: {
            value: displayPartsToString(p.documentation),
          },
        };
        signature.label += label;
        signature.parameters.push(parameter);
        if (i < a.length - 1) {
          signature.label += displayPartsToString(item.separatorDisplayParts);
        }
      });
      signature.label += displayPartsToString(item.suffixDisplayParts);
      ret.signatures.push(signature);
    });

    return {
      value: ret,
      dispose() {},
    };
  }
}
