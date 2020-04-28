const fsListener = require("../lib/fsListener").fsListener;
const SymbolTable = require("./SymbolTable");

let currentScope = [];

class Listener extends fsListener {
  enterMain(ctx) {
    const mainScope = new SymbolTable("main", currentScope.length, null);
    currentScope.push(mainScope);
  }

  enterFunc(ctx) {
    currentScope.push("func");
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  exitFunc(ctx) {
    currentScope.pop();
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  enterFunc_literal() {
    currentScope.push("func_literal");
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  exitFunc_literal() {
    currentScope.pop();
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  enterIf_expression(ctx) {
    currentScope.push("if");
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  exitIf_expression(ctx) {
    currentScope.pop();
    console.log("Current Context: ", currentScope[currentScope.length - 1]);
  }

  exitVal_declaration(ctx) {
    const name = ctx.children[1].symbol.text;
    const type = this.getType(ctx.children[3].children[0]);
    const rules = ctx.parser.ruleNames;
    const parentRuleIndex = ctx.parentCtx.ruleIndex;

    if (rules[parentRuleIndex] === "main") globalScope.set(name, type);
  }

  exitFunc_declaration(ctx) {
    const typeCtx = ctx.children[ctx.getChildCount() - 1];
    const name = ctx.children[0].symbol.text;
    const type = this.getType(typeCtx);
    const rules = ctx.parser.ruleNames;
    const parentRuleIndex = ctx.parentCtx.ruleIndex;

    if (rules[parentRuleIndex] === "func") globalScope.set(name, "func");
  }

  getType(typeCtx) {
    if (typeCtx.getChildCount() === 0) return typeCtx.symbol.text;

    let type = "";
    typeCtx.children.forEach((child) => {
      type += this.getType(child);
    });

    return type;
  }

  exitMain(ctx) {
    console.log(globalScope);
  }
}

module.exports = Listener;
