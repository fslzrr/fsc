const antlr4 = require("antlr4");
const fsLexer = require("./lib/fsLexer.js");
const fsParser = require("./lib/fsParser.js");
const Listener = require("./src/Listener");

const input = `
    val listOne : [Int] = [-1, 0, 1, 2, 3, 4]
    val listTwo : [Int] = [-1, 0, 1, 2, 3, 4]
    mergeLists [Int] -> [Int] -> [Int]
    mergeLists listOne listTwo = {}
`;

const chars = new antlr4.InputStream(input);
const lexer = new fsLexer.fsLexer(chars);

lexer.strictMode = false; // do not use js strictMode

const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new fsParser.fsParser(tokens);
parser.removeParseListener();
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
