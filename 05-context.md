# Context in JavaScript

## Table of Contents
- [Definition of Context](#definition-of-context)
- [Global Context](#global-context)
- [Runtime Determination](#runtime-determination)
- [Explicit Binding](#explicit-binding)
- [Context Loss](#context-loss)
- [Diagnosing and Resolving Issues](#diagnosing-and-resolving-issues)
- [Context in Async Functions](#context-in-async-functions)
- [Context in Node.js](#context-in-nodejs)

---

## Definition of Context

### What is Context?

**Context** = The value of the `this` keyword within a function

**Key Points:**
- Determined by **how** a function is called (not where it's defined)
- Dynamic binding (runtime determination)
- Different from **scope** (which is lexical/static)
- One of the most confusing aspects of JavaScript

### Context vs Scope

```javascript
const myVar = 'global';

function outer() {
  const myVar = 'outer';

  function inner() {
    // Scope: lexical (where code is written)
    console.log(myVar);  // 'outer' (from scope chain)

    // Context: dynamic (how function is called)
    console.log(this);   // Depends on how inner() is called
  }

  return inner;
}

const fn = outer();
fn();  // this will vary based on call site
```

---

## Global Context

### In Browsers

```javascript
console.log(this);  // Window object

function globalFunc() {
  console.log(this);  // Window (non-strict mode)
}

globalFunc();

// In strict mode
'use strict';
function strictFunc() {
  console.log(this);  // undefined
}

strictFunc();
```

### In Node.js

```javascript
console.log(this);  // {} (empty object, not global!)

// At module level, 'this' refers to module.exports
console.log(this === module.exports);  // true

function func() {
  console.log(this);  // global object (non-strict)
}

func();

// In strict mode
'use strict';
function strictFunc() {
  console.log(this);  // undefined
}

strictFunc();
```

### Global Object References

```javascript
// Browser
window.name = "Browser";
console.log(this.name);  // "Browser"

// Node.js
global.name = "Node";
console.log(this.name);  // undefined (this !== global at module level)

function showGlobal() {
  console.log(this.name);  // "Node" (this === global in function)
}
showGlobal();
```

---

## Runtime Determination

### The Four Rules of `this` Binding

Priority order: **new > explicit > implicit > default**

### 1. Default Binding (Function Call)

Standalone function invocation.

```javascript
function showThis() {
  console.log(this);
}

showThis();  // global object (or undefined in strict mode)

// In strict mode
'use strict';
function strictShow() {
  console.log(this);
}

strictShow();  // undefined
```

### 2. Implicit Binding (Method Call)

Function called as an object method.

```javascript
const obj = {
  name: "Alice",
  greet() {
    console.log(this.name);
  }
};

obj.greet();  // "Alice" (this = obj)

// Multiple levels
const outer = {
  inner: {
    name: "Bob",
    greet() {
      console.log(this.name);
    }
  }
};

outer.inner.greet();  // "Bob" (this = outer.inner)
// Only immediate parent matters!
```

### 3. Explicit Binding (call, apply, bind)

Manually set `this` value.

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person1 = { name: "Alice" };
const person2 = { name: "Bob" };

// call: arguments passed individually
greet.call(person1, "Hello", "!");  // "Hello, I'm Alice!"

// apply: arguments passed as array
greet.apply(person2, ["Hi", "."]);  // "Hi, I'm Bob."

// bind: returns new function with bound this
const greetAlice = greet.bind(person1);
greetAlice("Hey", "!!!");  // "Hey, I'm Alice!!!"
```

### 4. new Binding (Constructor Call)

Using `new` keyword creates new object as `this`.

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  // new creates empty object and sets it as 'this'
  // returns this object automatically
}

const alice = new Person("Alice", 30);
console.log(alice.name);  // "Alice"
console.log(alice.age);   // 30

// What 'new' does:
// 1. Creates empty object
// 2. Sets object's prototype
// 3. Binds 'this' to the object
// 4. Returns the object (unless function returns its own object)
```

### Binding Precedence

```javascript
function identify() {
  return this.name;
}

const obj1 = { name: "obj1", identify };
const obj2 = { name: "obj2" };

// Implicit binding
console.log(obj1.identify());  // "obj1"

// Explicit binding overrides implicit
console.log(obj1.identify.call(obj2));  // "obj2"

// new binding overrides explicit (via bind)
const boundIdentify = identify.bind(obj1);
console.log(boundIdentify());  // "obj1"

const newObj = new boundIdentify();  // new overrides bind!
console.log(newObj.name);  // undefined (new object created)
```

### Arrow Functions (Lexical this)

Arrow functions don't have their own `this` - they inherit from enclosing scope.

```javascript
const obj = {
  name: "Object",

  regularFunc: function() {
    console.log(this.name);  // "Object"
  },

  arrowFunc: () => {
    console.log(this.name);  // undefined (inherits from outer scope)
  },

  method: function() {
    const arrow = () => {
      console.log(this.name);  // "Object" (inherits from method)
    };
    arrow();
  }
};

obj.regularFunc();  // "Object"
obj.arrowFunc();    // undefined
obj.method();       // "Object"

// Arrow functions ignore call/apply/bind
const person = { name: "Alice" };
const arrowGreet = () => console.log(this.name);
arrowGreet.call(person);  // undefined (can't change arrow function's this)
```

---

## Explicit Binding

### call()

`func.call(thisArg, arg1, arg2, ...)`

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Alice" };

introduce.call(person, "Hello", "!");
// "Hello, I'm Alice!"

// Borrowing methods
const obj1 = {
  name: "Object 1",
  greet() {
    console.log(`Hello from ${this.name}`);
  }
};

const obj2 = { name: "Object 2" };

obj1.greet.call(obj2);  // "Hello from Object 2"
```

### apply()

`func.apply(thisArg, [argsArray])`

```javascript
function introduce(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`);
}

const person = { name: "Bob" };

introduce.apply(person, ["Hi", "."]);
// "Hi, I'm Bob."

// Useful with arrays
const numbers = [5, 6, 2, 3, 7];

// Without apply
const max1 = Math.max(5, 6, 2, 3, 7);  // 7

// With apply (spread array)
const max2 = Math.max.apply(null, numbers);  // 7

// Modern alternative: spread operator
const max3 = Math.max(...numbers);  // 7
```

### bind()

`func.bind(thisArg, arg1, arg2, ...)`

Returns **new function** with bound `this` (doesn't invoke immediately).

```javascript
function greet() {
  console.log(`Hi, I'm ${this.name}`);
}

const person = { name: "Charlie" };

const boundGreet = greet.bind(person);
boundGreet();  // "Hi, I'm Charlie"

// Partial application
function multiply(a, b) {
  return a * b;
}

const double = multiply.bind(null, 2);
console.log(double(5));  // 10 (2 * 5)
console.log(double(10)); // 20 (2 * 10)

// Binding in callbacks
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count++;
  }

  start() {
    // Without bind: loses context
    // setInterval(this.increment, 1000);

    // With bind: preserves context
    setInterval(this.increment.bind(this), 1000);
  }
}
```

### Comparison Table

| Method | Invokes Immediately | Arguments | Use Case |
|--------|---------------------|-----------|----------|
| `call` | ✅ Yes | Individual | Quick execution with known args |
| `apply` | ✅ Yes | Array | Array of arguments |
| `bind` | ❌ No (returns function) | Individual | Event handlers, callbacks |

---

## Context Loss

### Problem 1: Method Extraction

```javascript
const person = {
  name: "Alice",
  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
};

person.greet();  // "Hi, I'm Alice" ✅

// Extract method
const greet = person.greet;
greet();  // "Hi, I'm undefined" ❌
// Context lost! 'this' is now global/undefined

// Solution 1: bind
const boundGreet = person.greet.bind(person);
boundGreet();  // "Hi, I'm Alice" ✅

// Solution 2: arrow function wrapper
const wrappedGreet = () => person.greet();
wrappedGreet();  // "Hi, I'm Alice" ✅

// Solution 3: call/apply
greet.call(person);  // "Hi, I'm Alice" ✅
```

### Problem 2: Callbacks

```javascript
const counter = {
  count: 0,
  increment() {
    this.count++;
    console.log(this.count);
  }
};

// Lost context in setTimeout
setTimeout(counter.increment, 1000);  // NaN ❌

// Solution 1: bind
setTimeout(counter.increment.bind(counter), 1000);  // 1 ✅

// Solution 2: arrow function
setTimeout(() => counter.increment(), 1000);  // 1 ✅

// Solution 3: wrapper function
setTimeout(function() {
  counter.increment();
}, 1000);  // 1 ✅
```

### Problem 3: Event Handlers

```javascript
class Button {
  constructor(label) {
    this.label = label;
    this.clickCount = 0;
  }

  handleClick() {
    this.clickCount++;
    console.log(`${this.label} clicked ${this.clickCount} times`);
  }

  // ❌ Wrong: loses context
  attachWrong(element) {
    element.addEventListener('click', this.handleClick);
    // When clicked, 'this' will be the element, not Button instance
  }

  // ✅ Solution 1: bind in method
  attachBind(element) {
    element.addEventListener('click', this.handleClick.bind(this));
  }

  // ✅ Solution 2: arrow function
  attachArrow(element) {
    element.addEventListener('click', () => this.handleClick());
  }

  // ✅ Solution 3: arrow function property
  handleClickArrow = () => {
    this.clickCount++;
    console.log(`${this.label} clicked ${this.clickCount} times`);
  }

  attachArrowProperty(element) {
    element.addEventListener('click', this.handleClickArrow);
  }
}

const btn = new Button("Submit");
const element = document.getElementById('submitBtn');
btn.attachBind(element);  // Works correctly
```

### Problem 4: Array Methods

```javascript
const obj = {
  name: "Alice",
  friends: ["Bob", "Charlie", "Dave"],

  // ❌ Wrong: loses context
  greetAllWrong() {
    this.friends.forEach(function(friend) {
      console.log(`${this.name} greets ${friend}`);
      // 'this' is undefined in forEach callback
    });
  },

  // ✅ Solution 1: thisArg parameter
  greetAllWithArg() {
    this.friends.forEach(function(friend) {
      console.log(`${this.name} greets ${friend}`);
    }, this);  // Pass 'this' as second argument
  },

  // ✅ Solution 2: arrow function
  greetAllArrow() {
    this.friends.forEach((friend) => {
      console.log(`${this.name} greets ${friend}`);
    });
  },

  // ✅ Solution 3: save reference
  greetAllSaved() {
    const self = this;
    this.friends.forEach(function(friend) {
      console.log(`${self.name} greets ${friend}`);
    });
  }
};

obj.greetAllArrow();  // Works correctly
```

---

## Diagnosing and Resolving Issues

### Diagnostic Steps

1. **Identify where function is called**
2. **Determine which binding rule applies**
3. **Check if function is arrow function** (lexical this)
4. **Verify context is what you expect**
5. **Add `console.log(this)` to debug**

### Debugging Context

```javascript
function debugContext() {
  console.log('=== Context Debug ===');
  console.log('this:', this);
  console.log('typeof this:', typeof this);
  console.log('this.constructor:', this?.constructor?.name);
  console.log('===================');
}

const obj = {
  name: "Test",
  debug: debugContext
};

// Different ways to call:
debugContext();         // global/undefined
obj.debug();           // obj
debugContext.call(obj); // obj
new debugContext();     // new instance
```

### Common Patterns to Preserve Context

#### Pattern 1: self/that/\_this

```javascript
function Timer() {
  this.seconds = 0;
  const self = this;  // Save reference

  setInterval(function() {
    self.seconds++;  // Use saved reference
    console.log(self.seconds);
  }, 1000);
}

new Timer();
```

#### Pattern 2: Arrow Functions

```javascript
function Timer() {
  this.seconds = 0;

  setInterval(() => {
    this.seconds++;  // Arrow function inherits 'this'
    console.log(this.seconds);
  }, 1000);
}

new Timer();
```

#### Pattern 3: bind

```javascript
function Timer() {
  this.seconds = 0;

  setInterval(function() {
    this.seconds++;
    console.log(this.seconds);
  }.bind(this), 1000);  // Bind 'this'
}

new Timer();
```

#### Pattern 4: Class Arrow Properties

```javascript
class Timer {
  seconds = 0;

  // Arrow function as property
  increment = () => {
    this.seconds++;
    console.log(this.seconds);
  }

  start() {
    setInterval(this.increment, 1000);  // No bind needed!
  }
}

new Timer().start();
```

### Context Loss Decision Tree

```
Lost context?
├─ Is it an arrow function?
│  └─ No: Check call site
│     ├─ Function call? → Default binding
│     ├─ Method call? → Implicit binding
│     ├─ call/apply/bind? → Explicit binding
│     └─ new? → New binding
└─ Yes: Uses lexical this from enclosing scope
```

---

## Context in Async Functions

### Promises

```javascript
const obj = {
  value: 42,

  // ❌ Context lost in .then()
  getValueWrong() {
    return Promise.resolve()
      .then(function() {
        console.log(this.value);  // undefined
      });
  },

  // ✅ Arrow function preserves context
  getValueArrow() {
    return Promise.resolve()
      .then(() => {
        console.log(this.value);  // 42
      });
  },

  // ✅ bind
  getValueBind() {
    return Promise.resolve()
      .then(function() {
        console.log(this.value);  // 42
      }.bind(this));
  }
};

obj.getValueArrow();
```

### Async/Await

```javascript
class DataFetcher {
  constructor(url) {
    this.url = url;
    this.data = null;
  }

  async fetchData() {
    // 'this' is preserved in async functions
    const response = await fetch(this.url);
    this.data = await response.json();
    return this.data;
  }

  // Works with arrow functions too
  fetchDataArrow = async () => {
    const response = await fetch(this.url);
    this.data = await response.json();
    return this.data;
  }
}

const fetcher = new DataFetcher('/api/data');
fetcher.fetchData();  // 'this' works correctly
```

### setTimeout/setInterval

```javascript
class Clock {
  constructor() {
    this.time = 0;
  }

  // ❌ Loses context
  startWrong() {
    setInterval(function() {
      this.time++;  // 'this' is global/undefined
    }, 1000);
  }

  // ✅ Arrow function
  startArrow() {
    setInterval(() => {
      this.time++;  // Works!
    }, 1000);
  }

  // ✅ bind
  tick() {
    this.time++;
  }

  startBind() {
    setInterval(this.tick.bind(this), 1000);
  }
}
```

### Callbacks

```javascript
class FileProcessor {
  constructor(name) {
    this.name = name;
    this.processed = 0;
  }

  processFile(file, callback) {
    // Callback might lose context
    callback(file);
  }

  // ❌ Context loss
  processAllWrong(files) {
    files.forEach(this.processFile);
    // 'this' lost in processFile
  }

  // ✅ Arrow function
  processAllArrow(files) {
    files.forEach((file) => {
      this.processFile(file, () => {
        this.processed++;
      });
    });
  }

  // ✅ Bind
  processAllBind(files) {
    files.forEach(function(file) {
      this.processFile(file, () => {
        this.processed++;
      });
    }.bind(this));
  }
}
```

---

## Context in Node.js

### Module-Level Context

```javascript
// In Node.js module
console.log(this);  // {} (module.exports, not global!)
console.log(this === module.exports);  // true
console.log(this === exports);  // true

// But in function:
function func() {
  console.log(this);  // global object (non-strict)
}

// In strict mode:
'use strict';
function strictFunc() {
  console.log(this);  // undefined
}
```

### Event Emitters

```javascript
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {
  constructor() {
    super();
    this.value = 42;
  }

  // ❌ Loses context
  setupWrong() {
    this.on('event', function() {
      console.log(this.value);  // undefined
      // 'this' is EventEmitter instance, not MyEmitter
    });
  }

  // ✅ Arrow function
  setupArrow() {
    this.on('event', () => {
      console.log(this.value);  // 42
    });
  }

  // ✅ bind
  handleEvent() {
    console.log(this.value);
  }

  setupBind() {
    this.on('event', this.handleEvent.bind(this));
  }
}

const emitter = new MyEmitter();
emitter.setupArrow();
emitter.emit('event');
```

### Express/HTTP Handlers

```javascript
class ApiHandler {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // ❌ Context lost when used as middleware
  handleRequestWrong(req, res) {
    res.json({
      url: this.baseUrl,  // undefined!
      path: req.path
    });
  }

  // ✅ Solution 1: bind in constructor
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.handleRequest = this.handleRequest.bind(this);
  }

  handleRequest(req, res) {
    res.json({
      url: this.baseUrl,  // Works!
      path: req.path
    });
  }

  // ✅ Solution 2: arrow function property
  handleRequestArrow = (req, res) => {
    res.json({
      url: this.baseUrl,
      path: req.path
    });
  }

  // ✅ Solution 3: wrapper function
  getHandler() {
    return (req, res) => {
      this.handleRequest(req, res);
    };
  }
}

const handler = new ApiHandler('/api');

// Usage with Express
// app.get('/users', handler.handleRequest);  // Works if bound in constructor
// app.get('/users', handler.handleRequestArrow);  // Works
// app.get('/users', handler.getHandler());  // Works
```

### Streams

```javascript
const { Transform } = require('stream');

class MyTransform extends Transform {
  constructor() {
    super();
    this.count = 0;
  }

  // ❌ Context issues
  _transformWrong(chunk, encoding, callback) {
    setTimeout(function() {
      this.count++;  // undefined!
      callback(null, chunk);
    }, 100);
  }

  // ✅ Arrow function
  _transformArrow(chunk, encoding, callback) {
    setTimeout(() => {
      this.count++;  // Works!
      callback(null, chunk);
    }, 100);
  }

  // ✅ bind
  _transformBind(chunk, encoding, callback) {
    setTimeout(function() {
      this.count++;
      callback(null, chunk);
    }.bind(this), 100);
  }
}
```

### Class Methods as Callbacks

```javascript
class DatabaseConnection {
  constructor(config) {
    this.config = config;
    this.connected = false;

    // Bind methods that will be used as callbacks
    this.onConnect = this.onConnect.bind(this);
    this.onError = this.onError.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
  }

  connect() {
    // These methods used as callbacks need binding
    db.connect(this.config, this.onConnect, this.onError);
  }

  onConnect() {
    this.connected = true;  // Works because bound in constructor
    console.log('Connected to', this.config.host);
  }

  onError(error) {
    this.connected = false;
    console.error('Connection error:', error);
  }

  onDisconnect() {
    this.connected = false;
    console.log('Disconnected from', this.config.host);
  }
}
```

---

## Summary

### Key Takeaways

1. **Context** (`this`) determined by **call site**, not definition
2. **Four binding rules**: default, implicit, explicit, new
3. **Precedence**: new > explicit > implicit > default
4. **Arrow functions** use lexical `this` (from enclosing scope)
5. **Context loss** common in callbacks, event handlers, array methods
6. **Solutions**: bind, arrow functions, save reference

### Best Practices

- Use arrow functions for callbacks/event handlers
- Bind methods in constructor if used as callbacks
- Use arrow function properties in classes
- Avoid relying on implicit binding in async code
- Always debug with `console.log(this)` when unsure
- Prefer arrow functions over `self/that/_this` pattern

### Quick Reference

```javascript
// Check context
console.log(this);

// Preserve context
.bind(this)                 // bind method
() => {}                    // arrow function
const self = this;          // save reference
fn.call(obj)               // explicit binding
fn.apply(obj, args)        // explicit binding with array

// Common patterns
class {
  method = () => {}        // Arrow property
  constructor() {
    this.method = this.method.bind(this);  // Bind in constructor
  }
}
```

### Context Loss Checklist

When you see context issues:
- [ ] Is function an arrow function? (lexical this)
- [ ] How is function called? (determines binding)
- [ ] Is it a callback? (likely loses context)
- [ ] Is it an event handler? (likely loses context)
- [ ] Can I use arrow function? (easiest solution)
- [ ] Should I bind in constructor? (if class method)
- [ ] Do I need explicit binding? (call/apply/bind)
