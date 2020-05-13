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

export const getKeywords = () => {
  return Object.values(ReservedKeywords);
};
