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

export type ObjectSymbol = {
  name: string;
  properties: Set<Variable>;
};

export type Variable = {
  name: string;
  type: string;
  virtualAddress: number;
};

export type Function = {
  name: string;
  args: Variable[];
  variables: Map<string, Variable>;
  tempVariables: number;
  type: string;
  startQuadruple: number;
  returnVirtualAddress: number;
};

type ScopeType = "Global" | "Function" | "Conditional";

export class Scope {
  scopeName: string;
  scopeType: ScopeType;
  enclosedScope?: Scope;
  varsMap: Map<string, Variable>;

  reservedKeywords: Set<string>;
  builtInTypes: Set<string>;
  userTypes: Map<string, ObjectSymbol>;

  constructor(scopeName: string, scopeType: ScopeType, enclosedScope?: Scope) {
    this.scopeName = scopeName;
    this.scopeType = scopeType;
    this.enclosedScope = enclosedScope;
    this.varsMap = new Map();

    this.reservedKeywords = reservedKeywords;
    this.builtInTypes = builtInTypes;
    this.userTypes = userTypes;
  }
}
