import { ANTLRErrorListener, DiagnosticErrorListener } from "antlr4ts";

export class ErrorListener extends DiagnosticErrorListener {
  syntaxError() {
    console.log("ENTERED");
  }
}
