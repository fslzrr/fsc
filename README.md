# Function Script Proposal

## Developers

- Fernando Salazar Valenzuela
- Jorge Iván Iribe Ávila

## Vision / Purpose

The purpose of this compiler is to give web developers a tool to learn functional programming concepts with a familiar environment.

## Main Objective

Help web engineers learn Functional Programming concepts like

- Higher Order Functions
- Immutability
- Recursion

The idea of language is for developers learn functional programming with an environment that is not as scary as languages like Haskell or Erlang. Function Script borrows a part of its syntax (specially functions) from Haskell, as we think it has a very elegant syntax that clearly shows the power of functional programming. In order to make sure developers are actually learning the concepts we desire, we decided to not include very imperative features like for loops and mutable variables, instead the developers must use recursion to substitute loops.

## Features

1. Strongly Typed
2. Higher Order Functions
3. Lambdas
4. Recursion
5. Immutability

## Syntaxis

As said before it will have a _JavaScript_-like syntax but with some basic functional features like types.

### Types

**Base Types**

1. Boolean
2. Int
3. Float
4. Char
5. String
6. List
7. Tuple
8. Function
9. Object

#### Declaration

Types must be named with the first character as a capitalized letter.

```
// Simple
type Name = String

// Tuple
type Person = (String, String, Int)

// Object
type [type-name] = {
    [attribute-name]: [attribute-type],
    ...
}
```

There will be different _type-expressions_: simple, tuple and object

**Simple**
To rename types and have better semantics.

`Number`

**Tuple**
To express variables which have multiple values.

`(String, String, Int)`

**Object**
To express variables with multiple attributes.

`{ name: String, lastName: String, age: Int }`

**Function**

`[argument-type] -> [return-type]`

`[argument-type] -> [argument-type] -> [return-type]`

### Literals

**Boolean**

```
val isOk: Boolean = True;
```

```
val isOk: Boolean = False;
```

**Int**

```
val integer: Int = 5;
```

**Float**

```
val floating: Float = 5.32;
```

**Char**

```
val letterA: Char = 'A';
```

**String**

```
val word: String = "hello";
```

**List**

```
val numbers: [Int] = [1, 2, 3, 4, 5];
```

**Tuple**

```
val person: (String, String, Int) = ("Fernando", "Salazar", 22);
```

**Object**

```
val person : Person = {
    name: "Fernando",
    lastName: "Salazar",
    age: 22
}
```

**Function**

```
val sum : Int -> Int = number ->  {
    number + 1
}
```

### Operators

#### Logical Operators

- `!`
- `&&`
- `||`

#### Relational Operators

- `==`
- `!=`
- `<`
- `<=`
- `>`
- `>=`

#### Arithmetic Operators

- `+`
- `-`
- `*`
- `/`
- `%`

### Variables

Variables will always be constants.

```
    // Variable Declaration
    val [variable-name]: [variable-type] = [value];
    val x: Int = 5;
    val person: Person = ("Fernando", "Salazar", 22);
```

### Functions

Functions will always have at least one argument and will always return something. The value returned is the last expression of the function body.

```
    // Function Declaration
    sum(a: Int, b: Int) : Int -> {
        a + b
    }

    // Function call
    sum(10, 20)
```

### Conditional Expression

The last line of the body is the return value of the function where it is used.

```
    if [boolean-expression] then {
        [body]
    } else if [boolean-expression] then {
        [body]
    } else {
        [body]
    }

    // Example

    if a > b then {
        a + b
    } else if a == b then {
        a - b
    } else {
        a * b
    }
```

## Lexic

### Reserved Words

- val
- type
- Boolean
- Int
- Float
- Char
- String
- True
- False
- if

### Symbols

- =
- ,
- :
- ?
- (
- )
- {
- }
- [
- ]
- ->

### Valid Type names

- [A-Z][a-za-z0-9]\*

### Valid Variable and Function names

- [a-z][a-za-z0-9]

## Syntax

The syntax of the language can be found in the syntax.ebnf file. It is expressed as a context-free grammar in the Extended Backus–Naur form.

### Code Sample

```
val i1 : Int = 20
val j : String = "Hello World"

fib(x: Int) : Int -> {
    if x <= 0 then {
        0
    } else if x == 1 then {
        1
    } else {
        fib(x - 1) + fib(x - 2)
    }
}

fact(n: Int) : Int -> {
    if n <= 1 then {
        1
    } else {
        n * fact(n - 1)
    }
}

print("Fib Answer", fib(i1))
```
