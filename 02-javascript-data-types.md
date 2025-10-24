# JavaScript Data Types

## Table of Contents
- [Weakly Typed Language](#weakly-typed-language)
- [Primitive Data Types](#primitive-data-types)
- [Primitive vs Reference Types](#primitive-vs-reference-types)
- [Type Conversion and Coercion](#type-conversion-and-coercion)
- [typeof Operator](#typeof-operator)
- [Type Checking and Conversion Functions](#type-checking-and-conversion-functions)

---

## Weakly Typed Language

### What Does "Weakly Typed" Mean?

JavaScript is a **weakly typed** (or **dynamically typed**) language:

- **No type declarations**: Variables don't have fixed types
- **Dynamic typing**: Variable types can change at runtime
- **Type coercion**: Automatic type conversion during operations
- **Flexible but risky**: Can lead to unexpected behavior

### Examples

```javascript
// Variable can hold any type
let x = 5;           // Number
x = "hello";         // Now it's a String
x = true;            // Now it's a Boolean
x = { key: "value" };// Now it's an Object
// All valid!

// Compare to strongly typed (TypeScript)
let y: number = 5;
// y = "hello";  // Error: Type 'string' is not assignable to type 'number'
```

### Implications

**Advantages:**
- Faster to write code
- More flexible
- Less boilerplate

**Disadvantages:**
- Type errors at runtime instead of compile time
- Harder to catch bugs early
- IDE autocomplete less helpful

---

## Primitive Data Types

JavaScript has **7 primitive data types**:

### 1. Number

Represents both integers and floating-point numbers.

```javascript
let integer = 42;
let float = 3.14159;
let negative = -17;
let scientific = 5e3;        // 5000
let binary = 0b1010;         // 10
let octal = 0o744;           // 484
let hex = 0xFF;              // 255

// Special numeric values
let infinity = Infinity;
let negInfinity = -Infinity;
let notANumber = NaN;        // Not a Number

// Check for NaN
isNaN(NaN);           // true
isNaN("hello");       // true (after coercion)
Number.isNaN(NaN);    // true
Number.isNaN("hello");// false (no coercion)
```

### 2. String

Represents text data.

```javascript
let single = 'Single quotes';
let double = "Double quotes";
let template = `Template literal with ${single}`;

// Multi-line
let multiline = `This is
a multi-line
string`;

// Escape characters
let escaped = "Line 1\nLine 2\tTabbed";

// String length
console.log("hello".length);  // 5
```

### 3. Boolean

Logical entity with two values.

```javascript
let isTrue = true;
let isFalse = false;

// Boolean context
if (true) { /* executes */ }
if (false) { /* doesn't execute */ }

// Boolean conversion
Boolean(1);        // true
Boolean(0);        // false
Boolean("text");   // true
Boolean("");       // false
```

### 4. Undefined

Variable declared but not assigned.

```javascript
let x;
console.log(x);  // undefined

function noReturn() {}
console.log(noReturn());  // undefined

let obj = {};
console.log(obj.nonExistent);  // undefined

// Explicit undefined
let y = undefined;
```

### 5. Null

Intentional absence of value.

```javascript
let empty = null;

// Null means "no object"
let person = {
  name: "John",
  age: 30,
  spouse: null  // Intentionally no spouse
};

// Common use: reset/clear value
let data = fetchData();
data = null;  // Clear data
```

### 6. Symbol (ES6)

Unique and immutable identifier.

```javascript
// Each symbol is unique
let sym1 = Symbol();
let sym2 = Symbol();
console.log(sym1 === sym2);  // false

// With description
let sym3 = Symbol("description");
console.log(sym3.toString());  // "Symbol(description)"

// Use as object property
const ID = Symbol("id");
let user = {
  name: "John",
  [ID]: 12345  // Hidden property
};
console.log(user[ID]);  // 12345
console.log(Object.keys(user));  // ["name"] - symbol not shown

// Global symbols
let globalSym1 = Symbol.for("app.id");
let globalSym2 = Symbol.for("app.id");
console.log(globalSym1 === globalSym2);  // true
```

### 7. BigInt (ES2020)

Arbitrary precision integers.

```javascript
// Regular number limit
let bigNum = 9007199254740991;  // MAX_SAFE_INTEGER
console.log(bigNum + 1);  // 9007199254740992
console.log(bigNum + 2);  // 9007199254740992 (precision lost!)

// BigInt (add 'n' suffix)
let bigInt = 9007199254740991n;
console.log(bigInt + 1n);  // 9007199254740992n
console.log(bigInt + 2n);  // 9007199254740993n (precise!)

// Create BigInt
let big1 = 123n;
let big2 = BigInt(123);
let big3 = BigInt("9999999999999999999999999999");

// Can't mix with regular numbers
// 1n + 1;  // Error: Cannot mix BigInt and other types
1n + BigInt(1);  // OK: 2n
```

---

## Primitive vs Reference Types

### Primitives

**Characteristics:**
- Stored directly in variable location
- Immutable (operations create new values)
- Compared by value
- Stored on stack
- Copied by value

**Types:** Number, String, Boolean, Undefined, Null, Symbol, BigInt

```javascript
// Primitives are copied by value
let a = 5;
let b = a;  // Copy of value
b = 10;
console.log(a);  // 5 (unchanged)
console.log(b);  // 10

// String immutability
let str = "hello";
str[0] = "H";  // Doesn't work
console.log(str);  // "hello" (unchanged)

str = str.toUpperCase();  // Creates NEW string
console.log(str);  // "HELLO"

// Comparison by value
let x = 5;
let y = 5;
console.log(x === y);  // true (same value)
```

### Reference Types

**Characteristics:**
- Variable stores memory reference (pointer)
- Mutable (can modify properties)
- Compared by reference
- Stored on heap
- Copied by reference

**Types:** Object, Array, Function, Date, RegExp, Map, Set

```javascript
// Objects are copied by reference
let obj1 = { x: 5 };
let obj2 = obj1;  // Copy of reference
obj2.x = 10;
console.log(obj1.x);  // 10 (changed!)
console.log(obj2.x);  // 10

// Comparison by reference
let a = { x: 1 };
let b = { x: 1 };
console.log(a === b);  // false (different objects)

let c = a;
console.log(a === c);  // true (same reference)

// Arrays (also reference type)
let arr1 = [1, 2, 3];
let arr2 = arr1;
arr2.push(4);
console.log(arr1);  // [1, 2, 3, 4] (changed!)

// Functions (also reference type)
let func1 = function() { console.log("hi"); };
let func2 = func1;
console.log(func1 === func2);  // true (same reference)
```

### Key Differences Table

| Aspect | Primitives | Reference Types |
|--------|-----------|----------------|
| Storage | Stack (directly) | Heap (reference on stack) |
| Copy | By value | By reference |
| Mutability | Immutable | Mutable |
| Comparison | By value | By reference |
| Size | Fixed | Dynamic |

### Practical Implications

```javascript
// Function parameters

// Primitive - can't modify original
function modifyPrimitive(x) {
  x = 10;
}
let num = 5;
modifyPrimitive(num);
console.log(num);  // 5 (unchanged)

// Reference - CAN modify original
function modifyObject(obj) {
  obj.x = 10;
}
let myObj = { x: 5 };
modifyObject(myObj);
console.log(myObj.x);  // 10 (changed!)

// But reassignment doesn't affect original
function reassignObject(obj) {
  obj = { x: 99 };  // New object
}
let myObj2 = { x: 5 };
reassignObject(myObj2);
console.log(myObj2.x);  // 5 (unchanged - reassignment doesn't affect original)
```

### Deep vs Shallow Copy

```javascript
// Shallow copy (reference type)
let original = { a: 1, b: { c: 2 } };
let shallow = { ...original };  // or Object.assign({}, original)

shallow.a = 99;
console.log(original.a);  // 1 (not changed)

shallow.b.c = 99;
console.log(original.b.c);  // 99 (changed! nested object still referenced)

// Deep copy (truly independent)
let deep = JSON.parse(JSON.stringify(original));
// Or use structuredClone() in modern JS
let deep2 = structuredClone(original);

deep.b.c = 77;
console.log(original.b.c);  // 99 (not changed - deep copy)
```

---

## Type Conversion and Coercion

### Type Conversion (Explicit)

Manually convert from one type to another.

#### To String

```javascript
String(123);              // "123"
String(true);             // "true"
String(null);             // "null"
String(undefined);        // "undefined"
String([1, 2, 3]);        // "1,2,3"
String({});               // "[object Object]"

// Alternative methods
(123).toString();         // "123"
true.toString();          // "true"
[1, 2].toString();        // "1,2"
```

#### To Number

```javascript
Number("123");            // 123
Number("123.45");         // 123.45
Number(true);             // 1
Number(false);            // 0
Number(null);             // 0
Number(undefined);        // NaN
Number("");               // 0
Number("hello");          // NaN
Number("  123  ");        // 123 (trims whitespace)

// Parsing integers
parseInt("123");          // 123
parseInt("123.45");       // 123 (drops decimal)
parseInt("123px");        // 123 (stops at non-digit)
parseInt("px123");        // NaN
parseInt("1010", 2);      // 10 (binary to decimal)
parseInt("FF", 16);       // 255 (hex to decimal)

// Parsing floats
parseFloat("123.45");     // 123.45
parseFloat("123.45.67");  // 123.45 (stops at second decimal)
parseFloat("3.14 meters");// 3.14

// Unary plus operator
+"123";                   // 123
+true;                    // 1
+"";                      // 0
```

#### To Boolean

```javascript
Boolean(1);               // true
Boolean(0);               // false
Boolean("text");          // true
Boolean("");              // false
Boolean(null);            // false
Boolean(undefined);       // false
Boolean({});              // true (all objects are truthy)
Boolean([]);              // true (even empty array!)

// Double negation (common trick)
!!1;                      // true
!!"";                     // false
!![];                     // true
```

### Type Coercion (Implicit)

Automatic type conversion by JavaScript.

#### String Coercion

```javascript
// + with string converts to string
"5" + 2;           // "52"
"5" + true;        // "5true"
"5" + null;        // "5null"
"5" + undefined;   // "5undefined"
"5" + [1, 2];      // "51,2"
"5" + {};          // "5[object Object]"

// Any operation with string becomes string
5 + "2";           // "52"
5 + "" + 2;        // "52"
```

#### Numeric Coercion

```javascript
// Math operators (except +) convert to number
"5" - 2;           // 3
"5" * "2";         // 10
"10" / "2";        // 5
"10" % "3";        // 1
"5" - true;        // 4
"5" * null;        // 0
"5" - undefined;   // NaN

// Unary + converts to number
+"5";              // 5
+true;             // 1
+null;             // 0
+undefined;        // NaN
```

#### Boolean Coercion

```javascript
// In if statements, loops, logical operators
if ("hello") { /* truthy - executes */ }
if ("") { /* falsy - doesn't execute */ }

// Logical operators
"hello" && 5;      // 5 (returns last truthy)
"" || "default";   // "default" (returns first truthy)
!!"text";          // true
```

### Falsy Values

Only **6 falsy values** in JavaScript (everything else is truthy):

```javascript
Boolean(false);        // false
Boolean(0);            // false
Boolean("");           // false
Boolean(null);         // false
Boolean(undefined);    // false
Boolean(NaN);          // false

// Everything else is truthy!
Boolean([]);           // true
Boolean({});           // true
Boolean("0");          // true (string!)
Boolean("false");      // true (string!)
Boolean(-1);           // true
Boolean(Infinity);     // true
```

### Equality and Coercion

#### Loose Equality (==)

Performs type coercion before comparison.

```javascript
5 == "5";              // true (string coerced to number)
0 == false;            // true
"" == false;           // true
null == undefined;     // true
1 == true;             // true
0 == "";               // true

// Weird cases
[] == false;           // true (both coerced to 0)
[] == ![];             // true (!)
```

#### Strict Equality (===)

No type coercion. **Always use this!**

```javascript
5 === "5";             // false
0 === false;           // false
"" === false;          // false
null === undefined;    // false
1 === true;            // false

// Use === for predictable behavior
```

### Type Coercion Gotchas

```javascript
// Addition vs concatenation
1 + 2 + "3";           // "33" (left to right)
"3" + 1 + 2;           // "312"
1 + 2 + 3 + "4";       // "64"

// Empty array
[] + [];               // "" (empty string)
[] + {};               // "[object Object]"
{} + [];               // 0 (block + unary)

// Tricky comparisons
null >= 0;             // true
null == 0;             // false
null <= 0;             // true

// NaN
NaN == NaN;            // false (NaN is not equal to anything!)
NaN === NaN;           // false
```

---

## typeof Operator

Returns string indicating type of operand.

### Basic Usage

```javascript
typeof 42;                    // "number"
typeof 3.14;                  // "number"
typeof NaN;                   // "number" (!)
typeof Infinity;              // "number"

typeof "text";                // "string"
typeof "";                    // "string"
typeof `template`;            // "string"

typeof true;                  // "boolean"
typeof false;                 // "boolean"

typeof undefined;             // "undefined"
typeof declaredButNotSet;     // "undefined"

typeof null;                  // "object" (historical bug!)

typeof Symbol();              // "symbol"
typeof Symbol("id");          // "symbol"

typeof 10n;                   // "bigint"
typeof BigInt(10);            // "bigint"
```

### Objects and Functions

```javascript
typeof {};                    // "object"
typeof { key: "value" };      // "object"
typeof new Object();          // "object"

typeof [];                    // "object" (arrays are objects!)
typeof [1, 2, 3];             // "object"
typeof new Array();           // "object"

typeof function() {};         // "function"
typeof class {};              // "function" (classes are functions!)
typeof Math.sin;              // "function"

typeof new Date();            // "object"
typeof /regex/;               // "object"
typeof new Map();             // "object"
typeof new Set();             // "object"
```

### Special Cases

```javascript
// null is "object" (bug in JS since beginning)
typeof null;                  // "object" (not "null"!)

// Arrays are "object"
typeof [1, 2, 3];             // "object" (not "array"!)
// Use Array.isArray() instead
Array.isArray([1, 2, 3]);     // true

// Functions are special
typeof function() {};         // "function" (not "object"!)

// Undeclared vs undefined
typeof undeclaredVariable;    // "undefined" (doesn't error!)
// undeclaredVariable;         // ReferenceError

// typeof with parentheses (both valid)
typeof(42);                   // "number"
typeof 42;                    // "number"
```

### Limitations

```javascript
// Can't distinguish between object types
typeof {};                    // "object"
typeof [];                    // "object"
typeof null;                  // "object"
typeof new Date();            // "object"

// Need other methods:
Array.isArray([]);            // true
obj instanceof Date;          // true/false
obj === null;                 // check for null
Object.prototype.toString.call(obj); // "[object Type]"
```

---

## Type Checking and Conversion Functions

### Comprehensive Type Checking

```javascript
// Number checking
function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

isNumber(42);          // true
isNumber(NaN);         // false
isNumber("42");        // false
isNumber(Infinity);    // true

function isInteger(value) {
  return Number.isInteger(value);
}

isInteger(42);         // true
isInteger(42.5);       // false
isInteger("42");       // false

function isFiniteNumber(value) {
  return Number.isFinite(value);
}

isFiniteNumber(42);       // true
isFiniteNumber(Infinity); // false
isFiniteNumber(NaN);      // false
```

```javascript
// String checking
function isString(value) {
  return typeof value === 'string';
}

isString("hello");     // true
isString("");          // true
isString(123);         // false

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

isNonEmptyString("hello"); // true
isNonEmptyString("");      // false
```

```javascript
// Boolean checking
function isBoolean(value) {
  return typeof value === 'boolean';
}

isBoolean(true);       // true
isBoolean(1);          // false
isBoolean("true");     // false
```

```javascript
// Null and undefined checking
function isNull(value) {
  return value === null;
}

function isUndefined(value) {
  return value === undefined;
}

function isNullOrUndefined(value) {
  return value == null;  // Catches both null and undefined
}

isNullOrUndefined(null);      // true
isNullOrUndefined(undefined); // true
isNullOrUndefined(0);         // false
```

```javascript
// Array checking
function isArray(value) {
  return Array.isArray(value);
}

isArray([1, 2, 3]);    // true
isArray([]);           // true
isArray({});           // false
isArray("array");      // false

function isNonEmptyArray(value) {
  return Array.isArray(value) && value.length > 0;
}
```

```javascript
// Object checking (plain objects only)
function isObject(value) {
  return value !== null &&
         typeof value === 'object' &&
         !Array.isArray(value);
}

isObject({});              // true
isObject({ key: "value" }); // true
isObject([]);              // false
isObject(null);            // false
isObject(new Date());      // true (might not want this)

function isPlainObject(value) {
  return value !== null &&
         typeof value === 'object' &&
         Object.getPrototypeOf(value) === Object.prototype;
}

isPlainObject({});         // true
isPlainObject([]);         // false
isPlainObject(new Date()); // false
```

```javascript
// Function checking
function isFunction(value) {
  return typeof value === 'function';
}

isFunction(() => {});      // true
isFunction(function() {}); // true
isFunction(class {});      // true
isFunction({});            // false
```

### Safe Type Conversions

```javascript
// Safe number conversion
function toNumber(value, defaultValue = 0) {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

toNumber("42");            // 42
toNumber("hello");         // 0
toNumber("hello", -1);     // -1
toNumber(null);            // 0

function toInteger(value, defaultValue = 0) {
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

toInteger("42.7");         // 42
toInteger("hello");        // 0
toInteger("42px");         // 42
```

```javascript
// Safe string conversion
function toString(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

toString(123);             // "123"
toString(null);            // ""
toString(undefined);       // ""
toString([1, 2]);          // "1,2"

function toSafeString(value, defaultValue = '') {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return String(value);
}
```

```javascript
// Safe boolean conversion
function toBoolean(value) {
  return Boolean(value);
}

toBoolean(1);              // true
toBoolean(0);              // false
toBoolean("");             // false
toBoolean("false");        // true (any non-empty string!)

function toStrictBoolean(value) {
  if (value === "true" || value === true || value === 1) {
    return true;
  }
  if (value === "false" || value === false || value === 0) {
    return false;
  }
  return null;  // Invalid boolean
}
```

```javascript
// Safe parsing with error handling
function safeParseInt(value, defaultValue = 0) {
  if (typeof value === 'number') {
    return Math.floor(value);
  }

  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

safeParseInt("42");        // 42
safeParseInt("42.7");      // 42
safeParseInt("hello");     // 0
safeParseInt(42.7);        // 42

function safeParseFloat(value, defaultValue = 0) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

safeParseFloat("3.14");    // 3.14
safeParseFloat("hello");   // 0
```

```javascript
// JSON parsing with safety
function safeJSONParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return defaultValue;
  }
}

safeJSONParse('{"key":"value"}'); // { key: "value" }
safeJSONParse('invalid json');     // null
safeJSONParse('invalid', {});      // {}
```

### Type Guards (TypeScript-style in JS)

```javascript
// Runtime type validation
function assertString(value, paramName = 'value') {
  if (typeof value !== 'string') {
    throw new TypeError(`${paramName} must be a string`);
  }
}

function assertNumber(value, paramName = 'value') {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new TypeError(`${paramName} must be a number`);
  }
}

function assertArray(value, paramName = 'value') {
  if (!Array.isArray(value)) {
    throw new TypeError(`${paramName} must be an array`);
  }
}

// Usage in function
function processUser(name, age, hobbies) {
  assertString(name, 'name');
  assertNumber(age, 'age');
  assertArray(hobbies, 'hobbies');

  // Safe to use now
  console.log(`${name} is ${age} years old`);
}
```

### Advanced Type Checking

```javascript
// Get precise type
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';

  const type = typeof value;
  if (type === 'object') {
    // Get constructor name for objects
    return value.constructor?.name.toLowerCase() || 'object';
  }

  return type;
}

getType(42);               // "number"
getType("text");           // "string"
getType(null);             // "null"
getType([]);               // "array"
getType(new Date());       // "date"
getType(/regex/);          // "regexp"

// Object type checking
function getObjectType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}

getObjectType({});         // "Object"
getObjectType([]);         // "Array"
getObjectType(new Date()); // "Date"
getObjectType(/regex/);    // "RegExp"
getObjectType(null);       // "Null"
```

---

## Summary

### Key Points

1. **JavaScript is weakly typed** - variables can change type
2. **7 primitive types**: Number, String, Boolean, Undefined, Null, Symbol, BigInt
3. **Primitives** are immutable and copied by value
4. **Reference types** are mutable and copied by reference
5. **Type coercion** happens automatically (often unexpectedly)
6. **typeof** has quirks (null is "object", arrays are "object")
7. **Always use ===** for comparisons (strict equality)
8. **Validate and convert types** explicitly for safety

### Best Practices

- Use strict equality (`===`)
- Explicitly convert types when needed
- Validate input types
- Avoid relying on type coercion
- Use `Array.isArray()` for arrays
- Check for `null` explicitly
- Use type checking functions
- Consider TypeScript for type safety

### Common Pitfalls to Avoid

```javascript
// Don't rely on ==
"5" == 5;              // true (confusing)

// Don't forget typeof null
if (typeof x === "object") {
  // Could be object, array, or null!
}

// Don't use typeof for arrays
if (typeof arr === "array") {  // Wrong!
  // Never executes
}

// Don't trust falsy checks for all cases
if (!value) {
  // Catches 0, "", false, null, undefined - might not want all
}

// Use explicit checks
if (value === null || value === undefined) { /* ... */ }
if (Array.isArray(value)) { /* ... */ }
if (typeof value === 'number' && !isNaN(value)) { /* ... */ }
```
