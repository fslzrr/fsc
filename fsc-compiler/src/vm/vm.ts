import { getVariableTypeByAddress } from "./utils";
import { Function, Variable } from "../SymbolTable";
import { Stack } from "../Stack";

// Instanciate the global memory
const globalMemory = new Array(14000);

class VirtualMachine {
  private quadruples: [string, string, string, string][];
  private functionTable: Map<string, Function>;
  private globalVariablesTable: Map<string, Variable>;
  private constantTable: Map<number | string, number>;
  private callStack: Stack<{
    functionName: string;
    memory: Array<any>;
    lastQuadrupleIndex: number;
  }>;
  private nextCallStack: {
    functionName: string;
    memory: Array<any>;
    lastQuadrupleIndex: number;
  };

  constructor(
    quadruples: [string, string, string, string][],
    functionTable: Map<string, Function>,
    globalVariablesTable: Map<string, Variable>,
    constantTable: Map<number | string, number>
  ) {
    this.quadruples = quadruples;
    this.functionTable = functionTable;
    this.globalVariablesTable = globalVariablesTable;
    this.constantTable = constantTable;
    this.callStack = new Stack();
    this.loadConstantsToMemory(this.constantTable);
  }

  // Function to start the execution of the quadruples.
  start() {
    for (let i = 0; i < this.quadruples.length; i++) {
      // Extract information from quadruple
      const [opr, operandOne, operandTwo, assignTo] = this.quadruples[i];

      switch (opr) {
        case "!": {
          const varOne = this.readMemory(Number(operandOne));
          this.writeMemory(Number(assignTo), !varOne);
          break;
        }

        case "*": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne * varTwo);
          break;
        }

        case "/": {
          const isInt = getVariableTypeByAddress(Number(operandOne)) === "Int";
          const initialResult =
            this.readMemory(Number(operandOne)) /
            this.readMemory(Number(operandTwo));
          const result = isInt ? Math.floor(initialResult) : initialResult;
          this.writeMemory(Number(assignTo), result);
          break;
        }

        case "%": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne % varTwo);
          break;
        }

        case "+": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne + varTwo);
          break;
        }

        case "-": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne - varTwo);
          break;
        }

        case "<": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne < varTwo);
          break;
        }

        case ">": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne > varTwo);
          break;
        }

        case "<=": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne <= varTwo);
          break;
        }

        case ">=": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne >= varTwo);
          break;
        }

        case "==": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne === varTwo);
          break;
        }

        case "!=": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne !== varTwo);
          break;
        }

        case "&&": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne && varTwo);
          break;
        }

        case "||": {
          const varOne = this.readMemory(Number(operandOne));
          const varTwo = this.readMemory(Number(operandTwo));
          this.writeMemory(Number(assignTo), varOne || varTwo);
          break;
        }

        case "=": {
          const varOne = this.readMemory(Number(operandOne));
          this.writeMemory(Number(assignTo), varOne);
          break;
        }

        case "print": {
          console.log(this.readMemory(Number(assignTo)));
        }

        case "head": {
          break;
        }

        case "tail": {
          break;
        }

        case "++": {
          break;
        }

        case "GOTO": {
          const jump = assignTo;
          if (jump === "") return;
          i = Number(jump) - 1;
          break;
        }

        case "GOTOF": {
          const res = this.readMemory(Number(operandOne));
          if (!res) i = Number(assignTo) - 1;
          break;
        }

        case "ERA": {
          const functionName = assignTo;
          this.nextCallStack = {
            functionName,
            memory: new Array(10000),
            lastQuadrupleIndex: 0,
          };
          break;
        }

        case "PARAM": {
          const functionName = this.nextCallStack.functionName;
          const functionData = this.functionTable.get(functionName);
          const valueAddress = Number(operandOne);
          const param = assignTo;

          const paramAddress = functionData.variables.get(param).virtualAddress;
          this.nextCallStack.memory[paramAddress - 17000] = this.readMemory(
            valueAddress
          );
          break;
        }

        case "GOSUB": {
          this.nextCallStack.lastQuadrupleIndex = i + 1;
          const functionName = this.nextCallStack.functionName;
          const functionData = this.functionTable.get(functionName);
          const jump = functionData.startQuadruple;
          this.callStack.push(this.nextCallStack);
          this.nextCallStack = undefined;
          i = jump - 1;
          break;
        }

        case "RETURN": {
          const funcName = this.callStack.top().functionName;
          const functionData = this.functionTable.get(funcName);
          const returnAddress = functionData.returnVirtualAddress;
          const returnValueAddress = Number(assignTo);
          const value = this.readMemory(returnValueAddress);
          this.writeMemory(returnAddress, value);
          const currentCallStack = this.callStack.pop();
          const restoredQuadrupleIndex = currentCallStack.lastQuadrupleIndex;
          i = restoredQuadrupleIndex - 1;
          break;
        }
      }
    }
  }

  // This function loads every constant used in the program to memory.
  private loadConstantsToMemory(constantTable: Map<number | string, number>) {
    constantTable.forEach((key, value) => {
      const type = getVariableTypeByAddress(key);
      if (type === "Int" || type === "Float")
        globalMemory[key - 5000] = Number(value);
      else if (type === "Boolean") globalMemory[key - 5000] = value === "True";
      else
        globalMemory[key - 5000] = String(value).slice(
          1,
          String(value).length - 1
        );
    });
  }

  // Writes to memory located in address. If address >= 17000 it writes to the
  // local memory. Otherwise it writes to global memory.
  private writeMemory(address: number, value: any) {
    if (address >= 20000) this.callStack.top().memory[address - 20000] = value;
    else globalMemory[address - 5000] = value;
  }

  // Read from memory located at address
  private readMemory(address: number) {
    if (address >= 20000) return this.callStack.top().memory[address - 20000];
    return globalMemory[address - 5000];
  }
}

export default VirtualMachine;
