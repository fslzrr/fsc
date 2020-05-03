grammar fs;

// GRAMMAR

main : type_declaration* val_declaration* func* EOF;

// Types

type_name : BOOLEAN | INT | FLOAT | CHAR | STRING | list_type | func_type | TYPE_ID;

object_property : VAL_ID COLON type_name;
object_type : OPEN_BRACKET object_property (COMMA object_property)* CLOSE_BRACKET;

// tuple_type : OPEN_PAREN type_name (COMMA type_name)* CLOSE_PAREN;

list_type : OPEN_SQUARE_BRACKET type_name CLOSE_SQUARE_BRACKET;

func_type : OPEN_PAREN type_name (ARROW type_name)+ CLOSE_PAREN;

literal : BOOL_LITERAL | 
        INT_LITERAL | 
        FLOAT_LITERAL | 
        CHAR_LITERAL | 
        STR_LITERAL |
        object_literal |
        // tuple_literal |
        list_literal |
        func_literal;

// Complex literals
object_attribute : VAL_ID COLON (literal | VAL_ID);
object_literal : OPEN_BRACKET object_attribute (COMMA object_attribute)* CLOSE_BRACKET;
collection_elem : literal | VAL_ID;
// tuple_literal : OPEN_PAREN collection_elem (COMMA collection_elem)* CLOSE_PAREN;
list_literal : OPEN_SQUARE_BRACKET collection_elem (COMMA collection_elem)* CLOSE_SQUARE_BRACKET;
func_literal : 
        OPEN_PAREN (VAL_ID COLON type_name) (COMMA VAL_ID COLON type_name)* CLOSE_PAREN COLON type_name ARROW block;

// Declarations
type_declaration : TYPE TYPE_ID ASSIGN_OP object_type;
val_declaration : VAL VAL_ID COLON type_name ASSIGN_OP expression;
arg : VAL_ID COLON type_name;
func : VAL_ID OPEN_PAREN arg (COMMA arg)* CLOSE_PAREN COLON type_name ARROW block;
func_call : VAL_ID OPEN_PAREN expression (COMMA expression)* CLOSE_PAREN;

binary_operators : AND | OR | EQ | NOT_EQ | LOWER_THAN | GREATER_THAN | LOWER_THAN_OR_EQ | LOWER_THAN_OR_EQ;

factor : OPEN_PAREN expression CLOSE_PAREN | literal | VAL_ID | func_call;
term : factor ((MULTIPLICATION | DIVISION | MODULE) factor)*;
exp : term ((SUM | SUBSTRACT) term)*;
expression : exp | exp binary_operators exp;

if_expression : IF expression THEN block (else_if_expression | else_expression);
else_if_expression : ELSE if_expression;
else_expression : ELSE block;

all_expressions : expression | if_expression;

block : OPEN_BRACKET val_declaration* all_expressions CLOSE_BRACKET;

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
CHAR : 'Char';
STRING : 'String';

fragment LOWERCASE  : [a-z] ;
fragment UPPERCASE  : [A-Z] ;
fragment NUMS : [0-9];

// Literals
BOOL_LITERAL : (TRUE | FALSE);
INT_LITERAL : ('-')?NUMS+;
FLOAT_LITERAL : ('-')?NUMS+'.'NUMS+;
CHAR_LITERAL : '\''(LOWERCASE | UPPERCASE)'\'';
STR_LITERAL : '"'(NUMS | LOWERCASE | UPPERCASE)*'"';

// Variable Names
VAL_ID : LOWERCASE+(LOWERCASE | UPPERCASE)*;
TYPE_ID : UPPERCASE+(LOWERCASE | UPPERCASE)*;
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