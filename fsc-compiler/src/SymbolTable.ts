export type ObjectSymbol = {
  name: string;
  properties: Map<string, Variable>;
};

export type Variable = {
  name: string;
  type: string;
  virtualAddress: number;
  nestedVariables: Map<string, Variable>;
  values?: Variable[];
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

type ScopeType = "Global" | "Function";

export class Scope {
  scopeName: string;
  scopeType: ScopeType;
  enclosedScope?: Scope;
  varsMap: Map<string, Variable>;

  constructor(scopeName: string, scopeType: ScopeType, enclosedScope?: Scope) {
    this.scopeName = scopeName;
    this.scopeType = scopeType;
    this.enclosedScope = enclosedScope;
    this.varsMap = new Map();
  }
}
