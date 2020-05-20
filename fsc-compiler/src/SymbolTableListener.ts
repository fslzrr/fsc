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
  BlockContext,
  ParamContext,
  Func_callContext,
} from "../lib/fsParser";
import { Scope, Function, Variable } from "./SymbolTable";
import {
  isNameValid,
  isVarDeclared,
  isTypeDeclared,
  extractObjectProperties,
  getLiteralType,
  getValIDType,
  getExpressionType,
} from "./utils";
import { SemanticCubeTypes, SemanticCubeOperators } from "./SemanticCube";
import { Stack } from "./Stack";
import { ReservedKeywords, SymbolCodes, Operators } from "./fsc";

// Arrays with the fsc supported operators.
// They are classified by their precedence.
const termOperators = ["*", "/", "%"];
const expOperators = ["+", "-"];
const binaryOperators = ["==", "!=", "<", ">", "<=", ">="];
const relationalOperators = ["&&", "||"];

const functionTable = new Map<string, Function>();
const globalVariablesTable = new Map<string, Variable>();

// Stack containing the scopes of the program
const currentScope = new Stack<Scope>();
// Array with all the program's quadruples
const quadruples: [string, string, string, string][] = [];
// Stack of Operators
const oprStack = new Stack<Operators>();
// Stack of Operands
const operandsStack = new Stack<string>();
// Stack of Types
const typesStack = new Stack<string>();
// Stack of Jumps
const jumpsStack = new Stack<number>();
// Map with the constants memory address
const constantTable = new Map<number | string, number>();
// Variable for counting the current temporal
let tempCounter = 1;
let argPointer = 0;

class QuadruplesListener implements fsListener {
  enterMain(ctx: MainContext) {
    const scope = new Scope("Global", "Global", undefined);
    currentScope.push(scope);
  }

  exitVal_declaration(ctx: Val_declarationContext) {
    const scope = currentScope.top();
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;

    isNameValid(currentScope.top(), name);

    if (scope.varsMap.has(name)) {
      console.error(
        `Variable "${name}" has already been declared in this scope.`
      );
      throw new Error(
        `Variable "${name}" has already been declared in this scope.`
      );
    }

    const expressionType = typesStack.pop();

    if (expressionType !== type) {
      console.error(
        `Type mismatch in variable "${name}", expected "${type}" but got "${expressionType}"`
      );
      throw new Error(
        `Type mismatch in variable "${name}", expected "${type}" but got "${expressionType}"`
      );
    }
    const variable = { name, type, virtualAddress: 1000 };

    if (scope.scopeName === "Global") globalVariablesTable.set(name, variable);
    else functionTable.get(scope.scopeName).variables.set(name, variable);

    // Insert variable to current scope
    scope.varsMap.set(name, variable);
  }

  enterFunc(ctx: FuncContext) {
    const funcName = ctx.start.text;
    const scope = new Scope(funcName, "Function", currentScope.top());

    functionTable.set(funcName, {
      name: funcName,
      args: [],
      variables: new Map(),
      tempVariables: [],
      type: "",
      startQuadruple: quadruples.length,
      returnVirtualAddress: 1000,
    });

    currentScope.push(scope);
  }

  exitArg(ctx: ArgContext) {
    const scope = currentScope.top();
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;
    const variable = { name, type, virtualAddress: 1000 };

    const funcName = scope.scopeName;
    const func = functionTable.get(funcName);
    func.variables.set(name, variable);
    func.args.push(variable);

    // Insert arguments to Scope vars table
    scope.varsMap.set(name, variable);
  }

  exitParam(ctx: ParamContext) {
    const funcName = (ctx.parent as Func_callContext).VAL_ID().text;
    const func = functionTable.get(funcName);

    // Check if the amount of arguments is correct
    if (func.args.length === 0) {
      console.log("Too many arguments in function");
      throw new Error("Too many arguments in function");
    }

    const arg = func.args[argPointer];
    const operand = operandsStack.pop();
    const argType = typesStack.pop();

    // Check if argument type is correct
    if (argType !== arg.type) {
      console.error("Type Mismatch in Arg");
      throw new Error("Type Mismatch in Args");
    }

    // Add PARAM operation to quadruples
    quadruples.push(["PARAM", operand, "", String(arg.virtualAddress)]);
    argPointer++;
  }

  exitFunc(ctx: FuncContext) {
    currentScope.pop();

    // Add ENDFUNC Quadruple
    quadruples.push(["ENDFUNC", "", "", ""]);
  }

  enterFunc_call(ctx: Func_callContext) {
    const funcName = ctx.start.text;
    quadruples.push(["ERA", funcName, "", ""]);
  }

  exitType_declaration(ctx: Type_declarationContext) {
    const scope = currentScope.top();

    const name = ctx.TYPE_ID().text;
    const properties = extractObjectProperties(ctx);

    isNameValid(scope, name);

    scope.userTypes.set(name, { name, properties: new Set(properties) });
  }

  enterIf_expression(ctx: If_expressionContext) {
    // Insert new scope to scopes stack
    const scope = new Scope(
      currentScope.top().scopeName,
      "Conditional",
      currentScope.top()
    );

    currentScope.push(scope);
  }

  enterElse_if_expression(ctx: Else_if_expressionContext) {
    currentScope.pop();

    // Update jump in GOTOF quadruple
    if (!jumpsStack.empty()) {
      const jump = jumpsStack.pop();
      const quadruple = quadruples[jump];
      quadruple[3] = String(quadruples.length);
    }
  }

  enterElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
    const scope = new Scope(
      currentScope.top().scopeName,
      "Conditional",
      currentScope.top()
    );

    currentScope.push(scope);

    // Update jump in GOTOF quadruple
    const jump = jumpsStack.pop();
    const quadruple = quadruples[jump];
    quadruple[3] = String(quadruples.length);
  }

  exitElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
  }

  enterBlock(ctx: BlockContext) {
    const parentChildren = ctx.parent.children;
    const then = parentChildren[2];

    if (then && then.text === ReservedKeywords.THEN) {
      jumpsStack.push(quadruples.length);
      quadruples.push(["GOTOF", quadruples[quadruples.length - 1][3], "", ""]);
    }
  }

  exitBlock(ctx: BlockContext) {
    const returnExpression = ctx.all_expressions().expression();
    const scopeName = currentScope.top().scopeName;

    if (returnExpression) {
      const operand = operandsStack.pop();
      const expressionType = typesStack.pop();

      // Check if the return type is correct
      if (expressionType !== functionTable.get(scopeName).type) {
        console.error("Incorrect return type in function");
        throw new Error("Incorrect return type in function");
      }

      // Add return quadruple
      quadruples.push(["RETURN", "", "", operand]);
    }
  }

  /*
  Check if the parser read a Term Operator. If yes, add it
  to the oprStack
   */
  enterFactor(ctx: FactorContext) {
    const termState = ctx.parent.text;

    if (termState) {
      oprStack.push(termState[termState.length - 1] as Operators);
    }

    if (ctx.start.text === "(" || functionTable.has(ctx.start.text)) {
      oprStack.push("(");
    }
  }

  /*
  When you exit a Factor, check if there is
  a pending Term expression to perform. If yes, add a new quadruple.
  */
  exitFactor(ctx: FactorContext) {
    const scope = currentScope.top();
    const scopeName = scope.scopeName;
    if (ctx.VAL_ID() && !isVarDeclared(scope, ctx.text)) {
      console.error(`Undeclared variable "${ctx.VAL_ID().text}"`);
      throw new Error(`Undeclared variable "${ctx.VAL_ID().text}"`);
    }

    if (
      ctx.func_call() &&
      scopeName !== "Global" &&
      !functionTable.has(scopeName)
    ) {
      const funcName = ctx.func_call().VAL_ID().text;
      console.error(`Undeclared function "${funcName}"`);
      throw new Error(`Undeclared function "${funcName}"`);
    }

    const isValID = ctx.VAL_ID();
    const isLiteral = ctx.literal();
    const isFuncCall = ctx.func_call();

    if (isValID || isLiteral) {
      operandsStack.push(ctx.text);
      if (isValID) typesStack.push(getValIDType(scope, ctx.text));
      else {
        constantTable.set(ctx.literal().text, 1000);
        typesStack.push(getLiteralType(isLiteral));
      }
    }

    if (ctx.text[ctx.text.length - 1] === ")") {
      oprStack.pop();
    }

    if (isFuncCall) {
      this.addFunctionCallQuadruples(ctx.func_call().VAL_ID().text);
      argPointer = 0;
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
      oprStack.push(expState[expState.length - 1] as Operators);
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
      oprStack.push(operators[operators.length - 1].text as Operators);
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
      oprStack.push(operators[operators.length - 1].text as Operators);
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

  enterExpression(ctx: ExpressionContext) {
    // Entered Assignation
    if (ctx.parent.ruleContext.start.text === "=") {
      oprStack.push("=");
    }
  }

  exitExpression(ctx: ExpressionContext) {
    if (oprStack.top() === "=") {
      this.addAssignationQuadruple(ctx.parent.parent as Val_declarationContext);
    }

    if (ctx.parent instanceof If_expressionContext) {
      const type = typesStack.pop();
      operandsStack.pop();
      if (type !== "Boolean") {
        console.error("Expression type must be boolean");
        throw new Error("Expression type must be boolean");
      }
    }
  }

  exitType_name(ctx: Type_nameContext) {
    // Check if type used exists
    const name = ctx.text;
    if (
      !ctx.list_type() &&
      !ctx.func_type() &&
      !isTypeDeclared(currentScope.top(), name)
    ) {
      console.error(`Type "${name}" is not declared`);
      throw new Error(`Type "${name}" is not declared`);
    }

    // Add return type to Function Table
    if (ctx.parent instanceof FuncContext) {
      const funcName = currentScope.top().scopeName;
      const returnType =
        ctx.parent.children[ctx.parent.children.length - 1].text;
      functionTable.get(funcName).type = returnType;
    }
  }

  // Adds a quadruple to the quadruple array, making sure that the operation is valid
  addQuadruple() {
    const scopeName = currentScope.top().scopeName;
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

    if (oprResult === "Error") {
      console.error("Type Error in Expression");
      throw new Error("Type Error in Expression");
    }

    const tempName = "T" + tempCounter++;
    const variable = {
      name: tempName,
      type: oprResult,
      virtualAddress: 1000,
    };

    if (scopeName === "Global") globalVariablesTable.set(tempName, variable);
    else functionTable.get(scopeName).tempVariables.push(variable);

    quadruples.push([operator, operandOne, operandTwo, tempName]);
    operandsStack.push(tempName);
    typesStack.push(oprResult);
  }

  addAssignationQuadruple(ctx: Val_declarationContext) {
    const operator = oprStack.pop();
    const operandOne = operandsStack.pop();
    const variable = ctx.VAL_ID().text;

    quadruples.push([operator, operandOne, "", variable]);
  }

  addFunctionCallQuadruples(funcName: string) {
    const func = functionTable.get(funcName);
    quadruples.push(["GOSUB", funcName, "", ""]);
    const temp = "T" + tempCounter++;
    quadruples.push(["=", funcName, "", temp]);
    operandsStack.push(temp);
    typesStack.push(func.type);

    const scopeName = currentScope.top().scopeName;
    const tempVariable: Variable = {
      name: temp,
      type: func.type,
      virtualAddress: 1000,
    };
    if (scopeName === "Global") globalVariablesTable.set(temp, tempVariable);
    else functionTable.get(scopeName).tempVariables.push(tempVariable);
  }

  exitMain(ctx: MainContext) {
    console.log("QUADRUPLES", quadruples);
    console.log("OPERANDS", operandsStack);
    console.log("OPERATORS", oprStack);
    console.log("TYPES", typesStack);
    console.log("Scope", currentScope);
    console.log(constantTable);
    console.log(globalVariablesTable);
    console.log(functionTable);
    debugger;
  }
}

export default QuadruplesListener;
