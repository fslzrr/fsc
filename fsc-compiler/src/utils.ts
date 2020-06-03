import { Scope, Variable, Function, ObjectSymbol } from "./SymbolTable";
import { LiteralContext } from "../lib/fsParser";
import {
  SemanticCubeTypes,
  SemanticCubeOperators,
  SemanticCube,
} from "./SemanticCube";
import { MemoryMap } from "./memoryMap";
import { primitives, Primitives, builtInTypes, getKeywords } from "./fsc";

// Check if the name given to a type or variable is valid
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

// Checks if variable with name "varName" is declared
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

// Get the type of a Literal Context
export function getLiteralType(ctx: LiteralContext, enclosedType?: string) {
  if (ctx.INT_LITERAL()) return "Int";
  if (ctx.FLOAT_LITERAL()) return "Float";
  if (ctx.STR_LITERAL()) return "String";
  if (ctx.bool_literal()) return "Boolean";
  if (ctx.list_literal()) return `${enclosedType}`;
  return "NULL";
}

// Get the type of a given variable ID
export function getValIDType(scope: Scope, valID: string): string {
  if (!scope) return null;
  const valIDRef = scope.varsMap.get(valID);
  if (valIDRef) return valIDRef.type;
  return getValIDType(scope.enclosedScope, valID);
}

// Returns the expression type according to the Semantic Cube
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

// Searches "variableName" declaration
export function getVariable(scope: Scope, variableName: string): Variable {
  if (!scope)
    throw new Error(`Trying to access undeclared variable "${variableName}"`);
  const variable = scope.varsMap.get(variableName);
  if (variable) return variable;
  return getVariable(scope.enclosedScope, variableName);
}

// Checks if given type is a priitive
function isPrimitive(type: string): boolean {
  return primitives.some((x) => x === type);
}

type VariableType =
  | "Global"
  | "Function"
  | "GlobalTemporal"
  | "Constant"
  | "FunctionTemporal";

// Returns the next virtual address given the Variable type and scope
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
  if (isList(type)) {
    const virtualAddress = memoryMap[variableType]["List"];
    memoryMap[variableType]["List"]++;
    return virtualAddress;
  }
  return 1000;
}

export function isList(listType: string): boolean {
  const p = isPrimitive(listType);
  if (p) return false;
  const t = listType.slice(1, -1); //  [Int] -> Int
  return isPrimitive(t) || isList(listType);
}

export function getNestedType(listType: string) {
  return listType.slice(1, -1);
}

export function getPrimitiveType(listType: string): string {
  const t = listType.slice(1, -1);
  return isPrimitive(t) ? t : getPrimitiveType(t);
}
