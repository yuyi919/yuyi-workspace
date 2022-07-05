grammar Expression

entry Expression:
  Comma;

Comma infers Expression:
  Assign ({infer Comma.left=current} Token_Comma right=Assign)*;

Assign infers Expression:
  TopExpression ({infer Assign.left=current} operator=Operator_Equal right=TopExpression)*;

TopExpression infers Expression:
  Conditional;

Conditional infers Expression:
  NullishCoalescing (
    {infer Conditional.condition=current} operator=Operator_Question when=NullishCoalescing Token_Colon else=NullishCoalescing
  )*;

NullishCoalescing infers Expression:
  Logical_Or ({infer NullishCoalescing.left=current} operator=Operator_NullishCoalescing right=Logical_Or)*;

Logical_Or infers Expression:
  Logical_And ({infer Logical_Or.left=current} operator=Operator_Or right=Logical_And)*;

Logical_And infers Expression:
  Relaction ({infer Logical_And.left=current} operator=Operator_And right=Relaction)*;

Relaction infers Expression:
  Addition ({infer Relaction.left=current} operator=Operator_Relaction right=Addition)*;

Addition infers Expression:
  Multiplication ({infer Addition.left=current} operator=Operator_Addition right=Multiplication)*;

Operator_Addition returns string:
  Operator_Plus | Operator_Minus;

Multiplication infers Expression:
  Power ({infer Multiplication.left=current} operator=Operator_Multi right=Power)*;

Operator_Multi returns string:
  Operator_Multiplication | Operator_Division;

Power infers Expression:
  PrimaryExpression ({infer Power.left=current} operator=Operator_Power right=PrimaryExpression)*;

PrimaryExpression infers Expression:
  Token_Paren_L Expression Token_Paren_R |
  {infer RefExpression} ref=[Variable:VariableName] |
  {infer LiteralExpression} LiteralExpression;

VariableList infers List:
  elements+=Variable (WS? Token_Comma Space? elements+=Variable)*;
Variable:
  name=VariableIdentifier WS? (Token_Equal WS? initial=TopExpression)?;
VariableIdentifier:
  prefix=Operator_Variable_Prefix? text=ID;
VariableName returns string:
  Operator_Variable_Prefix? ID;
Operator_Variable_Prefix returns string:
  '$' | '%';

LiteralExpression:
  {infer BooleanLiteral} value=BOOLEAN |
  {infer StringLiteral} value=STRING |
  {infer NumberLiteral} (Operator_Plus|Operator_Minus)? value=NUMBER ({infer PercentLiteral} percent?='%')?;

BOOLEAN returns boolean:
  'true' | 'false';


fragment Token_Paren_L returns string:
  '(';
fragment Token_Paren_R returns string:
  ')';

fragment Token_Comma returns string:
  ',';

fragment Token_Equal returns string:
  '=';
fragment Token_Colon returns string:
  ':';
fragment Token_Question returns string:
  '?';

Operator_Equal returns string:
  Token_Equal;
Operator_NullishCoalescing returns string:
  '??';
Operator_And returns string:
  '&&';
Operator_Or returns string:
  '||';
Operator_MoreThen returns string:
  '>';
Operator_MoreThenEqual returns string:
  '>=';
Operator_LessThen returns string:
  '<';
Operator_LessThenEqual returns string:
  '<=';
Operator_EqualEqual returns string:
  '==';
Operator_Power returns string:
  '**';
Operator_Division returns string:
  '*';
Operator_Multiplication returns string:
  '/';
Operator_Minus returns string:
  '-';
Operator_Plus returns string:
  '+';
Operator_Question returns string:
  Token_Question;
Operator_Colon returns string:
  Token_Colon;


Operator_Relaction returns string:
  (
  Operator_MoreThen |
  Operator_LessThen |
  Operator_EqualEqual |
  Operator_MoreThenEqual |
  Operator_LessThenEqual
);

fragment Space returns string:
  WS; // 将容易引起混淆的token放到后续匹配

terminal WS returns string: / +/;
terminal ID returns string: /[_a-zA-Z][\w_]*/;
terminal NUMBER returns number: /(\d*\.)?\d+(?=[\b\?\:+\-*\%\^\/=><!\]}\)|, \n\r])/;
terminal STRING returns string: /"((\\.)|[^"])*"|'((\\.)|[^'])*'/;

hidden terminal ML_COMMENT returns string: /\/(\*)+[\s\S]*?(\*)+\//;
hidden terminal SL_COMMENT returns string: /\/\/[^\n\r]*\r?\n?/;
