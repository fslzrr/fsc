type SemanticCubeTypes = "Int" | "Float" | "Boolean";
type SemanticCubeOperators =
  | "+"
  | "-"
  | "/"
  | "*"
  | "%"
  | "&&"
  | "||"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">=";

const SemanticCube = {
  Int: {
    Int: {
      "+": "Int",
      "-": "Int",
      "/": "Int",
      "*": "Int",
      "%": "Int",
      "&&": "Error",
      "||": "Error",
      "==": "Boolean",
      "!=": "Boolean",
      "<": "Boolean",
      ">": "Boolean",
      "<=": "Boolean",
      ">=": "Boolean",
    },
    Float: {
      "+": "Float",
      "-": "Float",
      "/": "Float",
      "*": "Float",
      "%": "Float",
      "&&": "Error",
      "||": "Error",
      "==": "Boolean",
      "!=": "Boolean",
      "<": "Boolean",
      ">": "Boolean",
      "<=": "Boolean",
      ">=": "Boolean",
    },
    Boolean: {
      "+": "Error",
      "-": "Error",
      "/": "Error",
      "*": "Error",
      "%": "Error",
      "&&": "Error",
      "||": "Error",
      "==": "Error",
      "!=": "Error",
      "<": "Error",
      ">": "Error",
      "<=": "Error",
      ">=": "Error",
    },
  },
  Float: {
    Int: {
      "+": "Float",
      "-": "Float",
      "/": "Float",
      "*": "Float",
      "%": "Float",
      "&&": "Error",
      "||": "Error",
      "==": "Boolean",
      "!=": "Boolean",
      "<": "Boolean",
      ">": "Boolean",
      "<=": "Boolean",
      ">=": "Boolean",
    },
    Float: {
      "+": "Float",
      "-": "Float",
      "/": "Float",
      "*": "Float",
      "%": "Float",
      "&&": "Error",
      "||": "Error",
      "==": "Boolean",
      "!=": "Boolean",
      "<": "Boolean",
      ">": "Boolean",
      "<=": "Boolean",
      ">=": "Boolean",
    },
    Boolean: {
      "+": "Error",
      "-": "Error",
      "/": "Error",
      "*": "Error",
      "%": "Error",
      "&&": "Error",
      "||": "Error",
      "==": "Error",
      "!=": "Error",
      "<": "Error",
      ">": "Error",
      "<=": "Error",
      ">=": "Error",
    },
  },
  Boolean: {
    Int: {
      "+": "Error",
      "-": "Error",
      "/": "Error",
      "*": "Error",
      "%": "Error",
      "&&": "Error",
      "||": "Error",
      "==": "Error",
      "!=": "Error",
      "<": "Error",
      ">": "Error",
      "<=": "Error",
      ">=": "Error",
    },
    Float: {
      "+": "Error",
      "-": "Error",
      "/": "Error",
      "*": "Error",
      "%": "Error",
      "&&": "Error",
      "||": "Error",
      "==": "Error",
      "!=": "Error",
      "<": "Error",
      ">": "Error",
      "<=": "Error",
      ">=": "Error",
    },
    Boolean: {
      "+": "Error",
      "-": "Error",
      "/": "Error",
      "*": "Error",
      "%": "Error",
      "&&": "Boolean",
      "||": "Boolean",
      "==": "Boolean",
      "!=": "Boolean",
      "<": "Error",
      ">": "Error",
      "<=": "Error",
      ">=": "Error",
    },
  },
};

export { SemanticCubeOperators, SemanticCubeTypes, SemanticCube };
