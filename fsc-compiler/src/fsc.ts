export const ReservedKeywords = {
  IF: "if",
  THEN: "then",
  ELSE: "else",
  TYPE: "type",
  TRUE: "True",
  FALSE: "False",
  BOOLEAN: "Boolean",
  INT: "Int",
  FLOAT: "Float",
  CHAR: "Char",
  STRING: "String",
};

export const builtInTypes = new Set([
  "Int",
  "String",
  "Char",
  "Float",
  "Boolean",
]);

export type Operators =
  | "*"
  | "/"
  | "%"
  | "+"
  | "-"
  | "<"
  | ">"
  | "<="
  | ">="
  | "=="
  | "!="
  | "&&"
  | "||"
  | "="
  | "("
  | "!";

export const SymbolCodes = {
  "*": 1,
  "/": 2,
  "%": 3,
  "+": 4,
  "-": 5,
  "<": 6,
  ">": 7,
  "<=": 8,
  ">=": 9,
  "==": 10,
  "!=": 11,
  "&&": 12,
  "||": 13,
  "=": 14,
  GOTOF: 15,
  RETURN: 16,
  "(": 17,
  GOSUB: 18,
  ENDFUNC: 19,
  PARAM: 20,
  ERA: 21,
};

export const getKeywords = () => {
  return Object.values(ReservedKeywords);
};

export const primitives = ["Int", "Float", "Boolean", "String"];

export type Primitives = "Int" | "Float" | "Boolean" | "String";
