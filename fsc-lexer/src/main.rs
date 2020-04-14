use std::fmt::Debug;
use logos::Logos;

#[derive(Logos, Debug, PartialEq)]
enum Token {
    #[end]
    End,
    #[error]
    Error,

    #[token = "//"]
    SingleLineComment,
    #[token = "/*"]
    OpenMultiLineComment,
    #[token = "*/"]
    CloseMultiLineComment,

    // Symbols
    #[token = "="]
    Assign,

    #[token = "+"]
    Plus,
    #[token = "-"]
    Minus,
    #[token = "*"]
    Multiply,
    #[token = "/"]
    Divide,
    #[token = "%"]
    Modulus,

    #[token = "<"]
    LessThan,
    #[token = ">"]
    MoreThan,
    #[token = "<="]
    LessThanEqual,
    #[token = ">="]
    MoreThanEqual,

    #[token = "=="]
    Equal,
    #[token = "!="]
    NotEqual,

    #[token = "&&"]
    And,
    #[token = "||"]
    Or,

    #[token = "["]
    OpenBracket,
    #[token = "]"]
    CloseBracket,
    #[token = "("]
    OpenParen,
    #[token = ")"]
    CloseParen,
    #[token = "{"]
    OpenBrace,
    #[token = "}"]
    CloseBrace,

    #[token = "."]
    Period,
    #[token = ","]
    Comma,
    #[token = ":"]
    Colon,
    #[token = ";"]
    SemiColon,
    #[token = "->"]
    Arrow,
    #[token = "?"]
    QuestionMark,

    // Literals
    #[regex = "(True|False)"]
    Boolean,
    #[regex = "(\\+|\\-)?[0-9]+"]
    Int,
    #[regex = "(\\+|\\-)?[0-9]*\\.[0-9]+"]
    Float,
    #[regex = "\'.\'"]
    Char,
    #[regex = "\"(.| )*\""]
    String,

    // Keywords
    #[token = "type"]
    Type,
    #[token = "val"]
    Val,

    // Misc
    #[regex = "[a-z]+[a-zA-Z-0-9]*"]
    Id,
    #[regex = "[A-Z]+[a-zA-Z-0-9]*"]
    TypeId,
    
    #[regex = "( |\\n|\\t)"]
    WhiteSpace,

}

fn main() {
    let mut lexer = Token::lexer("
        val x: Int = 5 * 3;
        val y: Float = 1.0 + 2.5; 
        val text: String = \"hola mundo\";
        val char: Char = 'f';
    ");

    while lexer.token != Token::End {
        if lexer.token != Token::WhiteSpace {
            println!("{{ Token: {:?},\tValue: {:?} }}", lexer.token, lexer.slice());
        }
        lexer.advance();
    }
}