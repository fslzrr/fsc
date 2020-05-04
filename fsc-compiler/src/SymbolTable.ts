const reservedKeywords = new Set([
  "if",
  "else",
  "then",
  "val",
  "True",
  "False",
  "Int",
  "String",
  "Char",
  "Float",
  "Boolean",
]);
const builtInTypes = new Set(["Int", "String", "Char", "Float", "Boolean"]);
const userTypes = new Map<string, ObjectSymbol>();

/*
  We need to handle the following cases:

  1.- Global Scope
  2.- If/Else Scope
  3.- Function Scope
  4.- Lambda Scope
  5.- Save variables
  6.- Save custom types
*/

export type ObjectSymbol = {
  name: string;
  properties: Set<Variable>;
};

export type Variable = {
  name: string;
  type: string;
};

export type Function = {
  name: string;
  args: Variable[];
  type: string;
};

export class SymbolTable {
  scopeName: string;
  scopeLevel: number;
  type: string;
  enclosedScope?: SymbolTable;
  varsMap: Map<string, Variable>;
  argsMap: Map<string, Variable>;
  funcMap: Map<string, Function>;

  reservedKeywords: Set<string>;
  builtInTypes: Set<string>;
  userTypes: Map<string, ObjectSymbol>;

  constructor(
    scopeName: string,
    scopeLevel: number,
    enclosedScope?: SymbolTable
  ) {
    this.scopeName = scopeName;
    this.scopeLevel = scopeLevel;
    this.enclosedScope = enclosedScope;
    this.varsMap = new Map();
    this.argsMap = new Map();
    this.funcMap = new Map();

    this.reservedKeywords = reservedKeywords;
    this.builtInTypes = builtInTypes;
    this.userTypes = userTypes;
  }
}
