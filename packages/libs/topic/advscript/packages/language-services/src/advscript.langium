grammar Advscript
import "./expression";

entry Document: EOL* header=TitlePage content=DocumentContents;

TitlePage: EOL* ((Token_YAML EOL)? (defines+=Declare+ | EOL)* Token_YAML EOL)?;

DocumentContents: (contents+=(Block | Statment)+ | EOL)*;
Block: YamlBlock | LogicBlock | StoryBlock;
Statment: LogicStatment;

Token_YAML returns string: "---";
YamlBlock: Token_YAML EOL (defines+=Declare+ | EOL)* Token_YAML EOL;

QualifiedName: name+=[Identifier]+ (Token_P name+=[Identifier]+)*;
Identifier: text=ID;
NameIdentifier: text=TextExpr;

Declare returns Declare: CharactersDeclare | MacroDeclare | OtherDeclare;
DeclareKind: CharactersDeclareKind | MacrosDeclareKind | KeyedDeclareKind;

CharactersDeclare returns Declare:
  {CharactersDeclare} WS? name=CharactersDeclareKind Token_Colon WS? EOL
  (WS? (Token_ListItem WS? elements+=Character | EOL))*;

CharactersDeclareKind: text='Characters';
Character:
  name=NameIdentifier
  (WS? Token_Paren_L WS? modifiers+=Modifier (WS? Token_Comma WS? modifiers+=Modifier+)* Token_Paren_R)?
  (WS elements+=Param)*
  WS? EOL;

Modifier: name=NameIdentifier;

MacrosDeclareKind: text='Macros';
MacroDeclare returns Declare: 
  {MacroDeclare} WS? name=MacrosDeclareKind Token_Colon WS? EOL
  (WS? (Token_ListItem WS? elements+=Macro | EOL))*;
Macro: 
  name=Identifier
  (WS? Token_Paren_L WS? modifiers+=CharacterRef (WS? Token_Comma WS? modifiers+=CharacterRef+)* WS? Token_Paren_R)?
  (WS elements+=Param)*
  WS? EOL;

// ModifierList returns List: 
//   ModifierRef ({ModifierList.elements += current} WS? Token_Comma WS? elements+=ModifierRef)*;

CharacterRef: ref=[Character:TextExpr];
ModifierRef returns ModifierRef: ref=[Modifier:TextExpr];

Param: name=Identifier WS? (Operator_Equal WS? value=ParamInitialExpression)?;
MacroParam: ref=[Param:ID] WS? (Operator_Equal WS? value=InitialExpression)?;

ParamInitialExpression returns ParamInitialExpression: (TextExpression|PrimaryExpression);
InitialExpression returns InitialExpression: (TextExpression|TopExpression);
TextExpression: value=TextContnet;
TextContnet returns string: (OTHER|ESC) (ID|Escapse)*;
PlainTextExpression: value=PlainTextContnet;
PlainTextContnet returns string: (ID|Escapse) (WS|ID|Escapse)*;

KeyedDeclareKind: text=ID;
OtherDeclare returns Declare: 
  {OtherDeclare} name=KeyedDeclareKind WS? Token_Colon (WS? elements=PlainTextExpression)? WS? EOL;


CommonIndent returns string: Indent? WS;

// LogicIfContents returns LogicContents: (contents+=(YamlBlock|StoryBlock)+ | EOL)+;
LogicBlock returns LogicBlock: (
  {ConditionBlock} blocks+=LogicBlock_IF Outdent?
  (blocks+=LogicBlock_IFELSE Outdent?)*
  (blocks+=LogicBlock_ELSE Outdent?)?
) EndStatement;

LogicBlock_IF: condition=IfStatement Indent? block=DocumentContents?;
LogicBlock_IFELSE: condition=ElseIfStatement Indent? block=DocumentContents;
LogicBlock_ELSE: condition=ElseStatement Indent? block=DocumentContents;


LogicStatment: VarStatement WS? EOL;

VarStatement: CommonIndent? kind='|let' WS? datas=VariableList;

IfStatement: CommonIndent? kind='|if' WS? expression=Expression WS? EOL+;
ElseIfStatement: CommonIndent? kind='|elseif' WS? expression=Expression WS? EOL+;
ElseStatement: CommonIndent? kind='|else' WS? EOL+;
EndStatement returns string: CommonIndent? '|end' WS? EOL+;



StoryBlock: (Dialog | Action) EOL;

Dialog returns Dialog:
  WS? TOKEN_AT ref=[Character:TextExpr]
  WS? 
  (Token_Paren_L (WS? modifiers+=ModifierRef Token_Comma?)+ WS? Token_Paren_R WS?)? 
  (elements+=Call WS?)?
  EOL
  (WS? contents+=Content EOL)*;

Action: (contents+=Content+ EOL)+;

Content: indent=CommonIndent? content+=(Template|Call|ESCToken|Plain)+ pipe=Pipe?;


// Label: Token_Bracket_L text=LabelContent LABEL_START pipe=(URL | CallMacro | LabelContent) Token_Paren_R;

Call returns Call: Token_Bracket_L (
  (
    content=LabelContent (
      ({Label} Token_LabelStart pipe=(URL | CallMacro | LabelContent) WS? Token_Paren_R) |
      ({Mark} WS? Token_Bracket_R)
    ) 
  ) | (
    (
      ({AtInline} TOKEN_AT WS? ref=[Character:TextExpr]) |
      (CallMacro?)
    ) WS? Token_Bracket_R
  )
);
Call2: Token_Bracket_L (
  {AtInline2} 's' |
  CallMacro?
) WS? Token_Bracket_R;
Call3: Token_Bracket_L (
  {AtInline3} 'a' |
  CallMacro?
) WS? Token_Bracket_R;
CallMacro: ref=[Macro:ID] WS? elements+=MacroParam* pipe=Pipe?;
ESCToken: content=Token_Bracket_L | Token_Bracket_R;
// LabelName returns string: (ID|LabelContent) LabelContent?;
LabelContent returns string: (Escapse) (WS|Escapse|ID)*;

Pipe: Token_Logic WS? (
  ({TextPipe} text=LabelContent) | 
  ({MacroPipe} ref=[Macro:ID] elements+=MacroParam*)
)?;
// AtInline: Token_LQ TOKEN_AT WS? ref=[Character:TextExpr] WS? ']';
Template: Token_Template_L WS? (expression=Expression WS? pipe=Pipe? WS?)? Token_Template_R;
Plain: content=PlainText;
PlainText returns string: (Space | RawText)+;


Space returns string: WS; // 将容易引起混淆的token放到后续匹配
RawText returns string: RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string: (ID|Escapse|INLINE_COMMENT);

TOKEN_AT returns string: '@';
Token_P returns string: '.';
Token_Logic returns string: '|';
Token_Colon returns string: ':';
Token_ListItem returns string: '-';
Token_Bracket_L returns string: '[';
Token_Bracket_R returns string: ']';
Token_Template_L returns string: '{{';
Token_Template_R returns string: '}}';
fragment Token_LabelStart returns string: '](';

// STRING returns string:
//   (Token_Quote1 (StringContent|TOKEN_AT)* Token_Quote1) | 
//   (Token_Quote2 (StringContent|TOKEN_AT)* Token_Quote2);
// StringContent returns string: (ID|Escapse);
Escapse returns string: NUMBER|OTHER|ESC;
TextExpr returns string: (ID|Escapse)+;

terminal EOL returns string: / *\r?\n/;
terminal Indent returns string: / +(?=\|)/;
terminal Outdent returns string: / *(?=\|)/;
terminal URL returns string: /(https?|ftp|file):\/\/[\w+\-&@#/%?=~_|!:,.;]+[\w+\-&@#/%=~_|]/;
terminal ESC returns string: /(\\\S)+/;
terminal OTHER returns string: /\S/;

terminal INLINE_COMMENT returns string: /(?!\\)\[\[.+?\]\]/;

