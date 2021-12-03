grammar Advscript

entry Document: header=TitlePage content=DocumentContents;

TitlePage: (EOL* start=Token_YAML? (defines+=(Declare)+ | EOL)* end=Token_YAML)?;
YamlBlock: start=Token_YAML (defines+=(Declare)+ | EOL)* end=Token_YAML;

DocumentContents: (contents+=(YamlBlock|LogicStatment|StoryBlock)+ | EOL)*;

terminal Token_YAML returns string: /---\r?\n/;
QualifiedName: name+=[Identifier]+ (Token_P name+=[Identifier]+)*;
Identifier: text=ID;
NameIdentifier: text=TextExpr;

Declare returns Declare: CharactersDeclare | MacroDeclare | OtherDeclare;
DeclareKind: CharactersDeclareKind | MacrosDeclareKind | KeyedDeclareKind;

CharactersDeclare returns Declare: 
  {CharactersDeclare} WS? name=CharactersDeclareKind Token_Colon WS? EOL elements+=Character+;

Character:
  WS Token_ListItem WS name=NameIdentifier
  (WS Token_Paren_L WS? modifiers+=Modifier+ (Token_Comma WS? modifiers+=Modifier+)* WS? Token_Paren_R)?
  (WS elements+=Param)*
  WS?
  EOL;

Modifier: name=NameIdentifier;

MacroDeclare returns Declare: 
  {MacroDeclare} WS? name=MacrosDeclareKind Token_Colon WS? EOL elements+=Macro+;
Macro: 
  WS Token_ListItem WS name=Identifier
  (WS Token_Paren_L WS? modifiers+=[NameIdentifier:TextExpr]+ (Token_Comma WS? modifiers+=[NameIdentifier:TextExpr]+)* WS? Token_Paren_R)?
  (WS elements+=Param+)*
  WS? EOL;

Param: name=Identifier ParamInitial?;
MacroParam: ref=[Param:ID] ParamInitial?;

fragment ParamInitial: Operator_Equal value=(TextExpression|TopExpression);
TextExpression: value=TextContnet;
TextContnet returns string: (OTHER|ESC) (ID|Escapse)*;
PlainTextExpression: value=PlainTextContnet;
PlainTextContnet returns string: (ID|Escapse) (WS|ID|Escapse)*;

MacrosDeclareKind: text='Macros';
CharactersDeclareKind: text='Characters';
KeyedDeclareKind: text=PlainTextContnet;

OtherDeclare returns Declare: 
  {OtherDeclare} name=KeyedDeclareKind WS? Token_Colon (WS? elements=PlainTextExpression)? WS? EOL;

LogicStatment: (VarStatement | IfStatement | ElseIfStatement | ElseStatement | EndStatement) WS? EOL;

// IfBlock: ;
VarStatement: Token_Logic kind='let' WS? expressions+=Variable+ WS? (Token_Comma WS? expressions+=Variable+)*;
IfStatement: Token_Logic kind='if' WS? expression=Expression;
ElseIfStatement: Token_Logic kind='elseif' WS? expression=Expression;
ElseStatement: Token_Logic kind='else';
EndStatement: Token_Logic kind='end';

Variable: name=VariableName WS? VariableInitial?;
VariableName returns string: ('$'|'%')? ID;
fragment VariableInitial: Operator_Equal WS? initial=TopExpression;

StoryBlock: Dialog | Action;

Dialog:
    WS? TOKEN_AT name=[Character:TextExpr] WS? 
    (Token_Paren_L WS? elements+=DialogModifier+ (Token_Comma WS? elements+=DialogModifier+)* WS? Token_Paren_R)? WS?
    (elements+=Call WS?)?
    EOL
    contents+=Content*
    EOL;
DialogModifier: ref=[Modifier:TextExpr];

Action: (contents+=Content+)+ EOL;

Content: content+=(Template|Label|Call|ESCToken|Plain)+ pipe=Pipe? EOL;


Label: text=LABEL_START pipe=(URL | CallMacro | LabelContent) Token_Paren_R;

Call returns Call: Token_Bracket_L (
  ({AtInline} isAt?=TOKEN_AT WS? ref=[Character:TextExpr] WS?) |
  ({Mark} content=LabelContent) |
  (CallMacro? WS?)
) Token_Bracket_R;
CallMacro: ref=[Macro:ID] elements+=MacroParam* (pipe=Pipe)?;
ESCToken: content=Token_Bracket_L | Token_Bracket_R;
// LabelName returns string: (ID|LabelContent) LabelContent?;
LabelContent returns string: (Escapse) (WS|Escapse|ID)*;

Pipe: Token_Logic WS? (
  ({TextPipe} text=LabelContent WS?) | 
  ({MacroPipe} ref=[Macro:ID] elements+=MacroParam*)
)?;
// AtInline: Token_LQ TOKEN_AT WS? ref=[Character:TextExpr] WS? ']';
Template: Token_Template_L WS? expression=Expression WS? pipe=Pipe? Token_Template_R;
Plain: content=PlainText;
PlainText returns string: (Space | RawText)+;


Space returns string: WS; // 将容易引起混淆的token放到后续匹配
RawText returns string: RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string: (StringContent|INLINE_COMMENT);

TOKEN_AT returns string: '@';
Token_P returns string: '.';
Token_Logic returns string: '|';
Token_Colon returns string: ':';
Token_ListItem returns string: '-';
fragment Token_Paren_L returns string: '(';
fragment Token_Paren_R returns string: ')';
Token_Bracket_L returns string: '[';
Token_Bracket_R returns string: ']';
Token_Template_L returns string: '{{';
Token_Template_R returns string: '}}';
fragment Token_Comma returns string: ',';

Operator_Equal returns string: '=';
Operator_QuestionQuestion returns string: '??';
Operator_And returns string: '&&';
Operator_Or returns string: '||';
Operator_MoreThen returns string: '>';
Operator_MoreThenEqual returns string: '>=';
Operator_LessThen returns string: '<';
Operator_LessThenEqual returns string: '<=';
Operator_EqualEqual returns string: '==';
Operator_Division returns string: '*';
Operator_Multiplication returns string: '/';
Operator_Minus returns string: '-';
Operator_Plus returns string: '+';

Operator_Relaction returns string: (
  Operator_MoreThen |
  Operator_LessThen |
  Operator_EqualEqual |
  Operator_MoreThenEqual |
  Operator_LessThenEqual
);

Expression: Comma;

Comma returns Expression:
	Assign ({Comma.left=current} Token_Comma right=Assign)*;

Assign returns Expression:
	TopExpression ({Assign.left=current} Operator_Equal right=TopExpression)*;

TopExpression returns Expression:
	Logic ({Comma.left=current} operator=Operator_QuestionQuestion right=Logic)*;

Logic returns Expression:
	Relaction ({Relaction.left=current} operator=(Operator_And|Operator_Or) right=Relaction)*;

Relaction returns Expression:
	Addition ({Relaction.left=current} operator=Operator_Relaction right=Addition)*;

Addition returns Expression:
	Multiplication ({Addition.left=current} operator=(Operator_Plus|Operator_Minus) right=Multiplication)*;

Multiplication returns Expression:
	PrimaryExpression ({Multiplication.left=current} operator=(Operator_Multiplication|Operator_Division) right=PrimaryExpression)*;

PrimaryExpression returns Expression:
	Token_Paren_L Expression Token_Paren_R |
  {RefExpression} ref=[Variable:VariableName] |
  {LiteralExpression} LiteralExpression;

LiteralExpression: BooleanLiteral | StringLiteral | NumberLiteral;
StringLiteral: value=STRING;
NumberLiteral: value=NUMBER;
BooleanLiteral: value=BOOLEAN;
// STRING returns string:
//   (Token_Quote1 (StringContent|TOKEN_AT)* Token_Quote1) | 
//   (Token_Quote2 (StringContent|TOKEN_AT)* Token_Quote2);
StringContent returns string: (ID|Escapse);
Escapse returns string: NUMBER|OTHER|ESC;
TextExpr returns string: (ID|Escapse)+;

terminal EOL: /\r?\n/;
terminal WS: / +/;
terminal URL: /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
terminal BOOLEAN returns boolean: /\b(true|false)\b/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /\d+(\.\d+)?(?=[+\-*\/=><!\]}\)|, \n\r])/;
terminal LABEL_START returns string: /\[((\\\S|(?!\]).)+?\]*)\](?=\()/;
// terminal CallAtStart: /\[(?=@)/;
terminal STRING: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;
terminal ESC: /(\\\S)+/;
terminal OTHER: /\S/;

terminal INLINE_COMMENT: /(?!\\)\[\[.+?\]\]/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\/\r?\n?/;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*\r?\n?/;
