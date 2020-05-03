import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { fsLexer } from "./lib/fsLexer";
import { fsParser, ExpressionContext } from "./lib/fsParser";
import Listener from "./src/Listener";
import { fsListener } from "./lib/fsListener";

const input = `
    type Person = {
        name: String,
        lastName: String,
        age: Int
    }

    type Film = {
        title: String,
        budget: Int,
        synopsis: String
    }

    val listOne : [Int] = [1, 3, 5, 7, 9]
    val listTwo : [Int] = [2, 4, 6, 8, 10]

    mergeLists(listOne : [Int], listTwo : [Int]) : [Int] -> {
        val listOneHead : Int = 10
        val listTwoHead : Int = 10
        val person : Person = {
            name: "Jorge",
            lastName: "Iribe",
            age: 21
        }

        if length(listOne) == 0 then {
            val a : Int = 10
            val b : Int = 20
            if 3 == 0 then {
                val i : Int = 10
                val j : Int = 20
                listOne
            } else {
                listTwo
            }
        } else {
            val e : Int = 45
            listOne
        }
    }
`;

const chars = new ANTLRInputStream(input);
const lexer = new fsLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new fsParser(tokens);

const listener: fsListener = new Listener();

parser.removeParseListeners();
parser.addParseListener(listener);

try {
  parser.main();
} catch (err) {
  console.error(err);
}
// Print recognized tokens

// try {
//   let i = 0;
//   while (!tokens.consume()) {
//     console.log(tokens.tokens[i].type);
//     i++;
//   }
// } catch (err) {
//   console.log("All tokens were consumed");
// }
