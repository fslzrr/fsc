const antlr4 = require("antlr4");
const fsLexer = require("./lib/fsLexer.js");
const fsParser = require("./lib/fsParser.js");
const Listener = require("./src/Listener");
const Visitor = require("./src/Visitor");
const ErrorListener = require("./src/ErrorListener");

const input = `
    val listOne : [Int] = [1, 3, 5, 7, 9]
    val listTwo : [Int] = [2, 4, 6, 8, 10]

    mergeLists : [Int] -> [Int] -> [Int]
    mergeLists listOne listTwo = {
        val listOneHead : Int = 10
        val listTwoHead : Int = 10

        if (length listOne) == 0 then {
            listTwo
        } else if (length listTwo) == 0 then {
            listOne
        } else if listOneHead < listTwoHead then {
            val restOfListOne : [Int] = (tail listOne)
            concat [listOneHead] (mergeLists restOfListOne listTwo)
        } else {
            val restOfListTwo : [Int] = (tail listTwo)
            concat [listTwoHead] (mergeLists restOfListOne listTwo)
        }
    }
`;

const chars = new antlr4.InputStream(input);
const lexer = new fsLexer.fsLexer(chars);

lexer.strictMode = false; // do not use js strictMode

const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new fsParser.fsParser(tokens);
parser.removeParseListeners();
parser.addParseListener(new Listener());

const tree = parser.main();
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
