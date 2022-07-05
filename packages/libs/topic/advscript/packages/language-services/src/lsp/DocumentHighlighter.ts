import { DefaultDocumentHighlighter } from "langium/lib/lsp";
import * as langium from "langium";
import { AdvScriptServices } from "../advscript-module";
import * as ast from "../ast-utils";
import type * as References from "../references";
import type { LspTypes } from "../_lsp";
import * as _lsp from "../_lsp";
import * as _utils from "../_utils";
import { CompletionItemType, CompletionProviderContext } from "./CompletionProviderContext";
import { FeatureCrossReference, searchAllFeatures } from "./follow-element-computation";
import { RuleInterpreter } from "./RuleInterpreter";
import { searchAllAlternatives } from "./searchAllAlternatives";
import { NameProvider } from "../references";

export class DocumentHighlighter extends DefaultDocumentHighlighter {
  declare nameProvider: NameProvider;
  findHighlights(
    document: langium.LangiumDocument,
    params: LspTypes.DocumentHighlightParams
  ): langium.MaybePromise<LspTypes.DocumentHighlight[] | undefined> {
    // const node = _utils.findInputNodeStrict(
    //   document.parseResult.value.$cstNode,
    //   document.textDocument.offsetAt(params.position)
    // );
    // const { node: selectedNode } = node;
    // console.log(
    //   node,
    //   this.nameProvider.getQualifiedNameStack(
    //     selectedNode.element.$container,
    //     selectedNode.element
    //   ),
    //   this.nameProvider.getQualifiedName(selectedNode.element.$container, selectedNode.element)
    // );
    return super.findHighlights(document, params);
  }
}
