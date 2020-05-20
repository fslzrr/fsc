import { ANTLRInputStream, CommonTokenStream } from "antlr4ts";
import { fsLexer } from "./lib/fsLexer";
import { fsParser } from "./lib/fsParser";
import SymbolTableListener from "./src/SymbolTableListener";
import { fsListener } from "./lib/fsListener";
import { ErrorListener } from "./src/ErrorListener";

// const input = `
//     type Person = {
//         name: String,
//         lastName: String,
//         age: Int
//     }

//     type Film = {
//         title: String,
//         budget: Int,
//         synopsis: String
//     }

//     val listOne : [Int] = [1, 3, 5, 7, 9]
//     val listTwo : [Int] = [2, 4, 6, 8, 10]

//     mergeLists(listOne : [Int], listTwo : [Int]) : [Int] -> {
//         val listOneHead : Int = 10
//         val listTwoHead : Int = 20
//         val person : Person = {
//             name: "Jorge",
//             lastName: "Iribe",
//             age: 21
//         }

//         if 0 == 0 then {
//             val a : Int = 10
//             val b : Int = 20
//             if 3 == 0 then {
//                 val i : Int = 10
//                 val j : Int = 20
//                 listOne
//             } else {
//                 listTwo
//             }
//         } else {
//             val e : Int = 45
//             listOne
//         }
//     }
// `;

const testTwo = `
    one (a: Int, b: Int) : Int -> {
        val c : Int = 10
        val d : Float = 10.0
        val e : Int = 10
        val f : Int = 10
        val k : Int = 10
        val h : Int = 10
        val j : Int = 10
        val g : Int = 10
        val l : Int = 10

        val x : Boolean = ((a * b - c * d) > c + d * e / f) && (g * h - j > l - a) && b + c > d * f

        if x || b > c then {
            10
        } else if 0 == 0 then {
            val y : Int = 3 * 6
            if 3 > 2 then {
                y
            } else {
                a + b
            }
        } else {
            val z : Int = 10
            30
        }
    }

    two (a: Int, b: Int) : Int -> {
        val i : Int = 10 * a
        val j : Int = 20 * b
        i * j
    }
`;

const testThree = `
    one (a: Int) : Int -> {
        3
    }

    two (a: Int, b: Int) : Int -> {
        val i : Int = one(a)
        val j : Int = 20 * a
        if 3 > 2 then {
            i * j
        } else {
            val x : Int = 10
            x
        }
    }

    two(2, 2)
`;

const chars = new ANTLRInputStream(testTwo);
const lexer = new fsLexer(chars);
const tokens = new CommonTokenStream(lexer);
const parser = new fsParser(tokens);

const symbolTableListener: fsListener = new SymbolTableListener();
// const errorListener = new ErrorListener();

parser.removeParseListeners();
parser.addParseListener(symbolTableListener);
// parser.removeErrorListeners();
// parser.addErrorListener(errorListener);

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
