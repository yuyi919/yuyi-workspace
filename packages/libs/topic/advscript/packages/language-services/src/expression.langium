grammar Expression

entry Expression: Comma;

Comma returns Expression:
	Assign ({Comma.left=current} Token_Comma right=Assign)*;

Assign returns Expression:
	TopExpression ({Assign.left=current} Operator_Equal right=TopExpression)*;

TopExpression: Conditional;

Conditional returns Expression:
	NullishCoalescing (
    {Conditional.condition=current} Operator_Question when=NullishCoalescing Operator_Colon else=NullishCoalescing
  )*;

NullishCoalescing returns Expression:
	Logical_Or ({NullishCoalescing.left=current} operator=Operator_NullishCoalescing right=Logical_Or)*;

Logical_Or returns Expression:
	Logical_And ({Logical_Or.left=current} operator=Operator_Or right=Logical_And)*;

Logical_And returns Expression:
	Relaction ({Logical_And.left=current} operator=Operator_And right=Relaction)*;

Relaction returns Expression:
	Addition ({Relaction.left=current} operator=Operator_Relaction right=Addition)*;

Addition returns Expression:
	Multiplication ({Addition.left=current} operator=Operator_Addition right=Multiplication)*;

Operator_Addition returns string: Operator_Plus | Operator_Minus;

Multiplication returns Expression:
	Power ({Multiplication.left=current} operator=Operator_Multi right=Power)*;

Operator_Multi returns string: Operator_Multiplication | Operator_Division;

Power returns Expression:
	PrimaryExpression ({Power.left=current} operator=Operator_Power right=PrimaryExpression)*;

PrimaryExpression returns Expression:
	Token_Paren_L Expression Token_Paren_R |
  {RefExpression} ref=[Variable:VariableName] |
  {LiteralExpression} LiteralExpression;

VariableList returns List: 
  elements+=Variable (WS? Token_Comma WS? elements+=Variable)*;
Variable returns Variable: {Variable} name=VariableIdentifier WS? (Operator_Equal WS? initial=TopExpression)?;
VariableIdentifier: prefix=Operator_Variable_Prefix? text=ID;
VariableName returns string: Operator_Variable_Prefix? ID;
Operator_Variable_Prefix returns string: '$' | '%';

LiteralExpression: 
  {BooleanLiteral} value=BOOLEAN |
  {StringLiteral} value=STRING |
  {NumberLiteral} value=NUMBER ({PercentLiteral} percent?='%')?;

BOOLEAN returns boolean: 'true' | 'false';


fragment Token_Paren_L returns string: '(';
fragment Token_Paren_R returns string: ')';

fragment Token_Comma returns string: ',';

Operator_Equal returns string: '=';
Operator_NullishCoalescing returns string: '??';
Operator_And returns string: '&&';
Operator_Or returns string: '||';
Operator_MoreThen returns string: '>';
Operator_MoreThenEqual returns string: '>=';
Operator_LessThen returns string: '<';
Operator_LessThenEqual returns string: '<=';
Operator_EqualEqual returns string: '==';
Operator_Power returns string: '**';
Operator_Division returns string: '*';
Operator_Multiplication returns string: '/';
Operator_Minus returns string: '-';
Operator_Plus returns string: '+';
Operator_Question returns string: '?';
Operator_Colon returns string: ':';

Operator_Relaction returns string: (
  Operator_MoreThen |
  Operator_LessThen |
  Operator_EqualEqual |
  Operator_MoreThenEqual |
  Operator_LessThenEqual
);


terminal WS returns string: / +/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /(\d*\.)?\d+(?=[\b\?\:+\-*\%\^\/=><!\]}\)|, \n\r])/;
terminal STRING returns string: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;

hidden terminal ML_COMMENT returns string: /\/(\*)+[\s\S]*?(\*)+\//;
hidden terminal SL_COMMENT returns string: /\/\/[^\n\r]*\r?\n?/;
