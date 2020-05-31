import { ANTLRErrorListener, RecognitionException, Recognizer } from "antlr4ts";

export class ErrorListener implements ANTLRErrorListener<number> {
  syntaxError(
    recognizer: Recognizer<number, any>,
    offendingSymbol: number | undefined,
    line: number,
    charPositionInLine: number,
    msg: string,
    e: RecognitionException | undefined
  ) {}
}
