grammar Advscript
import "./expression";

entry Document:
  EOL* header=TitlePage content=DocumentContents;

TitlePage:
  EOL* (Token_YAML? (defines+=Declare+ | EOL)* Token_YAML)?;

DocumentContents:
  (contents+=(Block | Statment)+ | EOL)*;
Block:
  YamlBlock | LogicBlock | StoryBlock;
Statment:
  LogicStatment;

fragment Token_YAML returns string:
  "---" EOL;
YamlBlock:
  Token_YAML EOL* (defines+=Declare+ EOL)* Token_YAML;

// QualifiedName: name+=[Identifier]+ (Token_Dot name+=[Identifier]+)*;
Identifier:
  text=ID;
NameIdentifier:
  text=ID;

Declare infers Declare:
  CharactersDeclare | MacroDeclare | OtherDeclare;
DeclareKind:
  CharactersDeclareKind | MacrosDeclareKind | KeyedDeclareKind;

CharactersDeclare infers Declare:
  {infer CharactersDeclare} WS? name=CharactersDeclareKind Token_Colon EOL
  (elements+=DeclareItem_Character | EOL)*;

DeclareItem_Character:
  Space? Token_ListItem Space? Character;

CharactersDeclareKind:
  text='Characters';
Character:
  name=NameIdentifier
  (Space? Token_Paren_L WS? modifiers=ModifierList_Character Token_Paren_R)?
  (Space? elements+=Param)*
  WS? EOL;
ModifierList_Character:
  elements+=Modifier (WS? Token_Comma Space? elements+=Modifier)*;

Modifier:
  name=NameIdentifier;

MacrosDeclareKind:
  text='Macros';
MacroDeclare infers Declare:
  {infer MacroDeclare} WS? name=MacrosDeclareKind Token_Colon EOL
  (elements+=DeclareItem_Macro | EOL)*;

DeclareItem_Macro:
  Space? Token_ListItem Space? Macro;

Macro:
  name=Identifier
  (Space? Token_Paren_L WS? modifiers=ModifierList_Macro WS? Token_Paren_R)?
  (Space? elements+=Param)*
  WS? EOL;

ModifierList_Macro:
  elements+=CharacterRef (WS? Token_Comma Space? elements+=CharacterRef)*;
// ModifierList returns List: 
//   ModifierRef ({ModifierList.elements += current} WS? Token_Comma WS? elements+=ModifierRef)*;

CharacterRef:
  ref=[Character:ID];
ModifierRef infers ModifierRef:
  ref=[Modifier:ID];

Param:
  name=Identifier WS? (Token_Equal WS? value=ParamInitialExpression)?;
MacroParam:
  ref=[Param:ID] WS? (Token_Equal WS? value=InitialExpression)?;

ParamInitialExpression infers ParamInitialExpression:
  (TextExpression|PrimaryExpression);
InitialExpression infers InitialExpression:
  (TextExpression|TopExpression);
TextExpression:
  value=TextContnet;
TextContnet returns string:
  (OTHER|ESC) (ID|Escapse)*;
PlainTextExpression:
  value=PlainTextContnet;
PlainTextContnet returns string:
  (ID|Escapse) (WS|ID|Escapse)*;

KeyedDeclareKind:
  text=ID;
OtherDeclare infers Declare:
  {infer OtherDeclare} name=KeyedDeclareKind WS? Token_Colon (Space? elements=PlainTextExpression)? EOL;


CommonIndent returns string:
  Indent? WS;

// LogicIfContents returns LogicContents: (contents+=(YamlBlock|StoryBlock)+ | EOL)+;
LogicBlock infers LogicBlock:
  (
  {infer ConditionBlock} blocks+=LogicBlock_IF Outdent?
  (blocks+=LogicBlock_IFELSE Outdent?)*
  (blocks+=LogicBlock_ELSE Outdent?)?
) end=EndStatement;

LogicBlock_IF:
  condition=IfStatement Indent? block=DocumentContents?;
LogicBlock_IFELSE:
  condition=ElseIfStatement Indent? block=DocumentContents;
LogicBlock_ELSE:
  condition=ElseStatement Indent? block=DocumentContents;


LogicStatment:
  VarStatement EOL;

VarStatement:
  CommonIndent? kind='|let' Space? datas=VariableList;

IfStatement:
  CommonIndent? kind='|if' Space? expression=Expression EOL+;
ElseIfStatement:
  CommonIndent? kind='|elseif' Space? expression=Expression EOL+;
ElseStatement:
  CommonIndent? kind='|else' Space? EOL+;
EndStatement:
  CommonIndent? kind='|end' EOL+;



StoryBlock:
  (Dialog | Action) EOL;

Dialog infers Dialog:
  WS? TOKEN_AT ref=[Character:ID]
  (
    Space? modifiers=ModifierList_Dialog 
    (WS? elements+=DialogCall)*
  )? EOL
  contents+=DialogContent*;
ModifierList_Dialog:
  Token_Paren_L WS? elements+=ModifierRef WS? (Token_Comma Space? elements+=ModifierRef WS?)* Token_Paren_R;
DialogContent:
  WS? Content;
DialogCall infers Call:
  Token_Bracket_L WS? CallMacro WS? Token_Bracket_R;

Action:
  contents+=Content+;
Content:
  indent=CommonIndent? content+=(Template|Call|Plain)+ pipe=Pipe? EOL;


// Label: Token_Bracket_L text=LabelContent LABEL_START pipe=(URL | CallMacro | LabelContent) Token_Paren_R;

Call infers Call:
  Token_Bracket_L (
  (
    content=LabelContent (
      ({infer Label} Token_LabelStart pipe=(URL | CallMacro | LabelContent) WS? Token_Paren_R) |
      ({infer Mark} WS? Token_Bracket_R)
    ) 
  ) | (
    (
      ({infer AtInline} TOKEN_AT WS? ref=[Character:ID]) |
      CallMacro
    ) WS? Token_Bracket_R
  )
);
CallMacro:
  ref=[Macro:ID] Space? elements+=MacroParam* WS? pipe=Pipe?;
// ESCToken: content=Token_Bracket_L | Token_Bracket_R;
// LabelName returns string: (ID|LabelContent) LabelContent?;
LabelContent returns string:
  (Escapse) (WS|Escapse|ID)*;

Pipe:
  Token_Logic WS? (
  ({infer TextPipe} text=LabelContent) | 
  ({infer MacroPipe} ref=[Macro:ID] Space? elements+=MacroParam*)
)?;
// AtInline: Token_LQ TOKEN_AT WS? ref=[Character:ID] WS? ']';
Template:
  Token_Template_L WS? (expression=Expression WS? pipe=Pipe? WS?)? Token_Template_R;
Plain:
  content=PlainText;
PlainText returns string:
  (WS | RawText)+;
// ESCToken: content=(Token_Bracket_L|Token_Bracket_R|Token_Template_L|Token_Template_R);


RawText returns string:
  RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string:
  (ID|Escapse|INLINE_COMMENT);

fragment TOKEN_AT returns string:
  '@';
fragment Token_Dot returns string:
  '.';
fragment Token_Logic returns string:
  '|';
fragment Token_ListItem returns string:
  '-';
fragment Token_Bracket_L returns string:
  '[';
fragment Token_Bracket_R returns string:
  ']';
fragment Token_Template_L returns string:
  '{{';
fragment Token_Template_R returns string:
  '}}';
fragment Token_LabelStart returns string:
  '](';

// STRING returns string:
//   (Token_Quote1 (StringContent|TOKEN_AT)* Token_Quote1) | 
//   (Token_Quote2 (StringContent|TOKEN_AT)* Token_Quote2);
// StringContent returns string: (ID|Escapse);
Escapse returns string:
  NUMBER|OTHER|ESC;

terminal EOL returns string: / *\r?\n/;
terminal Indent returns string: / +(?=\|)/;
terminal Outdent returns string: / *(?=\|)/;
terminal URL returns string: /(https?|ftp|file):\/\/[\w+\-&@#/%?=~_|!:,.;]+[\w+\-&@#/%=~_|]/;
terminal ESC returns string: /(\\\S)+/;
terminal OTHER returns string: /\S/;

terminal INLINE_COMMENT returns string: /(?!\\)\[\[.+?\]\]/;

