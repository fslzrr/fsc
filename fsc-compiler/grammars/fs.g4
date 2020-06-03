grammar fs;

// GRAMMAR

main : val_declaration* func* execution* EOF;

execution: print | expression;
// Types

type_name : BOOLEAN | INT | FLOAT | STRING | list_type | TYPE_ID;

list_type : OPEN_SQUARE_BRACKET type_name CLOSE_SQUARE_BRACKET;

bool_literal : TRUE | FALSE;
literal : bool_literal | 
        ('-')?INT_LITERAL | 
        ('-')?FLOAT_LITERAL | 
        STR_LITERAL |
        list_literal;

// Complex literals
list_literal : OPEN_SQUARE_BRACKET (expression (COMMA expression)*)? CLOSE_SQUARE_BRACKET;

// Declarations
val_declaration : VAL VAL_ID COLON type_name assignation;
arg : VAL_ID COLON type_name;
param: expression;
func : VAL_ID OPEN_PAREN arg (COMMA arg)* CLOSE_PAREN COLON type_name ARROW block;
print : PRINT OPEN_PAREN expression (COMMA expression)* CLOSE_PAREN;
func_call : VAL_ID OPEN_PAREN param (COMMA param)* CLOSE_PAREN;

length : LENGTH OPEN_PAREN expression CLOSE_PAREN;
head : HEAD OPEN_PAREN expression CLOSE_PAREN;
tail : TAIL OPEN_PAREN expression CLOSE_PAREN;
prelude : length | head | tail;

binary_operators :  EQ | NOT_EQ | LOWER_THAN | GREATER_THAN | LOWER_THAN_OR_EQ | GREATER_THAN_OR_EQ;
relational_operators : AND | OR;

factor : OPEN_PAREN expression CLOSE_PAREN | literal | func_call | VAL_ID | prelude;
unaryOpr : NOT? factor;
term : unaryOpr ((MULTIPLICATION | DIVISION | MODULE) unaryOpr)*;
exp : term ((SUM | SUBSTRACT) term)*;
binary_expression : exp (binary_operators exp)*;
list_concat: factor (CONCATENATION factor)*;
expression : binary_expression (relational_operators binary_expression)*;
assignation: ASSIGN_OP expression;

if_expression : IF expression THEN block (else_if_expression | else_expression);
else_if_expression : ELSE if_expression;
else_expression : ELSE block;

all_expressions : expression | if_expression;

block : OPEN_BRACKET val_declaration* print* all_expressions CLOSE_BRACKET;

// Reserved words
TYPE : 'type';
VAL : 'val';
IF : 'if';
ELSE : 'else';
THEN : 'then';
TRUE : 'True';
FALSE : 'False';

// Base Types
BOOLEAN : 'Boolean';
INT : 'Int';
FLOAT : 'Float';
STRING : 'String';

fragment LOWERCASE  : [a-z] ;
fragment UPPERCASE  : [A-Z] ;
fragment NUMS : [0-9];

// Literals
INT_LITERAL : NUMS+;
FLOAT_LITERAL : NUMS+'.'NUMS+;
STR_LITERAL : '"' (~'"')* '"';

// Variable Names
LENGTH : 'length';
HEAD : 'head';
TAIL : 'tail';
PRINT : 'print';
VAL_ID : LOWERCASE+(LOWERCASE | UPPERCASE | NUMS)*;
TYPE_ID : UPPERCASE+(LOWERCASE | UPPERCASE | NUMS)*;
WS : [ \r\t\n]+ -> skip ;

// Symbols
OPEN_SQUARE_BRACKET : '[';
CLOSE_SQUARE_BRACKET : ']';
OPEN_BRACKET : '{';
CLOSE_BRACKET : '}';
OPEN_PAREN : '(';
CLOSE_PAREN : ')';
ARROW : '->';
COMMA : ',';
COLON : ':';
SEMI_COLON : ';';

// Operators
SUM : '+';
SUBSTRACT : '-';
MODULE : '%';
MULTIPLICATION : '*';
DIVISION : '/';

// Logical
AND : '&&';
OR : '||';
NOT : '!';

// Relational
EQ : '==';
NOT_EQ : '!=';
LOWER_THAN : '<';
GREATER_THAN : '>';
LOWER_THAN_OR_EQ : '<=';
GREATER_THAN_OR_EQ : '>=';

// Assignment
ASSIGN_OP : '=';

// Lists
CONCATENATION : '++';
