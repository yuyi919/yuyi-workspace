import * as langium from "langium";
import { LspTypes } from "../_lsp";
import * as lsp from "../_lsp";
import * as utils from "../_utils";
import { CompletionProvider } from "./CompletionProvider";
import { findLeafNodeAtOffset } from "langium";

export function sortWithSortText(a: LspTypes.CompletionItem, b: LspTypes.CompletionItem): number {
  if (typeof a.sortText === "string" && typeof b.sortText === "string") {
    return a.sortText.localeCompare(b.sortText);
  }
  // 含有sortText的权重的一方将被推到顶端
  // @ts-ignore
  return !a.sortText - !b.sortText; // 利用隐式转换, true: 1, false: 0，等同于（!!b.sortText - !!a.sortText）
}
export class CompletionProviderContext {
  constructor(private root: CompletionProvider) {}
  document!: langium.LangiumDocument;
  completionItemData!: CompletionItemData;
  items: CompletionItemType[] = [];
  refs: CompletionItemType[] = [];
  cursorNode: langium.CstNode;
  triggerNode: langium.CstNode;
  cursorOffset: number;
  triggerOffset: number;
  strict: boolean;

  get context() {
    return this.completionItemData.context;
  }
  session?: CompletionSession;

  acceptor = (
    value: string | langium.AstNode | langium.AstNodeDescription,
    item?: Partial<CompletionItemType>
  ) => {
    const completionItem = this.fillCompletionItem(
      this.document.textDocument,
      this.triggerOffset,
      value,
      {
        ...item,
        data: this.completionItemData,
      }
    );
    if (completionItem) {
      // console.log(completionItem, value, item);
      this.items.push(completionItem);
    }
  };
  acceptorRef = (
    value: string | langium.AstNode | langium.AstNodeDescription,
    item?: Partial<CompletionItemType>
  ) => {
    const completionItem = this.fillCompletionItem(
      this.document.textDocument,
      this.triggerOffset,
      value,
      {
        ...item,
        data: this.completionItemData,
      }
    );
    if (completionItem) {
      // console.log(completionItem, value, item);
      this.refs.push(completionItem);
    }
  };

  flush() {
    const items = this.items.splice(0).filter(Boolean).sort(sortWithSortText);
    const refs = this.refs.splice(0).filter(Boolean).sort(sortWithSortText);
    // if (this.currentContext.isEOLTrigger()) {
    //   items.unshift({
    //     label: "\n",
    //     insertText: "${1:}",
    //     kind: _lsp.CompletionItemKind.Text,
    //     data: this.currentContext.completionItemData,
    //     insertTextFormat: _lsp.InsertTextFormat.Snippet,
    //     commitCharacters: ["\n"],
    //     sortText: "0",
    //     command: {
    //       title: "command",
    //       command: _lsp.COMMAND_ID.TriggerParameterHints,
    //     },
    //   });
    // }
    return refs.concat(items);
  }
  async flushInline() {
    const refs = this.refs.splice(0).filter(Boolean).sort(sortWithSortText);
    // if (this.currentContext.isEOLTrigger()) {
    //   items.unshift({
    //     label: "\n",
    //     insertText: "${1:}",
    //     kind: _lsp.CompletionItemKind.Text,
    //     data: this.currentContext.completionItemData,
    //     insertTextFormat: _lsp.InsertTextFormat.Snippet,
    //     commitCharacters: ["\n"],
    //     sortText: "0",
    //     command: {
    //       title: "command",
    //       command: _lsp.COMMAND_ID.TriggerParameterHints,
    //     },
    //   });
    // }
    return Promise.all(
      refs.map((item) => this.resolveCompletionItem(item as CompletionItemType, this.triggerOffset))
    );
  }
  getReferenceName(value: langium.AstNode | langium.AstNodeDescription) {
    let label: string;
    // label = label.replace(/(.*?\(.+\))/g, "")
    let prefix: string;
    if (langium.isAstNode(value) && this.root.nameProvider.isNamed(value)) {
      label = this.root.nameProvider.getName(value);
    } else if (!langium.isAstNode(value)) {
      label = value.name;
    }
    if (label) {
      label = label.replace(/^(.*?\(.+\))/g, (_, replace: string) => {
        prefix = replace.replace(/\(((?!\)).)*?\)$/, "");
        return "";
      });
      return { label, prefix };
    }
  }
  fillCompletionItem(
    document: LspTypes.TextDocument,
    offset: number,
    value: string | langium.AstNode | langium.AstNodeDescription,
    info: Partial<CompletionItemType>
  ): CompletionItemType | undefined {
    console.groupCollapsed("fillCompletionItem", value, info);
    try {
      const result = this._fillCompletionItem(document, offset, value, info);
      console.log("fillCompletionItem end", result);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
  _fillCompletionItem(
    document: LspTypes.TextDocument,
    offset: number,
    value: string | langium.AstNode | langium.AstNodeDescription,
    info: Partial<CompletionItemType>
  ): CompletionItemType | undefined {
    let label: string, prefix: string;
    // if (info?.label) {
    //   label = info.label;
    // } else
    if (typeof value === "string") {
      label = value;
    } else {
      ({ label, prefix } = this.getReferenceName(value));
    }
    if (label === "？？？") {
      console.log(
        "buildCompletionTextEdit",
        label,
        this.context.invokeText,
        this.cursorNode.offset,
        this.cursorNode.end
      );
    }
    const textEdit = this.buildCompletionTextEdit(document, offset, label);
    if (!textEdit) {
      globalThis.currentDocument = document;
      console.log("empty", textEdit, offset, label);
      return undefined;
    }
    const item = {
      label: info?.label || (prefix || "") + label,
      textEdit,
      documentation: "documentation",
      filterText: (prefix || "") + label,
    } as CompletionItemType;
    if (info) {
      Object.assign(item, info);
    }

    // 修正
    const {
      range: {
        start: { line: startLine, character: startCharacter },
        end: { line: endLine, character: endCharacter },
      },
    } = textEdit as LspTypes.TextEdit;
    // item.additionalTextEdits = [
    //   ...(item.additionalTextEdits || []),
    //   {
    //     newText: "",
    //     range: {
    //       start: textEdit.range.end,
    //       end: { ...textEdit.range.end, character: textEdit.range.end.character + 1 },
    //     },
    //   },
    // ];
    // const triggerpos = document.positionAt(this.triggerOffset);
    // if (
    //   item.kind === lsp.CompletionItemKind.Snippet &&
    //   startLine === endLine &&
    //   startCharacter === endCharacter &&
    //   this.context.invokeText !== "" &&
    //   // ||
    //   // startCharacter === triggerpos.character ||
    //   // endCharacter === triggerpos.character
    //   (!this.context.triggerCharacter || !this.isEOLTrigger())
    // ) {
    //   return;
    // }
    return item;
  }

  isEOLTrigger() {
    const { triggerCharacter } = this.context;
    return this.isEOLCharacter(triggerCharacter);
  }
  isEOLCharacter(triggerCharacter: string) {
    return triggerCharacter === "\n" || triggerCharacter === "\r";
  }
  isWSCharacter(triggerCharacter: string) {
    return this.isEOLCharacter(triggerCharacter) || triggerCharacter === " ";
  }
  isKeywordTrigger() {
    const { triggerKind } = this.context;
    const { CompletionTriggerKind } = lsp;
    return (
      triggerKind === CompletionTriggerKind.TriggerCharacter ||
      triggerKind === CompletionTriggerKind.TriggerForIncompleteCompletions
    );
  }

  protected buildCompletionTextEdit(
    document: LspTypes.TextDocument,
    pos: number,
    completion: string
  ): LspTypes.TextEdit | undefined {
    const content = document.getText();
    const offsets = this._buildCompletionTextEdit(content, pos, completion);
    if (offsets) {
      const start = document.positionAt(pos - offsets.left);
      const end = document.positionAt(pos + offsets.right);
      return {
        newText: completion,
        range: {
          start,
          end,
        },
      };
    }
  }

  protected _buildCompletionTextEdit(content: string, offset: number, completion: string) {
    let negativeOffset = 0;
    let negativeOffsetRight = 0;
    const contentLowerCase = content.toLowerCase();
    const completionLowerCase = completion.toLowerCase();
    for (let i = completionLowerCase.length; i > 0; i--) {
      const contentLowerCaseSub = contentLowerCase.substring(offset - i, offset);
      if (
        completionLowerCase.startsWith(contentLowerCaseSub)
        // && (i === 1 || !this.isWordCharacterAt(contentLowerCase, offset - i - 1))
      ) {
        negativeOffset = i;
        const length = completionLowerCase.length;
        // if (!this.strict)
        for (let subIndex = length - 1; subIndex > -1; subIndex--) {
          const char = completionLowerCase[subIndex];
          const right = length - (subIndex + 1);
          const charInContent = contentLowerCase[offset + right];
          if (char !== charInContent) {
            negativeOffsetRight = right;
            break;
          }
        }
        break;
      }
    }
    console.log(this.session, this.context);
    // if (
    //   negativeOffset > 0 ||
    //   offset === 0 ||
    //   !this.isWordCharacterAt(completion, 0) ||
    //   !this.isWordCharacterAt(content, offset - 1) ||
    //   this.context.triggerKind !== lsp.CompletionTriggerKind.TriggerForIncompleteCompletions
    // ) {
    return {
      left: negativeOffset,
      right: negativeOffsetRight,
    };
    // }
  }

  protected isWordCharacterAt(content: string, index: number): boolean {
    return this.strict || /\w/.test(content.charAt(index));
  }

  async resolveCompletionItem(item: CompletionItemType, offset: number) {
    console.groupCollapsed("resolveCompletionItem", item.label);
    console.log(item);
    const { context } = item.data;
    // if (context.triggerKind !== _lsp.CompletionTriggerKind.TriggerCharacter) {
    const { textEdit } = item as { textEdit: LspTypes.TextEdit };
    const { range, newText } = textEdit;
    const invokeText = context.invokeText; // ?? getInvokeText?.();
    console.log("ResolveInputNode", JSON.stringify(invokeText));
    if (
      invokeText &&
      item.kind !== lsp.CompletionItemKind.Keyword &&
      newText.toLowerCase().indexOf(invokeText.toLowerCase()) !== 0
    ) {
      console.log("replace matched text", invokeText);
      if (this.strict) {
        console.log("buildReplace");
        textEdit.range = this.buildReplace(range, invokeText.length);
      } else {
        console.log("buildDelete");
        item.additionalTextEdits = [
          ...(item.additionalTextEdits || []),
          {
            newText: "",
            range: this.buildDelete(range, invokeText.length),
          },
        ];
        range.end = range.start;
      }
    }
    // }
    console.groupEnd();
    return item;
  }

  protected buildDelete(range: LspTypes.Range, length: number = 0): LspTypes.Range | undefined {
    return {
      start: {
        line: range.start.line,
        character: range.start.character - (length - (range.end.character - range.start.character)),
      },
      end: range.start,
    };
  }

  protected buildReplace(range: LspTypes.Range, length: number = 0): LspTypes.Range | undefined {
    return {
      start: {
        line: range.start.line,
        character: range.start.character - (length - (range.end.character - range.start.character)),
      },
      end: range.end,
    };
  }

  setup(document: langium.LangiumDocument, params: LspTypes.CompletionParams, strict?: boolean) {
    this.items = [];
    this.refs = [];
    const itemData: CompletionItemType["data"] = {
      ...params,
      context: {
        ...params.context,
        invokeText: undefined,
      },
    };
    this.document = document;
    this.completionItemData = itemData;
    this.strict = strict || false;

    const root = document.parseResult.value;
    const cst = root.$cstNode;
    const triggerOffset = document.textDocument.offsetAt(params.position);
    if (cst) {
      const cursorOffset = triggerOffset - 1;
      const { node, inputNode } = utils.findInputNode(cst, triggerOffset);
      const { context } = itemData;
      let session = this.session;
      if (context.triggerKind === lsp.CompletionTriggerKind.Invoked) {
        if (
          inputNode.feature?.$type === langium.CrossReference &&
          inputNode.end === triggerOffset
        ) {
          context.invokeText = inputNode.text;
          session = {
            activedOffsetStart: inputNode.offset,
            activeOffset: inputNode.end,
            activedText: context.triggerCharacter,
            triggerCharacter: context.triggerCharacter,
          };
        } else {
          context.invokeText = "";
          if (session) {
            // 持续维护activedText和triggerOffset
            if (triggerOffset === session.activeOffset + 1) {
              session.activeOffset = triggerOffset;
              const invokeText = document.textDocument.getText({
                start: document.textDocument.positionAt(session.activedOffsetStart),
                end: document.textDocument.positionAt(triggerOffset),
              });
              session.activedText = session.activedText = session.triggerCharacter + invokeText;
            } else {
              session = null;
            }
          }
        }
        // console.log("invokeText", inputNode, node)
        context.triggerCharacter = undefined;
        this.session = session;
      } else if (
        session &&
        context.triggerKind === lsp.CompletionTriggerKind.TriggerForIncompleteCompletions
      ) {
        if (context.triggerCharacter) {
          // context.invokeText = context.triggerCharacter;
          // if (node.feature.$type === langium.CrossReference && node.end === triggerOffset) {
          //   context.invokeText = node.text;
          // } else {
          // context.invokeText = "";
          // }
          context.triggerCharacter = undefined;
        }
        if (
          Math.abs(triggerOffset - session?.activeOffset) <= 1 &&
          triggerOffset > session.activedOffsetStart
        ) {
          session.activeOffset = triggerOffset;
          context.invokeText = document.textDocument.getText({
            start: document.textDocument.positionAt(session.activedOffsetStart),
            end: document.textDocument.positionAt(triggerOffset),
          });
          session.activedText = (session.triggerCharacter || "") + context.invokeText;
        }
      } else if (context.triggerKind === lsp.CompletionTriggerKind.TriggerCharacter) {
        if (this.isWSCharacter(context.triggerCharacter)) {
          session = null;
        } else if (!strict) {
          if (
            Math.abs(triggerOffset - session?.activeOffset) <= 1 &&
            triggerOffset > session.activedOffsetStart
          ) {
            session.activeOffset = triggerOffset;
            const invokeText = document.textDocument.getText({
              start: document.textDocument.positionAt(session.activedOffsetStart),
              end: document.textDocument.positionAt(triggerOffset),
            });
            session.activedText = session.triggerCharacter + invokeText;
          } else {
            session = {
              activedOffsetStart: triggerOffset,
              activeOffset: triggerOffset,
              activedText: context.triggerCharacter,
              triggerCharacter: context.triggerCharacter,
            };
          }
        }
        this.session = session;
      }
      session && console.log("session.activedText", session.activedText);
      this.cursorNode = node;
      this.triggerNode = inputNode;
      this.cursorOffset = cursorOffset;
      this.triggerOffset = triggerOffset;
    } else {
      this.cursorNode = null;
      this.triggerNode = null;
      this.cursorOffset = null;
      this.triggerOffset = null;
    }
    return this;
  }
}
type CompletionItemData = LspTypes.CompletionParams & {
  context: LspTypes.CompletionContext & {
    invokeText?: string | undefined;
  };
};
type CompletionSession = {
  /**
   * 从输入触发关键字开始，独立维护一个自动补全的活动语境
   * 持续维护直到触发方式改为Invoked且触发position发生改变
   */
  activedOffsetStart: number;
  activeOffset: number;
  activedText: string | undefined;
  triggerCharacter: string;
};

export type CompletionItemType = Omit<LspTypes.CompletionItem, "data"> & {
  data: CompletionItemData;
};
