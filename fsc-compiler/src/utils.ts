import { Scope, Variable } from "./SymbolTable";
import { Type_declarationContext, LiteralContext } from "../lib/fsParser";
import {
  SemanticCubeTypes,
  SemanticCubeOperators,
  SemanticCube,
} from "./SemanticCube";

export function isNameValid(scope: Scope, name: string) {
  if (scope.builtInTypes.has(name) || scope.userTypes.has(name)) {
    console.error(`Type ${name} is already declared`);
    throw new Error(`Type ${name} is already declared`);
  }

  if (scope.reservedKeywords.has(name)) {
    console.error(`${name} is a reserved keyword`);
    throw new Error(`${name} is a reserved keyword`);
  }

  return true;
}

export function isVarDeclared(scope: Scope, varName: string): boolean {
  if (!scope) return false;
  if (scope.varsMap.has(varName)) return true;
  return isVarDeclared(scope.enclosedScope, varName);
}

export function isTypeDeclared(scope: Scope, typeName: string): boolean {
  return scope.builtInTypes.has(typeName) || scope.userTypes.has(typeName);
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

export function getLiteralType(ctx: LiteralContext) {
  if (ctx.INT_LITERAL()) return "Int";
  if (ctx.FLOAT_LITERAL()) return "Float";
  if (ctx.STR_LITERAL()) return "String";
  if (ctx.bool_literal()) return "Boolean";
  if (ctx.CHAR_LITERAL()) return "Char";
  if (ctx.func_literal()) return ctx.func_literal().text;
  if (ctx.list_literal()) return ctx.list_literal().text;
  if (ctx.object_literal().text) return ctx.object_literal().text;
  return "NULL";
}

export function getValIDType(scope: Scope, valID: string): string {
  const valIDRef = scope.varsMap.get(valID);
  if (valIDRef) return valIDRef.type;
  return getValIDType(scope.enclosedScope, valID);
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
