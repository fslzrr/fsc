import { fsListener } from "../lib/fsListener";
import {
  MainContext,
  FuncContext,
  Val_declarationContext,
  ArgContext,
  Type_declarationContext,
  Object_propertyContext,
  If_expressionContext,
  Else_if_expressionContext,
  Else_expressionContext,
} from "../lib/fsParser";
import { SymbolTable, ObjectSymbol, Variable } from "./SymbolTable";

const currentScope: SymbolTable[] = [];
let currentType: ObjectSymbol;

class Listener implements fsListener {
  enterMain(ctx: MainContext) {
    const scope = new SymbolTable("main", currentScope.length, undefined);
    currentScope.push(scope);
  }

  exitVal_declaration(ctx: Val_declarationContext) {
    const scope = currentScope[currentScope.length - 1];
    const name = ctx.children[1].text;
    const type = ctx.children[3].text;
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

  exitFunc(ctx: FuncContext) {
    currentScope.pop();
  }

  exitArg(ctx: ArgContext) {
    const scope = currentScope[currentScope.length - 1];
    const name = ctx.children[0].text;
    const type = ctx.children[2].text;

    scope.argsMap.set(name, { name, type });
  }

  enterType_declaration(ctx: Type_declarationContext) {
    currentType = { name: "", properties: new Set<Variable>() };
  }

  exitType_declaration(ctx: Type_declarationContext) {
    const name = ctx.children[1].text;
    const mainScope = currentScope[0];

    this.isNameValid(name);

    currentType.name = name;
    mainScope.userTypes.set(name, currentType);
    currentType = null;
  }

  exitObject_property(ctx: Object_propertyContext) {
    const name = ctx.children[0].text;
    const type = ctx.children[2].text;
    currentType.properties.add({ name, type });
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

  exitMain(ctx: MainContext) {}

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
}

export default Listener;
