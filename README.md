# Function Script Proposal

---

The purpose of this compiler is to give web developers a tool to learn functional programming concepts with a familiar environment.

In the future we'll be working on adding _JavaScript_ and _WebAssembly_ as a compilation target.

## Features

---

1. Types
2. Variables
3. Functions
4. Lists
5. Tuples
6. Lambdas

## Syntaxis

---

As said before it will have a _JavaScript_-like syntax but with some basic functional features like types.

### Types

---

**Base Types**

1. Boolean
2. Number
3. Char
4. String
5. List

#### Declaration

Types must be named with the first character as a capitalized letter.

```
    type [type-name]: [type-expression];
    type Person: {
        firstName: String,
        lastName: String,
        age: Number,
    };
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

```
    {
        firstName: String,
        lastName: String,
        age: Number,
    }
```

### Variables

Variables will always be constants.

```
    const [variable-name]: [variable-type] = [value];
    const x: Number = 5;
```
