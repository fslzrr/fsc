import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { fsLexer } from "./lib/fsLexer";
import { fsParser, ExpressionContext } from "./lib/fsParser";
import SymbolTableListener from "./src/SymbolTableListener";
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

    val func : (Int -> Int -> Int) = (a: Int, b: Int) : Int -> {
        a + b
    }

    mergeLists(listOne : (Int -> Int -> Int), listTwo : [Int]) : [Int] -> {
        val listOneHead : Int = 10
        val listTwoHead : Int = 20
        val person : Person = {
            name: "Jorge",
            lastName: "Iribe",
            age: 21
        }

        if 0 == 0 then {
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

const expression = `
  val a : Int = 10
  val b : Int = 10
  val c : Int = 10
  val d : Int = 10
  val e : Int = 10
  val f : Int = 10
  val k : Int = 10
  val h : Int = 10
  val j : Int = 10
  val g : Int = 10
  val l : Int = 10

  val x : Int = ((a * b - c * d) > c + d * e / f) && (g * h - j > l - a) && b + c > d * f
  
  `;

const chars = new ANTLRInputStream(expression);
const lexer = new fsLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new fsParser(tokens);

const symbolTableListener: fsListener = new SymbolTableListener();

parser.removeParseListeners();
parser.addParseListener(symbolTableListener);

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
