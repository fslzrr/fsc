const fsListener = require("../lib/fsListener").fsListener;

class Listener extends fsListener {
  enterVal_declaration(ctx) {
    console.log("Found var declaration");
  }
  enterFunc(ctx) {
    console.log("Found function declaration");
  }
}

module.exports = Listener;
