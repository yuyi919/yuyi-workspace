grammar Advscript

entry Document:
    header=TitlePage
    (contents+=(YamlBlock|LogicStatment|StoryBlock)+ | EOL)*;

TitlePage: (EOL* start=Token_YAML? (defines+=(Declare)+ | EOL)* end=Token_YAML)?;
YamlBlock: start=Token_YAML (defines+=(Declare)+ | EOL)* end=Token_YAML;

terminal Token_YAML returns string: /---\r?\n/;
QualifiedName: name+=[Identifier]+ (Token_P name+=[Identifier]+)*;
Identifier: text=ID;
NameIdentifier: text=TextExpr;

Declare returns Declare: CharactersDeclare | MacroDeclare | OtherDeclare;

CharactersDeclare returns Declare: 
  {CharactersDeclare} WS? kind=CharacterDeclareKind Token_Colon WS? EOL elements+=Character+;

Character:
  WS Token_Minus WS name=NameIdentifier
  (WS Token_PL WS? modifiers+=Modifier+ (Token_Comma WS? modifiers+=Modifier+)* WS? Token_PR)?
  (WS elements+=Param)*
  WS?
  EOL;

Modifier: name=NameIdentifier;

MacroDeclare returns Declare: 
  {MacroDeclare} WS? kind=MacrosDeclareKind Token_Colon WS? EOL elements+=Macro+;
Macro: 
  WS Token_Minus WS name=Identifier
  (WS Token_PL WS? groups+=[NameIdentifier:TextExpr]+ (Token_Comma WS? groups+=[NameIdentifier:TextExpr]+)* WS? Token_PR)?
  (WS elements+=Param+)*
  WS? EOL;

Param: name=Identifier ParamInitial?;
MacroParam: ref=[Param:ID] ParamInitial?;

fragment ParamInitial: Token_Equal value=(TextExpression|TopExpression);
TextExpression: value=TextContnet;
TextContnet returns string: (OTHER|ESC) (ID|Escapse)*;
PlainTextExpression: value=PlainTextContnet;
PlainTextContnet returns string: (ID|Escapse) (WS|ID|Escapse)*;

MacrosDeclareKind: name='Macros';
CharacterDeclareKind: name='Characters';
DeclareKind: name=PlainTextContnet;

OtherDeclare returns Declare: 
  {OtherDeclare} kind=DeclareKind WS? Token_Colon (WS? elements=PlainTextExpression)? WS? EOL;

LogicStatment: (VarStatement | IfStatement | ElseIfStatement | ElseStatement | EndStatement) WS? EOL;

// IfBlock: ;
VarStatement: Token_Logic type='let' WS? expressions+=Variable+ WS? (Token_Comma WS? expressions+=Variable+)*;
IfStatement: Token_Logic type='if' WS? expression=Expression;
ElseIfStatement: Token_Logic type='elseif' WS? expression=Expression;
ElseStatement: Token_Logic type='else';
EndStatement: Token_Logic type='end';

Variable: name=VariableName WS? VariableInitial?;
VariableName returns string: ('$'|'%')? ID;
fragment VariableInitial: Token_Equal WS? initial=TopExpression;

StoryBlock: Dialog | Action;

Dialog:
    WS? TOKEN_AT ref=[Character:TextExpr] WS? 
    (Token_PL WS? elements+=DialogModifier+ (Token_Comma WS? elements+=DialogModifier+)* WS? Token_PR)? WS?
    (elements+=Call WS?)?
    EOL
    contents+=Content*
    EOL;
DialogModifier: ref=[Modifier:TextExpr];

Action: (contents+=Content+)+ EOL;

Content: content+=(AtInline|Template|Plain|Label|Call)+ pipe=Pipe? EOL;


Label: text=LABEL_START pipe=(URL | CallMacro | LabelContent) ')';

Call returns Call: CallStart CallMacro WS? ']';
CallMacro returns Call: ref=[Macro:ID] (WS elements+=MacroParam+)* WS? (pipe=Pipe)?;

// LabelName returns string: (ID|LabelContent) LabelContent?;
LabelContent returns string: (Escapse) (WS|Escapse|ID)*;

Pipe: Token_Logic WS? (TextPipe | MacroPipe);
TextPipe returns Pipe: {TextPipe} text=LabelContent WS?;
MacroPipe returns Pipe: {MacroPipe} ref=[Macro:ID] (WS elements+=MacroParam+)* WS?;
AtInline: CallStart TOKEN_AT WS? ref=[Character:TextExpr] WS? ']';
Template: '{{' WS? expression=Expression WS? pipe=Pipe? '}}';
Plain: content=PlainText;
PlainText returns string: (Space | RawText)+;


Space returns string: WS; // 将容易引起混淆的token放到后续匹配
RawText returns string: RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string: (StringContent|INLINE_COMMENT);

TOKEN_AT returns string: '@';
Token_Equal returns string: '=';
Token_EqualEqual returns string: '==';
Token_Plus returns string: '+';
Token_Minus returns string: '-';
Token_Colon returns string: ':';
Token_P returns string: '.';
Token_Logic returns string: '|';
fragment Token_PL returns string: '(';
fragment Token_PR returns string: ')';
fragment Token_Comma returns string: ',';



Expression: Comma;

Comma returns Expression:
	Assign ({Comma.left=current} Token_Comma right=Assign)*;

Assign returns Expression:
	TopExpression ({Assign.left=current} Token_Equal right=TopExpression)*;

TopExpression returns Expression:
	Logic ({Comma.left=current} operator='??' right=Logic)*;

Logic returns Expression:
	Relaction ({Relaction.left=current} operator=('||' | '&&') right=Relaction)*;

Relaction returns Expression:
	Addition ({Relaction.left=current} operator=('>'|'<'|Token_EqualEqual|'<='|'>=') right=Addition)*;

Addition returns Expression:
	Multiplication ({Addition.left=current} operator=(Token_Plus|Token_Minus) right=Multiplication)*;

Multiplication returns Expression:
	PrimaryExpression ({Multiplication.left=current} operator=('*' |'/') right=PrimaryExpression)*;

PrimaryExpression returns Expression:
	Token_PL Expression Token_PR |
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
terminal LABEL_START returns string: /\[((\\\S|(?!\]).)+?\]*)\]\((?=.+\))/;
terminal CallStart: /\[(?=(((?!\\?\[|\\?\]).|"([^"]|\\\S)*?"|'([^']|\\\S)*?')+?\]))/;
terminal STRING: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;
terminal ESC: /(\\\S)+/;
terminal OTHER: /\S/;

terminal INLINE_COMMENT: /(?!\\)\[\[.+?\]\]/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\/\r?\n?/;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*\r?\n?/;
