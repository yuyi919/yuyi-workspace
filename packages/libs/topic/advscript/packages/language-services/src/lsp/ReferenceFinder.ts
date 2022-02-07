import {
  AstNode,
  getDocument,
  isReference,
  LangiumDocument,
  MaybePromise,
  findLeafNodeAtOffset,
} from "langium";
import { DefaultReferenceFinder } from "langium/lib/lsp/reference-finder";
import * as Lsp from "vscode-languageserver-protocol";
import { Location } from "vscode-languageserver-protocol";
import { URI } from "vscode-uri";
import { findIdentifierNode, findInputNode } from "..";
import * as ast from "../ast-utils";
import { NameProvider } from "../references";

export class ReferenceFinder extends DefaultReferenceFinder {
  declare nameProvider: NameProvider;
  findReferences(
    document: LangiumDocument,
    params: Lsp.ReferenceParams
  ): MaybePromise<Lsp.Location[]> {
    const rootNode = document.parseResult.value.$cstNode;
    if (!rootNode) {
      return [];
    }
    const refs: Array<{ docUri: URI; range: Lsp.Range }> = [];
    const selectedNode = findLeafNodeAtOffset(
      rootNode,
      document.textDocument.offsetAt(params.position)
    );
    // console.log(selectedNode)
    if (!selectedNode) {
      return [];
    }
    const targetAstNode = this.references.findDeclaration(selectedNode)?.element;
    if (targetAstNode) {
      if (params.context.includeDeclaration) {
        const declDoc = getDocument(targetAstNode);
        const nameNode = this.findNameNode(targetAstNode, selectedNode.text);
        if (nameNode) refs.push({ docUri: declDoc.uri, range: nameNode.range });
      }
      this.references.findReferences(targetAstNode).forEach((reference) => {
        if (isReference(reference)) {
          refs.push({ docUri: document.uri, range: reference.$refNode.range });
        } else {
          const range = reference.segment.range;
          const el = findLeafNodeAtOffset(
            document.parseResult.value.$cstNode,
            document.textDocument.offsetAt(reference.segment.range.start)
          )?.element;
          refs.push({
            docUri: reference.sourceUri,
            range: this.findReferenceWithAstNode(el) || range,
          });
        }
      });
    }
    return refs.map((ref) => Location.create(ref.docUri.toString(), ref.range));
  }

  findNameReferences(
    document: LangiumDocument,
    params: Lsp.ReferenceParams
  ): MaybePromise<Lsp.Location[]> {
    const rootNode = document.parseResult.value.$cstNode;
    if (!rootNode) {
      return [];
    }
    const refs: Array<{ docUri: URI; range: Lsp.Range }> = [];
    const node = findIdentifierNode(rootNode, document.textDocument.offsetAt(params.position));
    const { node: selectedNode } = node;
    console.log(node);
    if (!selectedNode) {
      return [];
    }
    const targetAstNode = this.references.findDeclaration(selectedNode)?.element;
    if (targetAstNode) {
      if (params.context.includeDeclaration) {
        const declDoc = getDocument(targetAstNode);
        const nameNode = this.findNameNode(targetAstNode, selectedNode.text);
        if (nameNode) refs.push({ docUri: declDoc.uri, range: nameNode.range });
      }
      this.references.findReferences(targetAstNode).forEach((reference) => {
        if (isReference(reference)) {
          refs.push({ docUri: document.uri, range: reference.$refNode.range });
        } else {
          const range = reference.segment.range;
          refs.push({ docUri: reference.sourceUri, range });
        }
      });
    }
    return refs.map((ref) => Location.create(ref.docUri.toString(), ref.range));
  }

  posReferencesMap = new Map<
    string,
    {
      params: Lsp.ReferenceParams;
      locations: Lsp.Location[];
      triggerRange: Lsp.Range;
    }
  >();

  findNameReferences2(
    document: LangiumDocument,
    params: Lsp.ReferenceParams,
    debug?: boolean
  ): MaybePromise<Lsp.Location[]> {
    const locations: Lsp.Location[] = [];
    const rootNode = document.parseResult.value.$cstNode;
    if (!rootNode) {
      return locations;
    }
    const offset = document.textDocument.offsetAt(params.position);
    const node = findIdentifierNode(rootNode, offset);
    const { node: selectedNode, isMismatchToken } = node;
    if (debug && selectedNode) {
      console.log("findIdentifierNode", offset, node);
      console.log(
        "findInputNode",
        findInputNode(rootNode, offset)
        // this.nameProvider.getQualifiedNameStack(
        //   selectedNode.element.$container,
        //   selectedNode.element
        // ),
        // this.nameProvider.getQualifiedName(selectedNode.element.$container, selectedNode.element)
      );
    }
    if (!selectedNode || !ast.isIdentifierNode(selectedNode.element)) {
      return locations;
    }

    if (isMismatchToken && this.posReferencesMap.has(document.uri.path)) {
      const {
        locations,
        triggerRange,
        params: { position: prevPosition },
      } = this.posReferencesMap.get(document.uri.path);
      const triggerPositoin = triggerRange.start;
      if (
        triggerPositoin.line === params.position.line &&
        triggerPositoin.character === params.position.character
        //    ||
        // (prevPosition.line === params.position.line &&
        //   prevPosition.character >= params.position.character)
      ) {
        return locations.map((location) => {
          location.range.end = location.range.start;
          return location;
        });
      }
      this.posReferencesMap.delete(document.uri.path);
      return;
    }
    const targetAstNode = this.references.findDeclaration(selectedNode)?.element;
    const triggerRange: Lsp.Range = selectedNode.range;
    if (targetAstNode) {
      this.references.findReferences(targetAstNode).forEach((reference) => {
        if (isReference(reference)) {
          locations.push(Location.create(document.uri.toString(), reference.$refNode.range));
        } else {
          locations.push(Location.create(reference.sourceUri.toString(), reference.segment.range));
        }
      });
      const declDoc = getDocument(targetAstNode);
      const nameNode = this.findNameNode(targetAstNode, selectedNode.text);
      if (locations.length > 0) {
        locations.push(Location.create(declDoc.uri.toString(), nameNode.range));
      }
    }
    if (locations.length > 0) {
      // 缓存最近一次的结果
      this.posReferencesMap.set(document.uri.path, { params, locations, triggerRange });
    }
    return locations;
  }

  private findReferenceWithAstNode(el: AstNode): Lsp.Range {
    if (ast.isModifierRef(el)) {
      return el.$container.$container.$cstNode.range;
    }
    return el?.$cstNode?.range;
  }
}
