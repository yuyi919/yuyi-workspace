import { TextDocuments } from "vscode-languageserver";
import { Position, TextDocumentContentChangeEvent } from "vscode-languageserver-protocol";
import { TextDocument } from "vscode-languageserver-textdocument";
import { AdvScript } from "..";
import {
  AstNode,
  AstNodeDescriptionProvider,
  createLangiumParser,
  DefaultAstNodeDescriptionProvider,
  DefaultCompletionProvider,
  // DefaultLangiumDocumentFactory,
  DefaultDocumentBuilder,
  DefaultDocumentValidator,
  DefaultJsonSerializer,
  DefaultLangiumDocuments,
  DefaultLinker,
  DefaultModuleContext,
  DefaultNameProvider,
  DefaultReferenceDescriptionProvider,
  DefaultScopeComputation,
  DefaultScopeProvider,
  DefaultTextDocumentFactory,
  DocumentBuilder,
  documentFromText,
  DocumentValidator,
  JsonSerializer,
  // LangiumDefaultServices,
  LangiumDocument,
  LangiumDocumentFactory,
  LangiumDocuments,
  LangiumGeneratedServices,
  LangiumLspServices,
  LangiumParser,
  Linker,
  Module,
  NameProvider,
  ReferenceDescriptionProvider,
  RuleInterpreter,
  ScopeComputation,
  ScopeProvider,
  TextDocumentFactory,
  ValidationRegistry,
} from "langium";
import { createGrammarConfig, GrammarConfig } from "langium/lib/grammar/grammar-config";
import { AstNodeLocator, DefaultAstNodeLocator } from "langium/lib/index/ast-node-locator";
import { DefaultIndexManager, IndexManager } from "langium/lib/index/index-manager";
import { DefaultDocumentHighlighter } from "langium/lib/lsp/document-highlighter";
import { DefaultDocumentSymbolProvider } from "langium/lib/lsp/document-symbol-provider";
import { DefaultFoldingRangeProvider } from "langium/lib/lsp/folding-range-provider";
import { DefaultGoToResolverProvider } from "langium/lib/lsp/goto";
import { MultilineCommentHoverProvider } from "langium/lib/lsp/hover-provider";
import { DefaultReferenceFinder } from "langium/lib/lsp/reference-finder";
import { DefaultRenameHandler } from "langium/lib/lsp/rename-refactoring";
import { DefaultTokenBuilder, TokenBuilder } from "langium/lib/parser/token-builder";
import { DefaultValueConverter, ValueConverter } from "langium/lib/parser/value-converter";
import { DefaultReferences, References } from "langium/lib/references/references";
import { AbstractLangiumParser, ParseResult } from "./interface";

export class IncrementLangiumDocumentFactory implements LangiumDocumentFactory {
  protected readonly parser: LangiumParser;
  private prev: LangiumDocument<any>;

  constructor(services: LangiumServices) {
    this.parser = services.parser.LangiumParser;
  }

  fromTextDocument<T extends AstNode = AstNode>(textDocument: TextDocument): LangiumDocument<T> {
    const doc = this.prev
      ? { ...this.prev, textDocument }
      : documentFromText<T>(textDocument, createParserResult<T>());
    return (this.prev = documentFromText<T>(
      textDocument,
      this.parser.parse(doc)
    ) as LangiumDocument<any>);
  }
}

export type LangiumDefaultServices = {
  parser: {
    GrammarConfig: GrammarConfig;
    ValueConverter: ValueConverter;
    LangiumParser: LangiumParser;
    TokenBuilder: TokenBuilder;
  };
  documents: {
    DocumentBuilder: DocumentBuilder;
    LangiumDocuments: LangiumDocuments;
    LangiumDocumentFactory: LangiumDocumentFactory;
    TextDocuments: TextDocuments<TextDocument>;
    TextDocumentFactory: TextDocumentFactory;
  };
  lsp: LangiumLspServices;
  index: {
    IndexManager: IndexManager;
    AstNodeLocator: AstNodeLocator;
    AstNodeDescriptionProvider: AstNodeDescriptionProvider;
    ReferenceDescriptionProvider: ReferenceDescriptionProvider;
  };
  references: {
    Linker: Linker;
    NameProvider: NameProvider;
    References: References;
    ScopeProvider: ScopeProvider;
    ScopeComputation: ScopeComputation;
  };
  serializer: {
    JsonSerializer: JsonSerializer;
  };
  validation: {
    DocumentValidator: DocumentValidator;
    ValidationRegistry: ValidationRegistry;
  };
};
export type LangiumServices = LangiumGeneratedServices & LangiumDefaultServices;

function createParserResult<T extends AstNode = AstNode>(): ParseResult<T> {
  return {
    value: {
      $type: "Main",
    } as T,
    parserErrors: [],
    lexerErrors: [],
  };
}

export function createDefaultModule(
  context: DefaultModuleContext = {}
): Module<LangiumServices, LangiumDefaultServices> {
  return {
    parser: {
      GrammarConfig: (injector) => createGrammarConfig(injector),
      LangiumParser: (injector) => createLangiumParser(injector),
      ValueConverter: () => new DefaultValueConverter(),
      TokenBuilder: () => new DefaultTokenBuilder(),
    },
    documents: {
      LangiumDocuments: (injector) => new DefaultLangiumDocuments(injector),
      LangiumDocumentFactory: (injector) => new IncrementLangiumDocumentFactory(injector),
      DocumentBuilder: (injector) => new DefaultDocumentBuilder(injector),
      TextDocuments: () => new TextDocuments(TextDocument),
      TextDocumentFactory: (injector) => new DefaultTextDocumentFactory(injector),
    },
    lsp: {
      completion: {
        CompletionProvider: (injector) => new DefaultCompletionProvider(injector),
        RuleInterpreter: () => new RuleInterpreter(),
      },
      Connection: () => context.connection,
      DocumentSymbolProvider: (injector) => new DefaultDocumentSymbolProvider(injector),
      HoverProvider: (injector) => new MultilineCommentHoverProvider(injector),
      FoldingRangeProvider: (injector) => new DefaultFoldingRangeProvider(injector),
      ReferenceFinder: (injector) => new DefaultReferenceFinder(injector),
      GoToResolver: (injector) => new DefaultGoToResolverProvider(injector),
      DocumentHighlighter: (injector) => new DefaultDocumentHighlighter(injector),
      RenameHandler: (injector) => new DefaultRenameHandler(injector),
    },
    index: {
      IndexManager: (injector) => new DefaultIndexManager(injector),
      AstNodeLocator: () => new DefaultAstNodeLocator(),
      AstNodeDescriptionProvider: (injector) => new DefaultAstNodeDescriptionProvider(injector),
      ReferenceDescriptionProvider: (injector) => new DefaultReferenceDescriptionProvider(injector),
    },
    references: {
      Linker: (injector) => new DefaultLinker(injector),
      NameProvider: () => new DefaultNameProvider(),
      ScopeProvider: (injector) => new DefaultScopeProvider(injector),
      ScopeComputation: (injector) => new DefaultScopeComputation(injector),
      References: (injector) => new DefaultReferences(injector),
    },
    serializer: {
      JsonSerializer: (injector) => new DefaultJsonSerializer(injector),
    },
    validation: {
      DocumentValidator: (injector) => new DefaultDocumentValidator(injector),
      ValidationRegistry: (injector) => new ValidationRegistry(injector),
    },
  };
}

export class OhmParser extends AbstractLangiumParser {
  private readonly story = new AdvScript();

  constructor(private readonly services: LangiumServices) {
    super(services);
  }
  parse<T extends AstNode = AstNode>(input: LangiumDocument<T>): ParseResult<T> {
    const text = input.textDocument.getText();
    const changed = this.fireChange(input);
    const lines = text.split("\n");
    const ranges = changed
      .map((changed) => {
        if (TextDocumentContentChangeEvent.isIncremental(changed)) {
          const startIndex = getPositionOfLineAndCharacter(lines, changed.range.start);
          const endIndex = getPositionOfLineAndCharacter(lines, changed.range.end);
          return {
            startIdx: startIndex,
            endIdx: endIndex,
            range: changed.range,
            content: changed.text,
          };
        }
      })
      .filter(Boolean);
    console.log(ranges);
    return {
      value: {
        $type: "Main",
        $cstNode: this.story.parse(
          input.textDocument.uri,
          text,
          ranges.length > 0 ? ranges : void 0
        ) as any,
      } as T,
      parserErrors: [],
      lexerErrors: [],
    };
  }

  fireChange(doc: LangiumDocument) {
    if (!changedMap.has(doc.textDocument.uri)) {
      const empty = [] as TextDocumentContentChangeEvent[];
      changedMap.set(doc.textDocument.uri, empty);
      return empty;
    }
    const changed = changedMap.get(doc.textDocument.uri);
    return changed.splice(0, changed.length);
  }
}

const changedMap = new Map<string, TextDocumentContentChangeEvent[]>();

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
