const fsVisitor = require("../lib/fsVisitor").fsVisitor;

class Visitor extends fsVisitor {
  visitVal_declaration(ctx) {}
}

module.exports = Visitor;
