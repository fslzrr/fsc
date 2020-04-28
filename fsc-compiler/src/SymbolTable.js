class SymbolTable {
  scopeName;
  scopeLevel;
  enclosedScope;
  varMap;
  dirmap;

  constructor(scopeName, scopeLevel, enclosedScope) {
    this.scopeName = scopeName;
    this.scopeLevel = scopeLevel;
    this.enclosedScope = enclosedScope;
    this.varMap = new Map();
    this.dirmap = new Map();
  }
}

export default SymbolTable;
