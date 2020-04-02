# Function Script Proposal

Fernando Salazar Valenzuela
Jorge Iván Iribe Ávila

## Vision / Purpose

The purpose of this compiler is to give web developers a tool to learn functional programming concepts with a familiar environment.

In the future we'll be working on adding _JavaScript_ and _WebAssembly_ as a compilation target.

## Main Objective

Help web engineers learn functional programming forcing them to use concepts like higher order functions, immutabily and recursion.

## Features

1. Types
2. Variables
3. Functions
4. Lists
5. Tuples
6. Lambdas

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
9. None

#### Declaration

Types must be named with the first character as a capitalized letter.

```
    type [type-name]: [type-expression];
    type Person: (String, String, Int);
```

There will be different _type-expressions_: simple, union, intersection, touple.

**Simple**
To rename types and have better semantics.
`Number`

**Union**
To express variables which can be one of nultiple types.
`Red | Green`

To express variables which can be multiple types.
**Intersection**
`Person & Lawyer`

**Tuple**
To express variables which have multiple values.

`(String, String, Int)`

**Function**
`[argument-type] -> [return-type]`

### Literals

**Boolean**
`val isOk: Boolean = True;`
`val isOk: Boolean = False;`

**Int**
`val integer: Int = 5;`

**Float**
`val floating: Float = 5.32;`

**Char**
`val letterA: Char = 'A';`

**String**
`val word: String = "hello";`

**List**
`val numbers: [Int] = [1, 2, 3, 4, 5];`

**Tuple**
`val person: (String, String, Int) = ("Fernando", "Salazar", 22);`

**Function**

```
sum: Int -> Int;
sum = number -> number + 1;
```

### Operators

#### General

`==`
`!=`

#### Booleans

`!`
`&&`
`||`

#### Numerical

`<`
`<=`
`>`
`>=`

`+`
`-`
`*`
`/`
`%`

### Variables

Variables will always be constants.

```
    val [variable-name]: [variable-type] = [value];
    val x: Int = 5;
    val person: Person = ("Fernando", "Salazar", 22);
```

### Conditional

ternary-operator

```
    val x = [boolean-expression] ? [return-val] : [return-val];
```

```
    val x = [boolean-expression] ?
                [return-val] :
                [boolean-expression] ?
                {
                    [body]
                    [return-val]
                } :
                {
                    [body]
                    [return-val]
                };
```

```
    val isGreaterThan10 = myNumber > 10 ?
        True :
        myNumber < 0 ?
        {
            log("Number is negative");
            True;
        } :
        False;
```

### Functions

Regular argument syntax.

```
    [variable-name]: [variable-type]
```

Function declaration.

```
    [function-name]: [argument-type] -> [argument-type] -> [return-type];
    [function-name] = [argument-name] -> [argument-name] -> {
        [...body]
    }
```

Calling a function

```
    [function-name]([argument], [argument]);
    val [variable-name] = [function-name]([argument], [argument]);
```
