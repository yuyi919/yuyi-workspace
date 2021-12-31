import { AdvScript } from "@yuyi919/advscript-parser";
import {
  AstNode,
  documentFromText,
  // LangiumDefaultServices,
  LangiumDocument,
  LangiumDocumentFactory,
  LangiumServices,
  LangiumSharedServices,
  ServiceRegistry,
} from "langium";
import { Position, TextDocumentContentChangeEvent } from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";
import { AbstractLangiumParser, ParseResult } from "./interface";

export class IncrementLangiumDocumentFactory implements LangiumDocumentFactory {
  protected readonly serviceRegistry: ServiceRegistry;
  private prev: LangiumDocument<any>;

  constructor(services: LangiumSharedServices) {
    this.serviceRegistry = services.ServiceRegistry;
  }

  fromString<T extends AstNode = AstNode>(text: string, uri: URI): LangiumDocument<T> {
      return this.create<T>(undefined, text, undefined, uri);
  }

  fromModel<T extends AstNode = AstNode>(model: T, uri: URI): LangiumDocument<T> {
      return this.create<T>(undefined, undefined, model, uri);
  }

  fromTextDocument<T extends AstNode = AstNode>(textDocument: TextDocument, uri?: URI): LangiumDocument<T> {
    return this.create<T>(textDocument, undefined, undefined, uri);
    // const services = this.serviceRegistry.getServices(URI.parse(textDocument.uri));
    // // const doc = this.prev
    // //   ? { ...this.prev, textDocument }
    // //   : documentFromText<T>(textDocument, createParserResult<T>());
    // // return (this.prev = documentFromText<T>(
    // //   textDocument,
    // //   services.parser.LangiumParser.parse(doc)
    // // ) as LangiumDocument<any>);
    // return documentFromText<T>(
    //   textDocument,
    //   services.parser.LangiumParser.parse(textDocument.getText())
    // ) as LangiumDocument<any>
  }

  protected create<T extends AstNode>(textDocument: TextDocument | undefined, text: string | undefined, model: T | undefined, uri: URI | undefined): LangiumDocument<T> {
      if (uri === undefined) {
          uri = URI.parse(textDocument!.uri);
      }
      const services = this.serviceRegistry.getServices(uri);
      if (textDocument === undefined) {
          textDocument = TextDocument.create(uri.toString(), services.LanguageMetaData.languageId, 0, text ?? '');
      }
      let parseResult: ParseResult<T>;
      if (model === undefined) {
          parseResult = services.parser.LangiumParser.parse<T>(textDocument.getText());
      } else {
          parseResult = { value: model, parserErrors: [], lexerErrors: [] };
      }
      return documentFromText<T>(textDocument, parseResult, uri);
  }
}

function createParserResult<T extends AstNode = AstNode>(): ParseResult<T> {
  return {
    value: {
      $type: "Main",
    } as T,
    parserErrors: [],
    lexerErrors: [],
  };
}

export class OhmParser extends AbstractLangiumParser {
  private readonly story = new AdvScript();

  constructor(private readonly services: LangiumServices) {
    super(services);
  }
  prevTextDocument: TextDocument;
  parse<T extends AstNode = AstNode>(input: LangiumDocument<T>): ParseResult<T> {
    const text = input.textDocument.getText();
    const changed = fireChange(input);
    console.log("OhmParser", input);
    const ranges = changed
      .map((changed) => {
        if (TextDocumentContentChangeEvent.isIncremental(changed)) {
          const startIndex = this.prevTextDocument.offsetAt(changed.range.start); // getPositionOfLineAndCharacter(lines, changed.range.start);
          const endIndex = this.prevTextDocument.offsetAt(changed.range.end); //getPositionOfLineAndCharacter(lines, changed.range.end);
          return {
            startIdx: startIndex,
            endIdx: endIndex,
            range: changed.range,
            content: changed.text,
          };
        }
      })
      .filter(Boolean);
    this.prevTextDocument = bumpTextDocument(input.textDocument);
    return {
      value: {
        $type: "Main",
        $cstNode: this.story.parse(
          input.textDocument.uri,
          text,
          ranges.length > 0 ? ranges : void 0
        ) as any,
        elements: [],
      } as any as T,
      parserErrors: [],
      lexerErrors: [],
    };
  }
}
function bumpTextDocument(doc: TextDocument) {
  return TextDocument.create(doc.uri, doc.languageId, doc.version, doc.getText());
}
const changedMap = new Map<string, TextDocumentContentChangeEvent[]>();

export function fireChange(doc: LangiumDocument) {
  if (!changedMap.has(doc.textDocument.uri)) {
    const empty = [] as TextDocumentContentChangeEvent[];
    changedMap.set(doc.textDocument.uri, empty);
    return empty;
  }
  const changed = changedMap.get(doc.textDocument.uri);
  return changed.splice(0, changed.length);
}
export function appendChanged(uri: string, event: TextDocumentContentChangeEvent) {
  if (!changedMap.has(uri)) {
    changedMap.set(uri, [event]);
    return;
  }
  changedMap.get(uri).push(event);
}

export function getPositionOfLineAndCharacter(input: string[], position: Position) {
  let linePos = 0;
  for (let i = 0; i < position.line; i++) {
    linePos += input[i].length + 1;
  }
  return linePos + position.character;
}
