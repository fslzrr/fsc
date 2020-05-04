import { fsListener } from "../lib/fsListener";
import {
  MainContext,
  FuncContext,
  Val_declarationContext,
  ArgContext,
  Type_declarationContext,
  If_expressionContext,
  Else_if_expressionContext,
  Else_expressionContext,
  FactorContext,
  Type_nameContext,
} from "../lib/fsParser";
import { SymbolTable, ObjectSymbol, Variable } from "./SymbolTable";

const currentScope: SymbolTable[] = [];

class SymbolTableListener implements fsListener {
  enterMain(ctx: MainContext) {
    const scope = new SymbolTable("main", currentScope.length, undefined);
    currentScope.push(scope);
  }

  exitVal_declaration(ctx: Val_declarationContext) {
    const scope = currentScope[currentScope.length - 1];
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;

    this.isNameValid(name);

    if (scope.argsMap.has(name) || scope.varsMap.has(name)) {
      throw new Error(
        `Variable "${name}" has already been declared in this scope.`
      );
    }

    scope.varsMap.set(name, { name, type });
  }

  enterFunc(ctx: FuncContext) {
    const scope = new SymbolTable(
      ctx.start.text,
      currentScope.length,
      currentScope[currentScope.length - 1]
    );

    currentScope.push(scope);
  }

  exitArg(ctx: ArgContext) {
    const scope = currentScope[currentScope.length - 1];
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;
    scope.argsMap.set(name, { name, type });
  }

  exitFunc(ctx: FuncContext) {
    // Insert Function to funcMap of the parentScope
    const parentScope = currentScope[currentScope.length - 1].enclosedScope;

    const name = ctx.VAL_ID().text;
    const args = ctx.arg().map((arg) => {
      const name = arg.VAL_ID().text;
      const type = arg.type_name().text;

      return { name, type } as Variable;
    });
    const type = ctx.type_name().text;

    parentScope.funcMap.set(name, { name, args, type });

    currentScope.pop();
  }

  exitType_declaration(ctx: Type_declarationContext) {
    const mainScope = currentScope[0];

    const name = ctx.TYPE_ID().text;
    const properties = ctx
      .object_type()
      .object_property()
      .map((property) => {
        const name = property.VAL_ID().text;
        const type = property.type_name().text;

        return { name, type } as Variable;
      });

    this.isNameValid(name);

    mainScope.userTypes.set(name, { name, properties: new Set(properties) });
  }

  enterIf_expression(ctx: If_expressionContext) {
    const scope = new SymbolTable(
      ctx.start.text,
      currentScope.length,
      currentScope[currentScope.length - 1]
    );

    currentScope.push(scope);
  }

  enterElse_if_expression(ctx: Else_if_expressionContext) {
    currentScope.pop();
  }

  enterElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
    const scope = new SymbolTable(
      ctx.start.text,
      currentScope.length,
      currentScope[currentScope.length - 1]
    );

    currentScope.push(scope);
  }

  exitElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
  }

  exitFactor(ctx: FactorContext) {
    const scope = currentScope[currentScope.length - 1];
    if (ctx.VAL_ID() && !this.isVarDeclared(scope, ctx.text)) {
      throw new Error(`Undeclared variable "${ctx.VAL_ID().text}"`);
    }

    if (ctx.func_call() && !this.isFuncDeclared(scope, ctx.text)) {
      const funcName = ctx.func_call().VAL_ID();
      throw new Error(`Undeclared function "${funcName}"`);
    }
  }

  exitType_name(ctx: Type_nameContext) {
    const name = ctx.text;
    if (!ctx.list_type() && !ctx.func_type() && !this.isTypeDeclared(name)) {
      throw new Error(`Type "${name}" is not declared`);
    }
  }

  exitMain(ctx: MainContext) {
    console.log(currentScope[0].userTypes);
  }

  isNameValid(name: string) {
    const mainScope = currentScope[0];
    if (mainScope.builtInTypes.has(name) || mainScope.userTypes.has(name)) {
      throw new Error(`Type ${name} is already declared`);
    }

    if (mainScope.reservedKeywords.has(name)) {
      throw new Error(`${name} is a reserved keyword`);
    }

    return true;
  }

  isVarDeclared(scope: SymbolTable, varName: string): boolean {
    if (!scope) return false;
    if (scope.argsMap.has(varName) || scope.varsMap.has(varName)) return true;
    return this.isVarDeclared(scope.enclosedScope, varName);
  }

  isFuncDeclared(scope: SymbolTable, funcName: string): boolean {
    if (!scope) return false;
    if (scope.funcMap.get(funcName)) return true;
    return this.isFuncDeclared(scope.enclosedScope, funcName);
  }

  isTypeDeclared(typeName: string): boolean {
    const mainScope = currentScope[0];

    return (
      mainScope.builtInTypes.has(typeName) || mainScope.userTypes.has(typeName)
    );
  }
}

export default SymbolTableListener;
