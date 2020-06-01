# Setup Project

## Requirements

To be able to run the project you must have installed the following programs:

- NodeJS : The the compiler is written in JavaScript and runs on NodeJS
- ANTLR4 : ANTLR4 is the Lexer/Parser used for this project.

Once you have installed in your machine those programs, clone the repository and navigate to the fsc-compiler folder in your terminal.

## Running Steps

To run the program you have to follow these steps:

1. Run "npm i" to install the project's dependencies
2. Run the "npm run compile" command to generate the Lexer and Parser files. (Make sure that the installation path of ANTLR in your machine is the same as the one used in this command). Run this command everytime you modify the grammar.
3. Run "npm start" to start the compiler

# TO DO

[] lists - F
[] prelude (head, tail, print) - F
[] error handling - J
[] Errors in Virtual Machine. Stackoverflow, head/tail on empty list
[x] Throw error when accessing declared variable itself
[x] Check that variables and functions cant have the same name
[x] validate less args in function call
[x] read from file
[x] ! operator
[x] String in Semantic Cube

[] user types - ?
[] Do not allow recursive types
