grammar Advscript

entry Document:
    (defines+=(Declare)+  | EOL)*
    (contents+=(LogicStatment|StoryBlock)+ | EOL)*;

QualifiedName: name+=[Identifier]+ (Token_P name+=[Identifier]+)*;
Identifier: name=ID;

Declare: CharactersDeclare | MacroDeclare | OtherDeclare;

CharactersDeclare: WS? kind=Token_Character Token_Colon WS? EOL elements+=Character+;

Character:
  WS Token_Minus WS name=TextExpr 
  (WS Token_PL WS? modifiers+=Modifier+ (',' WS? modifiers+=Modifier+)* WS? Token_PR)?
  (WS elements+=Param)*
  WS?
  EOL;

Modifier: name=TextExpr;

MacroDeclare: WS? kind=Token_Macro Token_Colon WS? EOL elements+=Macro+;
Macro: 
  WS Token_Minus WS name=ID
  (WS Token_PL WS? groups+=[Character:TextExpr]+ (',' WS? groups+=[Character:TextExpr]+)* WS? Token_PR)?
  (WS elements+=Param+)*
  WS? EOL;

Param: name=ID WS? ParamInitial?;
NamedArg: ref=[Param:ID] WS? ParamInitial?;

fragment ParamInitial: Token_Equal WS? value=(LiteralExpression|TextExpression);
TextExpression: value=TextExpr;

OtherDeclare: name=ID Token_Colon WS elements=RawText EOL;

LogicStatment: (VarStatement | IfStatement | ElseIfStatement | ElseStatement | EndStatement) WS? EOL;

// IfBlock: ;
VarStatement: Token_Logic Logic_Let WS? expressions+=Variable+ WS? (',' WS? expressions+=Variable+)*;
IfStatement: Token_Logic Logic_If WS? expression=Expression;
ElseIfStatement: Token_Logic Logic_ElseIf WS? expression=Expression;
ElseStatement: Token_Logic Logic_Else;
EndStatement: Token_Logic Logic_End;
Logic_Let: type='let';
Logic_If: type='if';
Logic_ElseIf: type='elseif';
Logic_Else: type='else';
Logic_End: type='end';

Variable: name=VariableName WS? VariableInitial?;
VariableName returns string: ('$'|'%')? ID;
fragment VariableInitial: Token_Equal WS? initial=Expression;

StoryBlock: Dialog | Action;

Dialog:
    WS? TOKEN_AT ref=[Character:TextExpr] WS? 
    (Token_PL WS? elements+=DialogModifier+ (',' WS? elements+=DialogModifier+)* WS? Token_PR)? WS?
    (elements+=Call WS?)?
    EOL
    contents+=Content+
    EOL;
DialogModifier: ref=[Modifier:TextExpr];

Action: (contents+=Content+)+ EOL;

Content: content+=(AtInline|Template|Plain|Label|Call)+ pipe=Pipe? EOL;


Label: text=LABEL_START '(' pipe=(URL | CallMacro | LabelContent) ')';

Call returns Call: CallStart CallMacro WS? ']';
CallMacro returns Call: ref=[Macro:ID] (WS elements+=NamedArg+)* WS? (pipe=Pipe)?;

LabelName returns string: (ID|LabelContent) LabelContent?;
LabelContent returns string: (Escapse) (WS|Escapse|ID|']'|'<')*;

Pipe: Token_Logic WS? (TextPipe | MacroPipe);
TextPipe returns Pipe: {TextPipe} text=LabelContent WS?;
MacroPipe returns Pipe: {MacroPipe} ref=[Macro:ID] (WS elements+=NamedArg+)* WS?;
AtInline: '[@' WS? ref=[Character:TextExpr] WS? ']';
Template: '{{' WS? expression=Expression WS? pipe=Pipe? '}}';
Plain: content=PlainText;
PlainText returns string: (Space | RawText)+;


Space returns string: WS; // 将容易引起混淆的token放到后续匹配
RawText returns string: RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string: (StringContent|Token_Quote1|Token_Quote2);

ExprTokens returns string: Token_Plus|Token_Minus|Token_Equal|Token_EqualEqual|'>'|'<'|'*'|'/'|'??';
Esc_Tokens returns string: (
  ExprTokens |
  Token_Colon|Token_PR|Token_PL|Token_P|
  INLINE_COMMENT|Token_Character|Token_Macro|
  '[['|']'|'}}'|','
);

Token_Character returns string: 'Characters';
Token_Macro returns string: 'Macros';
TOKEN_AT returns string: '@';
Token_Equal returns string: '=';
Token_EqualEqual returns string: '==';
Token_Plus returns string: '+';
Token_Minus returns string: '-';
Token_Colon returns string: ':';
Token_PL returns string: '(';
Token_PR returns string: ')';
Token_P returns string: '.';
Token_Logic returns string: '|';
Token_Quote1 returns string: "'";
Token_Quote2 returns string: '"';



Expression: Assign;

Assign returns Expression:
	Relaction WS? ({Assign.left=current} Token_Equal WS? right=Relaction)*;

Relaction returns Expression:
	Addition WS? ({Relaction.left=current} ('>'|'<'|Token_EqualEqual|'<='|'>='|'??') WS? right=Addition)*;

Addition returns Expression:
	Multiplication WS? ({Addition.left=current} (Token_Plus|Token_Minus) WS? right=Multiplication)*;

Multiplication returns Expression:
	PrimaryExpression WS? ({Multiplication.left=current} ('*' |'/') WS? right=PrimaryExpression)*;

PrimaryExpression returns Expression:
	Token_PL WS? Expression WS? Token_PR |
  {RefExpression} ref=[Variable:VariableName] |
  {LiteralExpression} LiteralExpression;



LiteralExpression: BooleanLiteral | StringLiteral | NumberLiteral;
StringLiteral: value=STRING;
NumberLiteral: value=NUMBER;
BooleanLiteral: value=BOOLEAN;
// STRING returns string:
//   (Token_Quote1 (StringContent|TOKEN_AT)* Token_Quote1) | 
//   (Token_Quote2 (StringContent|TOKEN_AT)* Token_Quote2);
StringContent returns string: (ID|Escapse|Esc_Tokens);
Escapse returns string: NUMBER|OTHER|ESC;
TextExpr returns string: (ID|OTHER) (ID|Escapse)*;

terminal EOL: /\r?\n/;
terminal WS: / +/;
terminal URL: /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
terminal BOOLEAN returns boolean: /\b(true|false)\b/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /\d+(\.\d)?(?=[+\-*\/=><!\]}| |\n|,])/;
terminal LABEL_START returns string: /\[((\\\S|(?!\]).)+?)(\])*\](?=\(.+\))/;
terminal CallStart: /\[(?=(((?!\\?\[|\\?\]).|"([^"]|\\\S)*?"|'([^']|\\\S)*?')+?\]))/;
terminal STRING: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;
terminal ESC: /(\\\S)+/;
terminal OTHER: /(\S)+?/;

terminal INLINE_COMMENT: /(?!\\)\[\[.+?\]\]/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\/\r?\n?/;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*\r?\n?/;
