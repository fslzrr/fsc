import { Scope, Variable, Function, ObjectSymbol } from "./SymbolTable";
import {
  Type_declarationContext,
  LiteralContext,
  Object_literalContext,
} from "../lib/fsParser";
import {
  SemanticCubeTypes,
  SemanticCubeOperators,
  SemanticCube,
} from "./SemanticCube";
import { MemoryMap } from "./memoryMap";
import { primitives, Primitives, builtInTypes, getKeywords } from "./fsc";

export function isNameValid(
  name: string,
  userTypes: Map<string, ObjectSymbol>
) {
  if (builtInTypes.has(name) || userTypes.has(name)) {
    console.error(`Type ${name} is already declared`);
    throw new Error(`Type ${name} is already declared`);
  }

  if (getKeywords().some((x) => x === name)) {
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

export function isFunctionDeclared(
  functionTable: Map<string, Function>,
  funcName: string
) {
  return functionTable.has(funcName);
}
export function isTypeDeclared(
  typeName: string,
  userTypes: Map<string, ObjectSymbol>
): boolean {
  return builtInTypes.has(typeName) || userTypes.has(typeName);
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

export function getLiteralType(
  ctx: LiteralContext,
  userTypes: Map<string, ObjectSymbol>,
  objectAttributes: Variable[]
) {
  if (ctx.INT_LITERAL()) return "Int";
  if (ctx.FLOAT_LITERAL()) return "Float";
  if (ctx.STR_LITERAL()) return "String";
  if (ctx.bool_literal()) return "Boolean";
  if (ctx.list_literal()) return ctx.list_literal().text;
  if (ctx.object_literal().text) {
    const type = getObjectLiteralType(userTypes, objectAttributes);
    return type || ctx.object_literal().text;
  }
  return "NULL";
}

function getObjectLiteralType(
  userTypes: Map<string, ObjectSymbol>,
  objectAttributes: Variable[]
) {
  const type = Array.from(userTypes).find(
    ([name, object]) =>
      objectAttributes.every((x) => {
        const typeProperty = object.properties.get(x.name);
        return typeProperty && typeProperty.type === x.type;
      }) && objectAttributes.length === object.properties.size
  );
  return type ? type[0] : null;
}

export function getValIDType(scope: Scope, valID: string): string {
  if (!scope) return null;
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

export function getVariable(scope: Scope, variableName: string): Variable {
  if (!scope) throw new Error("Variable not found");
  const variable = scope.varsMap.get(variableName);
  if (variable) return variable;
  return getVariable(scope.enclosedScope, variableName);
}

function isPrimitive(type: string) {
  return primitives.some((x) => x === type);
}

type VariableType =
  | "Global"
  | "Function"
  | "GlobalTemporal"
  | "Constant"
  | "FunctionTemporal";

export function getVirtualAddress(
  type: string,
  variableType: VariableType,
  memoryMap: MemoryMap
) {
  if (isPrimitive(type)) {
    const virtualAddress = memoryMap[variableType][type as Primitives];
    memoryMap[variableType][type as Primitives]++;
    return virtualAddress;
  }
  return 1000;
}
