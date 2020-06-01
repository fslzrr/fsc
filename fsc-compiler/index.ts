import {
  ANTLRInputStream,
  CommonTokenStream,
  DiagnosticErrorListener,
} from "antlr4ts";
import { fsLexer } from "./lib/fsLexer";
import { fsParser } from "./lib/fsParser";
import SymbolTableListener from "./src/SymbolTableListener";
import { fsListener } from "./lib/fsListener";
import * as fs from "fs";
import { PredictionMode } from "antlr4ts/atn/PredictionMode";

const pathToFile = process.argv[2];

fs.readFile(pathToFile, (err, data) => {
  if (err) throw err;
  const input = data.toString();
  const chars = new ANTLRInputStream(input);
  const lexer = new fsLexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new fsParser(tokens);

  const symbolTableListener: fsListener = new SymbolTableListener();
  // const errorListener = new ErrorListener();

  parser.removeParseListeners();
  parser.addParseListener(symbolTableListener);
  // parser.removeErrorListeners();
  // parser.addErrorListener(new DiagnosticErrorListener());
  // parser.interpreter.setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);

  try {
    parser.main();
  } catch (err) {
    console.error(err);
  }
});
