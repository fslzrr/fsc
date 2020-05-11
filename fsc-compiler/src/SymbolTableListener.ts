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
  TermContext,
  ExpContext,
  ExpressionContext,
  Binary_expressionContext,
} from "../lib/fsParser";
import { SymbolTable, ObjectSymbol, Variable } from "./SymbolTable";
import {
  isNameValid,
  isVarDeclared,
  isFuncDeclared,
  isTypeDeclared,
  extractObjectProperties,
  extractFuncArgs,
} from "./utils";

const currentScope: SymbolTable[] = [];

const binaryOperators = ["==", "!=", "<", ">", "<=", ">="];
const relationalOperators = ["&&", "||"];

const quadruples: [string, string, string, string][] = [];
const oprStack: string[] = [];
const operandsStack: string[] = [];
const typesStack: string[] = [];
let tempCounter = 1;

class SymbolTableListener implements fsListener {
  enterMain(ctx: MainContext) {
    const scope = new SymbolTable("main", currentScope.length, undefined);
    currentScope.push(scope);
  }

  exitVal_declaration(ctx: Val_declarationContext) {
    const scope = currentScope[currentScope.length - 1];
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;

    isNameValid(currentScope[0], name);

    if (scope.varsMap.has(name)) {
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
    scope.varsMap.set(name, { name, type });
  }

  exitFunc(ctx: FuncContext) {
    // Insert Function to funcMap of the parentScope
    const parentScope = currentScope[currentScope.length - 1].enclosedScope;

    const name = ctx.VAL_ID().text;
    const args = extractFuncArgs(ctx);
    const type = ctx.type_name().text;

    parentScope.funcMap.set(name, { name, args, type });

    currentScope.pop();
  }

  exitType_declaration(ctx: Type_declarationContext) {
    const mainScope = currentScope[0];

    const name = ctx.TYPE_ID().text;
    const properties = extractObjectProperties(ctx);

    isNameValid(currentScope[0], name);

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

  enterFactor(ctx: FactorContext) {
    const termState = ctx.parent.text;

    if (termState) {
      oprStack.push(termState[termState.length - 1]);
    }

    if (ctx.start.text === "(") {
      oprStack.push("(");
    }
  }

  exitFactor(ctx: FactorContext) {
    const scope = currentScope[currentScope.length - 1];
    if (ctx.VAL_ID() && !isVarDeclared(scope, ctx.text)) {
      throw new Error(`Undeclared variable "${ctx.VAL_ID().text}"`);
    }

    if (ctx.func_call() && !isFuncDeclared(scope, ctx.text)) {
      const funcName = ctx.func_call().VAL_ID();
      throw new Error(`Undeclared function "${funcName}"`);
    }

    if (ctx.VAL_ID() || ctx.literal()) {
      operandsStack.push(ctx.text);
    }

    if (
      oprStack[oprStack.length - 1] === "*" ||
      oprStack[oprStack.length - 1] === "/" ||
      oprStack[oprStack.length - 1] === "%"
    ) {
      const operator = oprStack.pop();
      const operandTwo = operandsStack.pop();
      const operandOne = operandsStack.pop();
      const tempName = "T" + tempCounter++;
      quadruples.push([operator, operandOne, operandTwo, tempName]);
      operandsStack.push(tempName);
    }

    if (ctx.text[ctx.text.length - 1] === ")") {
      oprStack.pop();
    }
  }

  enterTerm(ctx: TermContext) {
    const expState = ctx.parent.text;

    if (expState) {
      oprStack.push(expState[expState.length - 1]);
    }
  }

  exitTerm(ctx: TermContext) {
    if (
      oprStack[oprStack.length - 1] === "+" ||
      oprStack[oprStack.length - 1] === "-"
    ) {
      const operator = oprStack.pop();
      const operandTwo = operandsStack.pop();
      const operandOne = operandsStack.pop();
      const tempName = "T" + tempCounter++;
      quadruples.push([operator, operandOne, operandTwo, tempName]);
      operandsStack.push(tempName);
    }
  }

  enterExp(ctx: ExpContext) {
    const operators = (ctx.parent as Binary_expressionContext).binary_operators();

    if (operators && operators.length > 0) {
      oprStack.push(operators[operators.length - 1].text);
    }
  }

  exitExp(ctx: ExpContext) {
    if (binaryOperators.some((x) => x === oprStack[oprStack.length - 1])) {
      const operator = oprStack.pop();
      const operandTwo = operandsStack.pop();
      const operandOne = operandsStack.pop();
      const tempName = "T" + tempCounter++;
      quadruples.push([operator, operandOne, operandTwo, tempName]);
      operandsStack.push(tempName);
    }
  }

  enterBinary_expression(ctx: Binary_expressionContext) {
    const operators = (ctx.parent as ExpressionContext).relational_operators();

    if (operators && operators.length > 0) {
      oprStack.push(operators[operators.length - 1].text);
    }
  }

  exitBinary_expression(ctx: Binary_expressionContext) {
    if (relationalOperators.some((x) => x === oprStack[oprStack.length - 1])) {
      const operator = oprStack.pop();
      const operandTwo = operandsStack.pop();
      const operandOne = operandsStack.pop();
      const tempName = "T" + tempCounter++;
      quadruples.push([operator, operandOne, operandTwo, tempName]);
      operandsStack.push(tempName);
    }
  }

  enterExpression(ctx: ExpressionContext) {}

  exitExpression(ctx: ExpressionContext) {}

  exitType_name(ctx: Type_nameContext) {
    const name = ctx.text;
    if (
      !ctx.list_type() &&
      !ctx.func_type() &&
      !isTypeDeclared(currentScope[0], name)
    ) {
      throw new Error(`Type "${name}" is not declared`);
    }
  }

  exitMain(ctx: MainContext) {
    console.log(quadruples);
  }
}

export default SymbolTableListener;
