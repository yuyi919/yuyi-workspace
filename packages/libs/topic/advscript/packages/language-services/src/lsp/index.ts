import { CompletionProvider } from "./CompletionProvider";
import { ReferenceFinder } from "./ReferenceFinder";
import { HoverProvider } from "./HoverProvider";
import { DocumentSymbolProvider } from "./DocumentSymbolProvider";
import { RenameHandler } from "./RenameHandler";
import { DocumentSemanticProvider } from "./DocumentSemanticProvider";
import { CodeActionProvider } from "./CodeActionProvider";

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
