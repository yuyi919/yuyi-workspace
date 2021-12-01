grammar Advscript

entry Document:
    (defines+=(Declare)+  | EOL)*
    (contents+=(LogicStatment|StoryBlock)+ | EOL)*;

QualifiedName: name+=[Identifier]+ (Token_P name+=[Identifier]+)*;
Identifier: name=ID;

Declare: CharactersDeclare | MacroDeclare | OtherDeclare;

CharactersDeclare: WS? kind=Token_Character Token_Colon WS? EOL elements+=Character+;

Character:
  WS Token_Minus WS name=ID 
  (WS Token_PL WS? modifiers+=Modifier+ (',' WS? modifiers+=Modifier+)* WS? Token_PR)?
  (WS elements+=Param+)*
  WS?
  EOL;

Modifier: name=ID;

MacroDeclare: WS? kind=Token_Macro Token_Colon WS? EOL elements+=Macro+;
Macro: 
  WS Token_Minus WS name=ID
  (WS Token_PL WS? groups+=[Character:ID]+ (',' WS? groups+=[Character:ID]+)* WS? Token_PR)?
  (WS elements+=Param+)*
  WS? EOL;

Param: name=ID WS? ParamInitial?;
NamedArg: ref=[Param:ID] WS? ParamInitial?;

fragment ParamInitial: Token_Equal WS? value=(LiteralExpression|TextExpression);
TextPieceExpression: value=TextPieceContent;

OtherDeclare: name=ID Token_Colon WS elements=RawText EOL;

LogicStatment: Token_Logic (VarStatment | IfStatment | Endtatment) WS? EOL;

VarStatment: Logic_Let WS expressions+=Variable+ WS? (',' WS? expressions+=Variable+)*;
IfStatment: Logic_If WS expression=Expression;
Endtatment: Logic_End;
Logic_Let: type='let';
Logic_If: type='if';
Logic_End: type='end';

Variable: name=VariableName WS? VariableInitial?;
VariableName returns string: ('$'|'%')? ID;
fragment VariableInitial: Token_Equal WS? initial=Expression;

StoryBlock: Dialog | Action;

Dialog:
    WS? TOKEN_AT ref=[Character:ID] WS? 
    (Token_PL WS? elements+=[Modifier:ID]+ (',' WS? elements+=[Modifier:ID]+)? WS? Token_PR)? WS?
    (elements+=Call WS?)?
    EOL
    contents+=Content+
    EOL;

Action: (contents+=Content+)+ EOL;

Content: content+=(AtInline|Template|Label|Call|Plain)+ pipe=Pipe? EOL;


Call: '[' ref=[Macro:ID] (WS elements+=NamedArg+)* WS? (pipe=Pipe)? ']';
CallMacro: ref=[Macro:ID] (WS elements+=NamedArg+)* WS? (pipe=Pipe)?;

Label: '[' text=LabelContent '](' pipe=(CallMacro|URL)? ')';
LabelContent returns string: (OTHER|ID|Token_Colon|ESC)+;
Pipe: Token_Logic WS? ref=[Macro:ID] (WS elements+=NamedArg+)* WS?;
AtInline: '[@' WS? ref=[Character:ID] WS? ']';
Template: '{{' WS? expression=Expression WS? pipe=Pipe? '}}';
Plain: content=(Space |RawText);


Space returns string: WS; // 将容易引起混淆的token放到后续匹配
RawText returns string: RawTextPiece (RawTextPiece|TOKEN_AT)*; // 将容易引起混淆的token放到后续匹配
RawTextPiece returns string: (Escapse|Token_Quote1|Token_Quote2);
TextPieceContent returns string: (ID|OTHER|Token_Colon|ESC)+;

Esc_Tokens returns string: (
  Token_Plus|Token_Minus|Token_Equal|Token_EqualEqual|'>'|'<'|'*'|'/'|'??'|
  Token_Colon|Token_PR|Token_PL|Token_P|
  INLINE_COMMENT|Token_Character|Token_Macro|
  '[['|']('|']'|'}}'|','
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
//   (Token_Quote1 (Escapse|TOKEN_AT|'[')* Token_Quote1) | 
//   (Token_Quote2 (Escapse|TOKEN_AT|'[')* Token_Quote2);
// StringContent returns string: (ID|NUMBER|OTHER|ESC|Esc_Tokens);

terminal WS: /([ \f\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])+/;
terminal EOL: /\r?\n/;
terminal URL: /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
terminal ID: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /[0-9]+(\.[0-9])?\b/;
terminal OTHER: /((?!(@|\/\*|-|\+|=|\:|\s|\)|\(|\[|\]|{{|\||\.|\\))\W|(?!Characters)\w)((?!\[|\]\]|\]|!)\S*?)/;
terminal INLINE_COMMENT: /(?!\\)\[\[.+?\]\]/;
terminal STRING: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;
terminal ESC: /\\\S/;
terminal BOOLEAN returns boolean: /\b(true|false)\b/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
