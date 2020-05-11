import { SymbolTable, Variable } from "./SymbolTable";
import {
  Type_declarationContext,
  FuncContext,
  LiteralContext,
} from "../lib/fsParser";
import {
  SemanticCubeTypes,
  SemanticCubeOperators,
  SemanticCube,
} from "./SemanticCube";

export function isNameValid(mainScope: SymbolTable, name: string) {
  if (mainScope.builtInTypes.has(name) || mainScope.userTypes.has(name)) {
    throw new Error(`Type ${name} is already declared`);
  }

  if (mainScope.reservedKeywords.has(name)) {
    throw new Error(`${name} is a reserved keyword`);
  }

  return true;
}

export function isVarDeclared(scope: SymbolTable, varName: string): boolean {
  if (!scope) return false;
  if (scope.varsMap.has(varName)) return true;
  return isVarDeclared(scope.enclosedScope, varName);
}

export function isFuncDeclared(scope: SymbolTable, funcName: string): boolean {
  if (!scope) return false;
  if (scope.funcMap.get(funcName)) return true;
  return isFuncDeclared(scope.enclosedScope, funcName);
}

export function isTypeDeclared(
  mainScope: SymbolTable,
  typeName: string
): boolean {
  return (
    mainScope.builtInTypes.has(typeName) || mainScope.userTypes.has(typeName)
  );
}

export function extractObjectProperties(ctx: Type_declarationContext) {
  return ctx
    .object_type()
    .object_property()
    .map((property) => {
      const name = property.VAL_ID().text;
      const type = property.type_name().text;

      return { name, type } as Variable;
    });
}

export function extractFuncArgs(ctx: FuncContext) {
  return ctx.arg().map((arg) => {
    const name = arg.VAL_ID().text;
    const type = arg.type_name().text;

    return { name, type } as Variable;
  });
}

export function getLiteralType(ctx: LiteralContext) {
  if (ctx.INT_LITERAL()) return "Int";
  if (ctx.FLOAT_LITERAL()) return "Float";
  if (ctx.STR_LITERAL()) return "String";
  if (ctx.BOOL_LITERAL()) return "Boolean";
  if (ctx.CHAR_LITERAL()) return "Char";
  if (ctx.func_literal()) return ctx.func_literal().text;
  if (ctx.list_literal()) return ctx.list_literal().text;
  if (ctx.object_literal().text) return ctx.object_literal().text;
  return "NULL";
}

export function getValIDType(scope: SymbolTable, valID: string) {
  const getVarType = (scope: SymbolTable, valID: string): string => {
    const valIDRef = scope.varsMap.get(valID);
    if (valIDRef) return valIDRef.type;
    return getValIDType(scope.enclosedScope, valID);
  };

  return getVarType(scope, valID);
}

export function getExpressionType(
  operandOneType: SemanticCubeTypes,
  operandTwoType: SemanticCubeTypes,
  operator: SemanticCubeOperators
) {
  const typeOne = SemanticCube[operandOneType];
  if (!typeOne) return "Error";
  const typeTwo = typeOne[operandTwoType];
  if (!typeTwo) return "Error";
  const type = typeTwo[operator];
  if (!type) return "Error";
  return type;
}
