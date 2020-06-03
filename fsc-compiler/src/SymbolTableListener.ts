import { fsListener } from "../lib/fsListener";
import {
  MainContext,
  FuncContext,
  Val_declarationContext,
  ArgContext,
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
  AssignationContext,
  PrintContext,
  ExecutionContext,
  UnaryOprContext,
  List_literalContext,
  HeadContext,
  TailContext,
  PreludeContext,
  LengthContext,
} from "../lib/fsParser";
import { Scope, Function, Variable, ObjectSymbol } from "./SymbolTable";
import {
  isNameValid,
  isVarDeclared,
  isTypeDeclared,
  getLiteralType,
  getExpressionType,
  getVirtualAddress,
  getVariable,
  isFunctionDeclared,
  isList,
} from "./utils";
import { SemanticCubeTypes, SemanticCubeOperators } from "./SemanticCube";
import { Stack } from "./Stack";
import { ReservedKeywords, Operators, primitives } from "./fsc";
import memoryMap, { MemoryMap } from "./memoryMap";
import VirtualMachine from "./vm/vm";

// Arrays with the fsc supported operators.
// They are classified by their precedence.
const termOperators = ["*", "/", "%"];
const expOperators = ["+", "-"];
const binaryOperators = ["==", "!=", "<", ">", "<=", ">="];
const relationalOperators = ["&&", "||"];

const functionTable = new Map<string, Function>();
const globalVariablesTable = new Map<string, Variable>();
const userTypes = new Map<string, ObjectSymbol>();

// Stack containing the scopes of the program
const currentScope = new Stack<Scope>();
// Array with all the program's quadruples
const quadruples: [string, string, string, string][] = [];
// Stack of Operators
const oprStack = new Stack<Operators>();
// Stack of Operands
const operandsStack = new Stack<string>();
const operandsForListMap = new Map<string, Variable>();
// Stack of Types
const typesStack = new Stack<string>();
// Stack of Jumps
const jumpsStack = new Stack<number>();
// Stack of List Elements
const listsOrderStack = new Stack<string>();
let listsElementsTemporalCounter = 0;
// Map with the constants memory address
const constantTable = new Map<number | string, number>();
let foundFirstFunc = false;
let argPointer = 0;
let currentVarName = "";

const virtualAddresses = { ...memoryMap } as MemoryMap;

class QuadruplesListener implements fsListener {
  // Insert main scope to scopeStack
  enterMain(ctx: MainContext) {
    const scope = new Scope("Global", "Global", undefined);
    currentScope.push(scope);
  }

  // Start linear expressions quadruple generation

  /*
  Check if the parser read a Term Operator. If yes, add it
  to the oprStack
   */
  enterFactor(ctx: FactorContext) {
    if ((ctx.parent as UnaryOprContext).NOT()) oprStack.push("!");

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
    const isValID = ctx.VAL_ID();

    // Check if the variable trying to access is declared
    if (isValID) {
      if (!isVarDeclared(scope, ctx.text)) {
        console.error(`Undeclared variable "${isValID.text}"`);
        throw new Error(`Undeclared variable "${isValID.text}"`);
      }
      if (isValID.text === currentVarName) {
        console.error(
          `Accessing variable "${isValID.text}" before declaration.`
        );
        throw new Error(
          `Accessing variable "${isValID.text}" before declaration.`
        );
      }
    }

    // Check if the function trying to call is declared
    if (
      ctx.func_call() &&
      scopeName !== "Global" &&
      !functionTable.has(scopeName)
    ) {
      const funcName = ctx.func_call().VAL_ID().text;
      console.error(`Undeclared function "${funcName}"`);
      throw new Error(`Undeclared function "${funcName}"`);
    }

    const isLiteral = ctx.literal();
    const isFuncCall = ctx.func_call();

    const isPrelude = ctx.prelude();
    if (isPrelude) this.handlePrelude(isPrelude);

    if (isValID) {
      const variable = getVariable(scope, ctx.text);
      operandsStack.push(String(variable.virtualAddress));
      typesStack.push(variable.type);
      if (isList(variable.type)) {
        operandsForListMap.set(String(variable.virtualAddress), variable);
      }
    } else if (isLiteral) {
      const literal = ctx.literal().text;
      const literalType = getLiteralType(isLiteral, typesStack.top());
      const isLiteralList = ctx.literal().list_literal();
      if (!isLiteralList && !constantTable.get(literal))
        constantTable.set(
          literal,
          getVirtualAddress(literalType, "Constant", virtualAddresses)
        );
      if (!isLiteralList) {
        const operand = String(constantTable.get(ctx.text) || isValID.text);
        operandsStack.push(operand);
        typesStack.push(literalType);
      }
    }

    // Remove parentheses from oprStack
    if (ctx.text[ctx.text.length - 1] === ")") {
      oprStack.pop();
    }

    // If isFuncCall is true, add function call quadruple
    if (isFuncCall) {
      this.addFunctionCallQuadruples(ctx.func_call().VAL_ID().text);
      argPointer = 0;
    }

    // If there is a pending not operator to apply, apply it
    if (oprStack.top() === "!") this.addNotQuadruple();
  }

  // Insert + or - operation to oprStack
  enterUnaryOpr(ctx: UnaryOprContext) {
    const termState = ctx.parent.text;

    if (termState) {
      oprStack.push(termState[termState.length - 1] as Operators);
    }
  }

  // Check if there is a pending + or - operation and apply it
  exitUnaryOpr(ctx: UnaryOprContext) {
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

  // If parent is assignation, add "=" to oprStack
  enterExpression(ctx: ExpressionContext) {
    if (ctx.parent instanceof AssignationContext) {
      oprStack.push("=");
    }

    if (ctx.parent instanceof List_literalContext) {
    }
  }

  // Make sure the expression inside an If is Boolean.
  // If expression is inside print, add print quadruple
  exitExpression(ctx: ExpressionContext) {
    // Check if if expression is of Boolean type
    if (ctx.parent instanceof If_expressionContext) {
      const type = typesStack.pop();
      operandsStack.pop();
      if (type !== "Boolean") {
        console.error("Expression type must be Boolean");
        throw new Error("Expression type must be Boolean");
      }
    }

    if (ctx.parent instanceof List_literalContext) {
      this.addTemporalListElementVariable(ctx);
    }

    if (ctx.parent instanceof PrintContext) {
      const operand = operandsStack.pop();
      typesStack.pop();
      const operandVariable = operandsForListMap.get(operand);
      if (operandVariable && operandVariable.values) {
        operandVariable.values.forEach((v) => {
          quadruples.push(["print", "", "", String(v.virtualAddress)]);
        });
        operandsForListMap.delete(operand);
      } else if (!operandVariable) {
        quadruples.push(["print", "", "", operand]);
      }
    }
  }

  // End linear expressions quadruple generation

  // Check if the variable declared is not already declared
  enterAssignation(ctx: AssignationContext) {
    const scope = currentScope.top();
    const name = (ctx.parent as Val_declarationContext).VAL_ID().text;
    const type = (ctx.parent as Val_declarationContext).type_name().text;
    currentVarName = name;

    isNameValid(name, userTypes);

    if (scope.varsMap.has(name)) {
      console.error(
        `Variable "${name}" has already been declared in this scope.`
      );
      throw new Error(
        `Variable "${name}" has already been declared in this scope.`
      );
    }

    // Create variable and insert it to the current scope and the corresponding
    // variable tables
    const virtualAddress = getVirtualAddress(
      type,
      scope.scopeType,
      virtualAddresses
    );
    const variable = {
      name,
      type,
      virtualAddress,
      nestedVariables: new Map(),
    };

    // Add list variable to lists flow
    if (isList(type)) {
      listsOrderStack.push(name);
      operandsStack.push(String(virtualAddress));
      typesStack.push(type);
    }

    if (scope.scopeName === "Global") globalVariablesTable.set(name, variable);
    else functionTable.get(scope.scopeName).variables.set(name, variable);

    // Insert variable to current scope
    scope.varsMap.set(name, variable);
  }

  // Check that the value assigned to variable is of the correct type
  exitAssignation(ctx: AssignationContext) {
    const variableName = (ctx.parent as Val_declarationContext).VAL_ID().text;
    const scopeName = currentScope.top().scopeName;
    const expressionType = typesStack.pop();

    const type =
      scopeName === "Global"
        ? globalVariablesTable.get(variableName).type
        : functionTable.get(scopeName).variables.get(variableName).type;

    if (expressionType !== type) {
      console.error(
        `Type mismatch in variable "${variableName}", expected "${type}" but got "${expressionType}"`
      );
      throw new Error(
        `Type mismatch in variable "${variableName}", expected "${type}" but got "${expressionType}"`
      );
    }

    if (oprStack.top() === "=") {
      primitives.some((x) => x === expressionType) || isList(expressionType)
        ? this.addAssignationQuadruple(ctx.parent as Val_declarationContext)
        : oprStack.pop();
    }

    currentVarName = "";
  }

  // Add the initial GOTO to the quadruples, add function to function table
  // and push a new Scope into the scopeStack
  enterFunc(ctx: FuncContext) {
    // Add the initial GOTO
    if (!foundFirstFunc) {
      jumpsStack.push(quadruples.length);
      quadruples.push(["GOTO", "", "", ""]);
      foundFirstFunc = true;
    }

    // Reset Virtual Addresses
    virtualAddresses.Function = { ...memoryMap.Function };
    virtualAddresses.GlobalTemporal = { ...memoryMap.GlobalTemporal };
    virtualAddresses.FunctionTemporal = { ...memoryMap.FunctionTemporal };

    const funcName = ctx.start.text;
    const scope = new Scope(funcName, "Function", currentScope.top());

    if (isFunctionDeclared(functionTable, funcName)) {
      console.error(
        `Function ${funcName} has already been declared in this scope.`
      );
      throw new Error(
        `Function ${funcName} has already been declared in this scope.`
      );
    }

    functionTable.set(funcName, {
      name: funcName,
      args: [],
      variables: new Map(),
      tempVariables: 0,
      type: "",
      startQuadruple: quadruples.length,
      returnVirtualAddress: -1,
    });

    currentScope.push(scope);
  }

  // Insert arguments to function variables table and to current scope.
  exitArg(ctx: ArgContext) {
    const scope = currentScope.top();
    const name = ctx.VAL_ID().text;
    const type = ctx.type_name().text;
    const variable = {
      name,
      type,
      virtualAddress: getVirtualAddress(type, "Function", virtualAddresses),
      nestedVariables: new Map(),
    };

    const funcName = scope.scopeName;
    const func = functionTable.get(funcName);
    func.variables.set(name, variable);
    func.args.push(variable);

    // Insert arguments to Scope vars table
    scope.varsMap.set(name, variable);
  }

  // Checks if the function call has the correct amount of arguments and the types
  // match with the function signature
  exitParam(ctx: ParamContext) {
    const funcName = (ctx.parent as Func_callContext).VAL_ID().text;
    const func = functionTable.get(funcName);

    // Check if the amount of arguments is correct
    if (func.args.length === 0) {
      console.error("Too many arguments in function");
      throw new Error(`Too many arguments in function ${funcName} call.`);
    }

    const arg = func.args[argPointer];
    const operand = operandsStack.pop();
    const argType = typesStack.pop();

    // Check if argument type is correct
    if (argType !== arg.type) {
      console.error(
        `Type mismatch in argument "${arg.name}", expected "${arg.type}" but got "${argType}"`
      );
      throw new Error(
        `Type mismatch in argument "${arg.name}", expected "${arg.type}" but got "${argType}"`
      );
    }

    // Add PARAM operation to quadruples
    quadruples.push(["PARAM", operand, "", arg.name]);
    argPointer++;
  }

  // Pop the current scope and add ENDFUNC quadruple
  exitFunc(ctx: FuncContext) {
    currentScope.pop();

    // Add ENDFUNC Quadruple
    quadruples.push(["ENDFUNC", "", "", ""]);
  }

  // Add ERA quadruple
  enterFunc_call(ctx: Func_callContext) {
    const funcName = ctx.start.text;
    quadruples.push(["ERA", "", "", funcName]);
  }

  // Ensure the correct amount of params were sent to the function call
  exitFunc_call(ctx: Func_callContext) {
    const funcName = ctx.VAL_ID().text;
    const func = functionTable.get(funcName);
    const paramsNum = ctx.param().length;
    if (paramsNum < func.args.length) {
      console.error(`Too few arguments in function ${funcName} call`);
      throw new Error(`Too few arguments in function ${funcName} call`);
    }
  }

  enterIf_expression(ctx: If_expressionContext) {
    // Insert new scope to scopes stack
    const scope = new Scope(
      currentScope.top().scopeName,
      "Function",
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

  // Remove the current scope and push a new one. Updates de GOTOF quadruple
  enterElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
    const scope = new Scope(
      currentScope.top().scopeName,
      "Function",
      currentScope.top()
    );

    currentScope.push(scope);

    // Update jump in GOTOF quadruple
    const jump = jumpsStack.pop();
    const quadruple = quadruples[jump];
    quadruple[3] = String(quadruples.length);
  }

  // Pop current scope
  exitElse_expression(ctx: Else_expressionContext) {
    currentScope.pop();
  }

  // If block of if expression, insert current quadruple count to JumpStack and add
  // a GOTOF to quadruples
  enterBlock(ctx: BlockContext) {
    const parentChildren = ctx.parent.children;
    const then = parentChildren[2];

    if (then && then.text === ReservedKeywords.THEN) {
      jumpsStack.push(quadruples.length);
      quadruples.push(["GOTOF", quadruples[quadruples.length - 1][3], "", ""]);
    }
  }

  // Check if return value type is correct and add RETURN quadruple
  exitBlock(ctx: BlockContext) {
    const returnExpression = ctx.all_expressions().expression();
    const scopeName = currentScope.top().scopeName;

    if (returnExpression) {
      const operand = operandsStack.pop();
      const expressionType = typesStack.pop();

      // Check if the return type is correct
      const funcData = functionTable.get(scopeName);
      if (expressionType !== funcData.type) {
        console.error("Incorrect return type in function");
        throw new Error("Incorrect return type in function");
      }
      funcData.returnVirtualAddress =
        funcData.returnVirtualAddress === -1
          ? getVirtualAddress(funcData.type, "Global", virtualAddresses)
          : funcData.returnVirtualAddress;
      // Add return quadruple
      quadruples.push(["RETURN", "", "", operand]);
    }
  }

  exitType_name(ctx: Type_nameContext) {
    // Check if type used exists
    const name = ctx.text;
    if (!ctx.list_type() && !isTypeDeclared(name, userTypes)) {
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

  // When the executable part of the program is reached, update the initial
  // GOTO jump
  enterExecution(ctx: ExecutionContext) {
    const jump = jumpsStack.length > 0 ? jumpsStack.pop() : undefined;
    if (jump !== undefined) quadruples[jump][3] = String(quadruples.length);
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

    const tempVirtualAddress = getVirtualAddress(
      oprResult,
      scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
      virtualAddresses
    );

    if (scopeName !== "Global") functionTable.get(scopeName).tempVariables++;

    quadruples.push([
      operator,
      operandOne,
      operandTwo,
      String(tempVirtualAddress),
    ]);
    operandsStack.push(String(tempVirtualAddress));
    typesStack.push(oprResult);
  }

  // Add a not operator quadruple
  addNotQuadruple() {
    oprStack.pop();
    const operand = operandsStack.pop();
    const type = typesStack.pop();
    const scopeName = currentScope.top().scopeName;

    if (type !== "Boolean") {
      console.error("Type Error in Expression");
      throw new Error("Type Error in Expression");
    }

    const tempVirtualAddress = getVirtualAddress(
      "Boolean",
      scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
      virtualAddresses
    );
    if (scopeName !== "Global") functionTable.get(scopeName).tempVariables++;
    quadruples.push(["!", operand, "", String(tempVirtualAddress)]);
    operandsStack.push(String(tempVirtualAddress));
    typesStack.push("Boolean");
  }

  // Add assignation quadruple
  addAssignationQuadruple(ctx: Val_declarationContext) {
    const operator = oprStack.pop();
    const operandOne = operandsStack.pop();
    const variableName = ctx.VAL_ID().text;
    const scopeName = currentScope.top().scopeName;

    const varVirtualAddress =
      scopeName === "Global"
        ? globalVariablesTable.get(variableName).virtualAddress
        : functionTable.get(scopeName).variables.get(variableName)
            .virtualAddress;

    quadruples.push([operator, operandOne, "", String(varVirtualAddress)]);
  }

  // Add the GOSUB quadruple and the quadruple for storing the return value
  // in a temporal
  addFunctionCallQuadruples(funcName: string) {
    const func = functionTable.get(funcName);
    const scopeName = currentScope.top().scopeName;
    quadruples.push(["GOSUB", "", "", funcName]);
    const tempVirtualAddress = getVirtualAddress(
      func.type,
      scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
      virtualAddresses
    );
    quadruples.push([
      "=",
      String(func.returnVirtualAddress),
      "",
      String(tempVirtualAddress),
    ]);
    operandsStack.push(String(tempVirtualAddress));
    typesStack.push(func.type);

    if (scopeName !== "Global") functionTable.get(scopeName).tempVariables++;
  }

  addTemporalListVariable(name: string | null, type: string) {
    // TODO
  }

  addTemporalListElementVariable(ctx: ExpressionContext) {
    const scope = currentScope.top();

    // Init temporal variable
    const ownerListName = listsOrderStack.top();

    const type = typesStack.pop();
    const virtualAddress = Number(operandsStack.pop());

    const variable: Variable = {
      name: `${ownerListName}-${listsElementsTemporalCounter++}`,
      type,
      virtualAddress,
      nestedVariables: new Map<string, Variable>(),
    };

    // Updating list
    const isGlobalScope = scope.scopeName === "Global";
    const ownerList = isGlobalScope
      ? globalVariablesTable.get(ownerListName)
      : functionTable.get(scope.scopeName).variables.get(ownerListName);

    const updatedOwnerList: Variable = {
      ...ownerList,
      values: ownerList.values
        ? ([...ownerList.values, variable] as Variable[])
        : ([variable] as Variable[]),
    };

    // Validating element type
    if (ownerList.type !== `[${type}]`) {
      console.error(
        `Type Error in List: ${ownerList.name}. Expected type: ${ownerList.type} and found type: ${type} inside list.`
      );
      throw new Error(
        `Type Error in List: ${ownerList.name}. Expected type: ${ownerList.type} and found type: ${type} inside list.`
      );
    }

    // Saving updated list
    if (isGlobalScope)
      globalVariablesTable.set(ownerListName, updatedOwnerList);
    else
      functionTable
        .get(scope.scopeName)
        .variables.set(ownerListName, updatedOwnerList);
    scope.varsMap.set(ownerListName, updatedOwnerList);
  }

  handlePrelude(ctx: PreludeContext) {
    const isLength = ctx.length();
    const isHead = ctx.head();
    const isTail = ctx.tail();
    if (isLength) this.handleLength(isLength);
    if (isHead) this.handleHead(isHead);
    if (isTail) this.handleTail(isTail);
  }

  handleLength(ctx: LengthContext) {
    operandsStack.pop();
    const type = typesStack.pop();
    if (!isList(type))
      throw new Error("Error: length() only receives a list as parameter.");

    const listName = ctx.expression().text;
    const scope = currentScope.top();

    const variable = scope.varsMap.get(listName);
    const length = variable.values ? variable.values.length : 0;
    const lengthLiteral = String(length);

    if (!constantTable.get(lengthLiteral))
      constantTable.set(
        lengthLiteral,
        getVirtualAddress("Int", "Constant", virtualAddresses)
      );

    const tempVirtualAddress = getVirtualAddress(
      "Int",
      scope.scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
      virtualAddresses
    );

    const constVirtualAddress = constantTable.get(lengthLiteral);

    const address = String(constVirtualAddress);
    operandsStack.push(String(tempVirtualAddress));
    operandsStack.push(address);
    typesStack.push("Int");
    oprStack.push("=");
  }

  handleHead(ctx: HeadContext) {
    operandsStack.pop();
    const type = typesStack.pop();
    if (!isList(type))
      throw new Error("Error: head() only receives a list as parameter.");

    const listName = ctx.expression().text;
    const scope = currentScope.top();

    const variable = scope.varsMap.get(listName);
    if (!variable.values || variable.values.length === 0)
      throw new Error("Error: head() list received is empty");

    const head = variable.values[0];
    const tempVirtualAddress = getVirtualAddress(
      head.type,
      scope.scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
      virtualAddresses
    );

    if (scope.scopeName !== "Global")
      functionTable.get(scope.scopeName).tempVariables++;

    const headVA = String(head.virtualAddress);
    operandsStack.push(String(tempVirtualAddress));
    operandsStack.push(headVA);
    typesStack.push(head.type);
    oprStack.push("=");
  }

  handleTail(ctx: TailContext) {
    // operandsStack.pop();
    // const type = typesStack.pop();
    // if (!isList(type))
    //   throw new Error("Error: tail() only receives a list as parameter.");
    // const listName = ctx.expression().text;
    // const scope = currentScope.top();
    // const variable = scope.varsMap.get(listName);
    // if (!variable.values || variable.values.length === 0)
    //   throw new Error("Error: tail() list received is empty");
    // const head = variable.values[0];
    // const tempVirtualAddress = getVirtualAddress(
    //   head.type,
    //   scope.scopeName === "Global" ? "GlobalTemporal" : "FunctionTemporal",
    //   virtualAddresses
    // );
    // if (scope.scopeName !== "Global")
    //   functionTable.get(scope.scopeName).tempVariables++;
    // const headVA = String(head.virtualAddress);
    // operandsStack.push(String(tempVirtualAddress));
    // operandsStack.push(headVA);
    // typesStack.push(head.type);
    // oprStack.push("=");
  }

  // When finished parsing the code, start the Virtual Machine
  exitMain(ctx: MainContext) {
    console.time("Execution time");
    const vm = new VirtualMachine(
      quadruples,
      functionTable,
      globalVariablesTable,
      constantTable
    );
    vm.start();
    console.timeEnd("Execution time");
  }
}

export default QuadruplesListener;
