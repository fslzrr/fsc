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
  getLiteralType,
  getValIDType,
  getExpressionType,
} from "./utils";
import { SemanticCubeTypes, SemanticCubeOperators } from "./SemanticCube";
import { Stack } from "./Stack";

const termOperators = ["*", "/", "%"];
const expOperators = ["+", "-"];
const binaryOperators = ["==", "!=", "<", ">", "<=", ">="];
const relationalOperators = ["&&", "||"];

const currentScope = new Stack<SymbolTable>();
const quadruples = new Stack<[string, string, string, string]>();
const oprStack = new Stack<string>();
const operandsStack = new Stack<string>();
const typesStack = new Stack<string>();
let tempCounter = 1;

class SymbolTableListener implements fsListener {
  enterMain(ctx: MainContext) {
    const scope = new SymbolTable("main", currentScope.length, undefined);
    currentScope.push(scope);
  }

  exitVal_declaration(ctx: Val_declarationContext) {
    const scope = currentScope.top();
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;

    isNameValid(currentScope.bottom(), name);

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
      currentScope.top()
    );

    currentScope.push(scope);
  }

  exitArg(ctx: ArgContext) {
    const scope = currentScope.top();
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;
    scope.varsMap.set(name, { name, type });
  }

  exitFunc(ctx: FuncContext) {
    // Insert Function to funcMap of the parentScope
    const parentScope = currentScope.top().enclosedScope;

    const name = ctx.VAL_ID().text;
    const args = extractFuncArgs(ctx);
    const type = ctx.type_name().text;

    parentScope.funcMap.set(name, { name, args, type });

    currentScope.pop();
  }

  exitType_declaration(ctx: Type_declarationContext) {
    const mainScope = currentScope.bottom();

    const name = ctx.TYPE_ID().text;
    const properties = extractObjectProperties(ctx);

    isNameValid(currentScope.bottom(), name);

    mainScope.userTypes.set(name, { name, properties: new Set(properties) });
  }

  enterIf_expression(ctx: If_expressionContext) {
    const scope = new SymbolTable(
      ctx.start.text,
      currentScope.length,
      currentScope.top()
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
      currentScope.top()
    );

    currentScope.push(scope);
  }

  exitElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
  }

  /*
  Check if the parser read a Term Operator. If yes, add it
  to the oprStack
   */
  enterFactor(ctx: FactorContext) {
    const termState = ctx.parent.text;

    if (termState) {
      oprStack.push(termState[termState.length - 1]);
    }

    if (ctx.start.text === "(") {
      oprStack.push("(");
    }
  }

  /*
  When you exit a Factor, check if there is
  a pending Term expression to perform. If yes, add a new quadruple.
  */
  exitFactor(ctx: FactorContext) {
    const scope = currentScope.top();
    if (ctx.VAL_ID() && !isVarDeclared(scope, ctx.text)) {
      throw new Error(`Undeclared variable "${ctx.VAL_ID().text}"`);
    }

    if (
      ctx.func_call() &&
      !isFuncDeclared(scope, ctx.func_call().VAL_ID().text)
    ) {
      const funcName = ctx.func_call().VAL_ID();
      throw new Error(`Undeclared function "${funcName}"`);
    }

    const isValID = ctx.VAL_ID();
    const isLiteral = ctx.literal();

    if (isValID || isLiteral) {
      operandsStack.push(ctx.text);
      if (isValID) typesStack.push(getValIDType(scope, ctx.text));
      else typesStack.push(getLiteralType(isLiteral));
    }

    if (ctx.text[ctx.text.length - 1] === ")") {
      oprStack.pop();
    }

    if (termOperators.some((x) => x === oprStack.top())) {
      this.addQuadruple();
    }
  }

  /*
  Check if the parser read a Exp Operator. If yes, add it
  to the oprStack
   */
  enterTerm(ctx: TermContext) {
    const expState = ctx.parent.text;

    if (expState) {
      oprStack.push(expState[expState.length - 1]);
    }
  }

  /*
  When you exit a Term, check if there is
  a pending Exp expression to perform. If yes, add a new quadruple.
  */
  exitTerm(ctx: TermContext) {
    if (expOperators.some((x) => x === oprStack.top())) {
      this.addQuadruple();
    }
  }

  /*
  Check if the parser read a Binary Operator. If yes, add it
  to the oprStack
   */
  enterExp(ctx: ExpContext) {
    const operators = (ctx.parent as Binary_expressionContext).binary_operators();

    if (operators && operators.length > 0) {
      oprStack.push(operators[operators.length - 1].text);
    }
  }

  /*
  When you exit an Exp, check if there is
  a pending Binary expression to perform. If yes, add a new quadruple.
  */
  exitExp(ctx: ExpContext) {
    if (binaryOperators.some((x) => x === oprStack.top())) {
      this.addQuadruple();
    }
  }

  /*
  Check if the parser read a Relational Operator. If yes, add it
  to the oprStack
   */
  enterBinary_expression(ctx: Binary_expressionContext) {
    const operators = (ctx.parent as ExpressionContext).relational_operators();

    if (operators && operators.length > 0) {
      oprStack.push(operators[operators.length - 1].text);
    }
  }

  /*
  When you exit a Binary Expression, check if there is 
  a pending Relational expression to perform. If yes, add a new quadruple.
  */
  exitBinary_expression(ctx: Binary_expressionContext) {
    if (relationalOperators.some((x) => x === oprStack.top())) {
      this.addQuadruple();
    }
  }

  enterExpression(ctx: ExpressionContext) {}

  exitExpression(ctx: ExpressionContext) {
    if (operandsStack.empty() || oprStack.empty()) {
      console.log("QUADRUPLES", quadruples);
      operandsStack.reset();
      oprStack.reset();
      typesStack.reset();
      quadruples.reset();
    }
  }

  // Check if type used exists
  exitType_name(ctx: Type_nameContext) {
    const name = ctx.text;
    if (
      !ctx.list_type() &&
      !ctx.func_type() &&
      !isTypeDeclared(currentScope.bottom(), name)
    ) {
      throw new Error(`Type "${name}" is not declared`);
    }
  }

  // Adds a quadruple to the quadruple array, making sure that the operation is valid
  addQuadruple() {
    const operator = oprStack.pop() as SemanticCubeOperators;
    const operandTwo = operandsStack.pop();
    const operandTwoType = typesStack.pop() as SemanticCubeTypes;
    const operandOne = operandsStack.pop();
    const operandOneType = typesStack.pop() as SemanticCubeTypes;

    const oprResult = getExpressionType(
      operandOneType,
      operandTwoType,
      operator
    );

    if (oprResult === "Error") throw new Error("Type Error in Expression");

    const tempName = "T" + tempCounter++;
    quadruples.push([operator, operandOne, operandTwo, tempName]);
    operandsStack.push(tempName);
    typesStack.push(oprResult);
  }

  exitMain(ctx: MainContext) {
    console.log("QUADRUPLES", quadruples);
    console.log("OPERANDS", operandsStack);
    console.log("OPERATORS", oprStack);
    console.log("TYPES", typesStack);
  }
}

export default SymbolTableListener;
