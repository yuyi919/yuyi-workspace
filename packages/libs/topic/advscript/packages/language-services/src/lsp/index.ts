import { CompletionProvider } from "./CompletionProvider";
import { ReferenceFinder } from "./ReferenceFinder";
import { HoverProvider } from "./HoverProvider";
import { DocumentSymbolProvider } from "./DocumentSymbolProvider";
import { RenameHandler } from "./RenameHandler";
import { DocumentSemanticProvider } from "./DocumentSemanticProvider";
import { CodeActionProvider } from "./CodeActionProvider";
import * as uuid from "./uuid";

export type Providers = {
  HoverProvider: HoverProvider;
  CodeActionProvider: CodeActionProvider;
  DocumentSemanticProvider: DocumentSemanticProvider;
  ReferenceFinder: ReferenceFinder;
  RenameHandler: RenameHandler;
  DocumentSymbolProvider: DocumentSymbolProvider;
  completion: {
    CompletionProvider: CompletionProvider;
  };
};
export * from "./CompletionProvider";
export * from "./ReferenceFinder";
export * from "./HoverProvider";
export * from "./DocumentSymbolProvider";
export * from "./RenameHandler";
export * from "./DocumentSemanticProvider";
export * from "./CodeActionProvider";
const time = Date.now();
Object.assign(globalThis, uuid);
globalThis.testUuid = () => {
  let length = 10000 * 1000;
  console.time("uuid");
  while (--length > -1) {
    uuid.uuid(time);
  }
  console.timeEnd("uuid");

  length = 10000 * 1000;
  console.time("uuid2");
  while (--length > -1) {
    uuid.uuid(time);
  }
  console.timeEnd("uuid2");
};
