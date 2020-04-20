grammar fs;

// GRAMMAR

main : val_declaration* func*;

// Types

type_name : BOOLEAN | INT | FLOAT | CHAR | STRING | list_type | TYPE_ID;

primitive_types : BOOLEAN | INT | FLOAT | CHAR | STRING;

numeric_types : INT | FLOAT;

complex_types : object_type | tuple_type;

object_type : OPEN_BRACKET VAL_ID COLON type_name (COMMA VAL_ID COLON type_name)* CLOSE_BRACKET;

tuple_type : OPEN_PAREN type_name (COMMA type_name)* CLOSE_PAREN;

list_type : OPEN_SQUARE_BRACKET type_name CLOSE_SQUARE_BRACKET;

literal : BOOL_LITERAL | 
        INT_LITERAL | 
        FLOAT_LITERAL | 
        CHAR_LITERAL | 
        STR_LITERAL |
        object_literal |
        tuple_literal |
        list_literal;

// Complex literals
object_attribute : VAL_ID COLON (literal | VAL_ID);
object_literal : OPEN_BRACKET object_attribute (COMMA object_attribute)* CLOSE_BRACKET;

collection_elem : literal | VAL_ID;
tuple_literal : OPEN_PAREN collection_elem (COMMA collection_elem)* CLOSE_PAREN;

list_literal : OPEN_SQUARE_BRACKET collection_elem* (COMMA collection_elem)* CLOSE_SQUARE_BRACKET;

type_declaration : TYPE TYPE_ID ASSIGN_OP complex_types;


// type_body : TYPE TYPE_ID ASSIGN_OP 

val_declaration : VAL VAL_ID COLON type_name ASSIGN_OP literal;

func_declaration : VAL_ID type_name (ARROW type_name)+;

block : OPEN_BRACKET CLOSE_BRACKET;

func_body : VAL_ID VAL_ID+ ASSIGN_OP block;

func : func_declaration func_body;


// Reserved words
TYPE : 'type';
VAL : 'val';
IF : 'if';
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
STR_LITERAL : '"'(NUMS* | LOWERCASE* | UPPERCASE*)'"';

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
PLUS : '+';
MINUS : '-';
MODULE : '%';
TIMES : '*';
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

THEN : '?';

// Assignment
ASSIGN_OP : '=';

