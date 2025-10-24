# Closures

## Table of Contents
- [Basic Definition and Concept](#basic-definition-and-concept)
- [Practical Scenarios](#practical-scenarios)
- [Importance of Closures](#importance-of-closures)
- [Common Issues and Pitfalls](#common-issues-and-pitfalls)
- [Example Implementations](#example-implementations)
- [Writing and Analyzing Closures](#writing-and-analyzing-closures)

---

## Basic Definition and Concept

### What is a Closure?

A **closure** is a function bundled together with references to its surrounding state (lexical environment).

**Key Points:**
- Function retains access to variables from outer scope
- Even after the outer function has returned
- Created every time a function is created
- Lexical scoping (based on where variables are declared)

### Simple Example

```javascript
function outer() {
  const message = "Hello";  // Variable in outer scope

  function inner() {
    console.log(message);  // Accesses outer variable
  }

  return inner;
}

const myFunc = outer();
myFunc(); // "Hello" - closure preserved access to message
```

### How It Works

```javascript
function makeCounter() {
  let count = 0;  // Private variable

  return function() {
    count++;  // Closure: access to count
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// Each call to makeCounter creates a new closure
const counter2 = makeCounter();
console.log(counter2()); // 1 (independent count)
```

### Lexical Scoping

```javascript
const globalVar = "global";

function outer() {
  const outerVar = "outer";

  function middle() {
    const middleVar = "middle";

    function inner() {
      const innerVar = "inner";

      // Inner function has access to ALL outer scopes
      console.log(innerVar);   // "inner"
      console.log(middleVar);  // "middle"
      console.log(outerVar);   // "outer"
      console.log(globalVar);  // "global"
    }

    return inner;
  }

  return middle();
}

const myFunc = outer();
myFunc();
```

---

## Practical Scenarios

### 1. Data Privacy / Encapsulation

Create private variables that can't be accessed directly.

```javascript
function createBankAccount(initialBalance) {
  // Private variable
  let balance = initialBalance;

  // Public interface
  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        return balance;
      }
    },

    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        return balance;
      }
      throw new Error("Insufficient funds");
    },

    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);
console.log(account.getBalance());  // 150
account.withdraw(30);
console.log(account.getBalance());  // 120

// balance is private - no direct access
console.log(account.balance);  // undefined
// account.balance = 99999;  // Doesn't affect actual balance
```

### 2. Function Factories

Create specialized functions with preset configuration.

```javascript
function makeMultiplier(multiplier) {
  return function(number) {
    return number * multiplier;
  };
}

const double = makeMultiplier(2);
const triple = makeMultiplier(3);
const quadruple = makeMultiplier(4);

console.log(double(5));      // 10
console.log(triple(5));      // 15
console.log(quadruple(5));   // 20

// More practical example: greeting function
function makeGreeter(greeting) {
  return function(name) {
    return `${greeting}, ${name}!`;
  };
}

const sayHello = makeGreeter("Hello");
const sayHi = makeGreeter("Hi");
const sayGoodbye = makeGreeter("Goodbye");

console.log(sayHello("Alice"));    // "Hello, Alice!"
console.log(sayHi("Bob"));         // "Hi, Bob!"
console.log(sayGoodbye("Charlie")); // "Goodbye, Charlie!"
```

### 3. Event Handlers and Callbacks

Preserve context and data for async operations.

```javascript
function setupButtons() {
  const buttons = ["Login", "Signup", "Logout"];

  buttons.forEach((buttonText, index) => {
    const button = document.createElement('button');
    button.textContent = buttonText;

    // Closure preserves buttonText and index
    button.addEventListener('click', function() {
      console.log(`Button ${index}: ${buttonText} clicked`);
    });

    document.body.appendChild(button);
  });
}

// Another example: timer with specific message
function delayedMessage(message, delay) {
  setTimeout(function() {
    console.log(message);  // Closure over message
  }, delay);
}

delayedMessage("First", 1000);
delayedMessage("Second", 2000);
delayedMessage("Third", 3000);
```

### 4. Partial Application and Currying

```javascript
// Partial application
function add(a, b, c) {
  return a + b + c;
}

function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

const add5 = partial(add, 5);
console.log(add5(10, 15)); // 30 (5 + 10 + 15)

// Currying
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
```

### 5. Module Pattern

Create modules with private and public members.

```javascript
const Calculator = (function() {
  // Private variables and functions
  let result = 0;

  function validateNumber(n) {
    if (typeof n !== 'number' || isNaN(n)) {
      throw new Error('Invalid number');
    }
  }

  // Public API
  return {
    add(n) {
      validateNumber(n);
      result += n;
      return this;
    },

    subtract(n) {
      validateNumber(n);
      result -= n;
      return this;
    },

    multiply(n) {
      validateNumber(n);
      result *= n;
      return this;
    },

    getResult() {
      return result;
    },

    reset() {
      result = 0;
      return this;
    }
  };
})();

Calculator.add(10).multiply(2).subtract(5);
console.log(Calculator.getResult());  // 15
Calculator.reset();
console.log(Calculator.getResult());  // 0

// Private members are not accessible
// Calculator.result;  // undefined
// Calculator.validateNumber(5);  // Error
```

### 6. Iterator Pattern

```javascript
function createIterator(array) {
  let index = 0;

  return {
    next() {
      if (index < array.length) {
        return {
          value: array[index++],
          done: false
        };
      }
      return { done: true };
    },

    hasNext() {
      return index < array.length;
    },

    reset() {
      index = 0;
    }
  };
}

const iterator = createIterator([1, 2, 3, 4, 5]);

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.hasNext()); // true
iterator.reset();
console.log(iterator.next()); // { value: 1, done: false }
```

---

## Importance of Closures

### 1. Data Privacy

Enable true private variables in JavaScript.

```javascript
function createUser(name) {
  let _password = null;  // Private

  return {
    getName() {
      return name;
    },

    setPassword(pwd) {
      _password = pwd;
    },

    checkPassword(pwd) {
      return _password === pwd;
    }
  };
}

const user = createUser("Alice");
user.setPassword("secret123");
console.log(user.checkPassword("secret123"));  // true
console.log(user._password);  // undefined (truly private)
```

### 2. Functional Programming

Foundation for many FP patterns.

```javascript
// Higher-order functions
const compose = (...fns) => x =>
  fns.reduceRight((acc, fn) => fn(acc), x);

const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const compute = compose(square, double, add1);
console.log(compute(3));  // 64: ((3 + 1) * 2)^2 = (8)^2
```

### 3. Callbacks and Event Handling

Essential for asynchronous programming.

```javascript
function fetchData(url, onSuccess, onError) {
  // Closures preserve onSuccess and onError
  setTimeout(() => {
    if (url) {
      onSuccess({ data: "Success!" });
    } else {
      onError(new Error("Invalid URL"));
    }
  }, 1000);
}

fetchData(
  "https://api.example.com",
  (result) => console.log(result.data),
  (error) => console.error(error.message)
);
```

### 4. Maintaining State

Without global variables.

```javascript
function createGame() {
  let score = 0;
  let level = 1;
  let lives = 3;

  return {
    increaseScore(points) {
      score += points;
      if (score > level * 100) {
        level++;
      }
    },

    loseLife() {
      lives--;
      if (lives === 0) {
        this.gameOver();
      }
    },

    gameOver() {
      console.log(`Game Over! Final score: ${score}, Level: ${level}`);
    },

    getStatus() {
      return { score, level, lives };
    }
  };
}

const game = createGame();
game.increaseScore(50);
console.log(game.getStatus());  // { score: 50, level: 1, lives: 3 }
```

---

## Common Issues and Pitfalls

### 1. Loop Closure Problem

**The Problem:**

```javascript
// ❌ WRONG: All callbacks reference the same i
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 3, 3, 3 (not 0, 1, 2!)
  }, 100);
}

// Why? By the time callbacks run, loop has finished
// All callbacks share the same i, which is now 3
```

**Solution 1: IIFE (Immediately Invoked Function Expression)**

```javascript
// ✅ CORRECT: IIFE creates new scope for each iteration
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j);  // 0, 1, 2
    }, 100);
  })(i);
}
```

**Solution 2: let (Block Scope)**

```javascript
// ✅ CORRECT: let creates new binding for each iteration
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i);  // 0, 1, 2
  }, 100);
}
```

**Solution 3: forEach**

```javascript
// ✅ CORRECT: forEach callback creates new scope
[0, 1, 2].forEach(function(i) {
  setTimeout(function() {
    console.log(i);  // 0, 1, 2
  }, 100);
});
```

### 2. Memory Leaks

Closures keep references to variables, which can prevent garbage collection.

**Problem:**

```javascript
// ❌ Memory leak: closure keeps reference to large data
function createHandler() {
  const largeData = new Array(1000000).fill('data');

  return function() {
    console.log(largeData.length);  // Entire array kept in memory
  };
}

const handler = createHandler();
// largeData can't be garbage collected
```

**Solution:**

```javascript
// ✅ Reference only what you need
function createHandler() {
  const largeData = new Array(1000000).fill('data');
  const dataLength = largeData.length;  // Extract needed value

  return function() {
    console.log(dataLength);  // Only number kept in memory
  };
}

const handler = createHandler();
// largeData can now be garbage collected
```

### 3. Accidental Global Variables

```javascript
// ❌ Forgot var/let/const - creates global!
function createCounter() {
  count = 0;  // Oops! Global variable

  return function() {
    count++;
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();
console.log(counter1());  // 1
console.log(counter2());  // 2 (shared global count!)
```

**Solution:**

```javascript
// ✅ Always use var/let/const
function createCounter() {
  let count = 0;  // Local variable

  return function() {
    count++;
    return count;
  };
}

const counter1 = createCounter();
const counter2 = createCounter();
console.log(counter1());  // 1
console.log(counter2());  // 1 (independent counts)
```

### 4. Over-Closure

Closing over unnecessary variables.

```javascript
// ❌ Closes over entire obj even though only need id
function createGetter(obj) {
  return function() {
    return obj.id;  // Keeps entire object in memory
  };
}

// ✅ Extract only what you need
function createGetter(obj) {
  const id = obj.id;
  return function() {
    return id;  // Only keeps id in memory
  };
}
```

### 5. Closure in Callbacks with Wrong Context

```javascript
const obj = {
  value: 42,

  // ❌ This context lost in setTimeout
  getValue() {
    setTimeout(function() {
      console.log(this.value);  // undefined
    }, 100);
  }
};

// ✅ Solution 1: Arrow function (lexical this)
const obj1 = {
  value: 42,

  getValue() {
    setTimeout(() => {
      console.log(this.value);  // 42
    }, 100);
  }
};

// ✅ Solution 2: Store this reference
const obj2 = {
  value: 42,

  getValue() {
    const self = this;
    setTimeout(function() {
      console.log(self.value);  // 42
    }, 100);
  }
};

// ✅ Solution 3: bind
const obj3 = {
  value: 42,

  getValue() {
    setTimeout(function() {
      console.log(this.value);  // 42
    }.bind(this), 100);
  }
};
```

---

## Example Implementations

### 1. Private Variables with Closures

```javascript
function BankAccount(initialBalance) {
  // Private variables
  let balance = initialBalance;
  const transactionHistory = [];

  // Private function
  function recordTransaction(type, amount) {
    transactionHistory.push({
      type,
      amount,
      balance,
      date: new Date()
    });
  }

  // Public methods
  this.deposit = function(amount) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
    balance += amount;
    recordTransaction('deposit', amount);
    return balance;
  };

  this.withdraw = function(amount) {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
    if (amount > balance) {
      throw new Error("Insufficient funds");
    }
    balance -= amount;
    recordTransaction('withdraw', amount);
    return balance;
  };

  this.getBalance = function() {
    return balance;
  };

  this.getHistory = function() {
    // Return copy to prevent modification
    return [...transactionHistory];
  };
}

const account = new BankAccount(1000);
account.deposit(500);
account.withdraw(200);
console.log(account.getBalance());  // 1300
console.log(account.getHistory());  // Array of transactions

// Private variables are truly private
console.log(account.balance);  // undefined
```

### 2. Memoization (Caching)

```javascript
function memoize(fn) {
  const cache = {};

  return function(...args) {
    const key = JSON.stringify(args);

    if (key in cache) {
      console.log('Fetching from cache:', key);
      return cache[key];
    }

    console.log('Calculating result');
    const result = fn.apply(this, args);
    cache[key] = result;
    return result;
  };
}

// Expensive function
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoizedFib = memoize(fibonacci);

console.log(memoizedFib(40));  // Calculating result (takes time)
console.log(memoizedFib(40));  // Fetching from cache (instant!)

// Another example: API call caching
function fetchUser(userId) {
  return fetch(`/api/users/${userId}`).then(r => r.json());
}

const cachedFetchUser = memoize(fetchUser);
```

### 3. Once Function

Execute function only once, return cached result after.

```javascript
function once(fn) {
  let called = false;
  let result;

  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

const initialize = once(() => {
  console.log("Initializing application...");
  return { initialized: true };
});

console.log(initialize());  // "Initializing application..." { initialized: true }
console.log(initialize());  // { initialized: true } (no log)
console.log(initialize());  // { initialized: true } (no log)

// Practical use: expensive initialization
const connectDatabase = once(() => {
  console.log("Connecting to database...");
  // Expensive connection logic
  return { connection: "db_connection" };
});
```

### 4. Debounce Function

Delay function execution until after a pause.

```javascript
function debounce(fn, delay) {
  let timeoutId;

  return function(...args) {
    // Clear previous timeout
    clearTimeout(timeoutId);

    // Set new timeout
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// Example: search input
const searchAPI = (query) => {
  console.log(`Searching for: ${query}`);
  // API call here
};

const debouncedSearch = debounce(searchAPI, 300);

// User types "hello"
debouncedSearch('h');    // Timeout set
debouncedSearch('he');   // Previous timeout cleared, new one set
debouncedSearch('hel');  // Previous timeout cleared, new one set
debouncedSearch('hell'); // Previous timeout cleared, new one set
debouncedSearch('hello');// Previous timeout cleared, new one set
// After 300ms of no typing: "Searching for: hello"
```

### 5. Throttle Function

Limit function execution to once per time period.

```javascript
function throttle(fn, limit) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Example: scroll event
const handleScroll = () => {
  console.log('Scroll position:', window.scrollY);
};

const throttledScroll = throttle(handleScroll, 1000);

// Will only log once per second, no matter how much user scrolls
window.addEventListener('scroll', throttledScroll);
```

### 6. Counter with Multiple Operations

```javascript
function createCounter(initialValue = 0) {
  let count = initialValue;
  const listeners = [];

  function notify() {
    listeners.forEach(listener => listener(count));
  }

  return {
    increment(step = 1) {
      count += step;
      notify();
      return count;
    },

    decrement(step = 1) {
      count -= step;
      notify();
      return count;
    },

    reset() {
      count = initialValue;
      notify();
      return count;
    },

    getValue() {
      return count;
    },

    subscribe(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  };
}

const counter = createCounter(10);

const unsubscribe = counter.subscribe((value) => {
  console.log(`Counter changed to: ${value}`);
});

counter.increment();    // "Counter changed to: 11"
counter.increment(5);   // "Counter changed to: 16"
counter.decrement(3);   // "Counter changed to: 13"
counter.reset();        // "Counter changed to: 10"

unsubscribe();
counter.increment();    // No log (unsubscribed)
```

---

## Writing and Analyzing Closures

### Analysis Checklist

When analyzing closure code:

1. **Identify inner function(s)**
2. **Find variables from outer scope referenced by inner function**
3. **Determine if inner function escapes outer scope** (returned, assigned, passed as callback)
4. **Trace variable lifetime** - what stays in memory?
5. **Check for potential memory leaks** or unintended references

### Example Analysis

```javascript
function makeMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const triple = makeMultiplier(3);
```

**Analysis:**
1. Inner function: `function(number) { ... }`
2. Outer variable referenced: `factor`
3. Escapes: Yes, returned from `makeMultiplier`
4. Lifetime: `factor` (value 3) stays in memory as long as `triple` exists
5. Memory concerns: Minimal, only stores one number

### Scope Encapsulation Pattern

```javascript
const UserManager = (function() {
  // Private variables
  let users = [];
  let currentId = 0;

  // Private functions
  function generateId() {
    return ++currentId;
  }

  function validateUser(user) {
    return user.name && user.email;
  }

  // Public API
  return {
    addUser(name, email) {
      const user = {
        id: generateId(),
        name,
        email,
        createdAt: new Date()
      };

      if (!validateUser(user)) {
        throw new Error('Invalid user data');
      }

      users.push(user);
      return user;
    },

    getUser(id) {
      return users.find(u => u.id === id);
    },

    getAllUsers() {
      // Return copy to prevent external modification
      return users.map(u => ({ ...u }));
    },

    removeUser(id) {
      const index = users.findIndex(u => u.id === id);
      if (index > -1) {
        users.splice(index, 1);
        return true;
      }
      return false;
    },

    getUserCount() {
      return users.length;
    }
  };
})();

// Usage
UserManager.addUser('Alice', 'alice@example.com');
UserManager.addUser('Bob', 'bob@example.com');
console.log(UserManager.getAllUsers());
console.log(UserManager.getUserCount());  // 2

// Private members are not accessible
// UserManager.users;  // undefined
// UserManager.generateId();  // Error
```

### Advanced: Closure with Private State and Methods

```javascript
function createStateMachine(initialState) {
  let state = initialState;
  const transitions = {};
  const listeners = [];

  function notify(oldState, newState) {
    listeners.forEach(listener => listener(oldState, newState));
  }

  return {
    getState() {
      return state;
    },

    addTransition(fromState, toState, condition = () => true) {
      if (!transitions[fromState]) {
        transitions[fromState] = [];
      }
      transitions[fromState].push({ toState, condition });
    },

    transition(toState) {
      const possibleTransitions = transitions[state] || [];
      const validTransition = possibleTransitions.find(
        t => t.toState === toState && t.condition()
      );

      if (validTransition) {
        const oldState = state;
        state = toState;
        notify(oldState, state);
        return true;
      }

      return false;
    },

    onStateChange(listener) {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  };
}

// Usage: Traffic light
const trafficLight = createStateMachine('red');

trafficLight.addTransition('red', 'green');
trafficLight.addTransition('green', 'yellow');
trafficLight.addTransition('yellow', 'red');

trafficLight.onStateChange((oldState, newState) => {
  console.log(`Light changed from ${oldState} to ${newState}`);
});

console.log(trafficLight.getState());  // 'red'
trafficLight.transition('green');       // "Light changed from red to green"
console.log(trafficLight.getState());  // 'green'
trafficLight.transition('yellow');      // "Light changed from green to yellow"
console.log(trafficLight.getState());  // 'yellow'
```

### Closure Scope Diagram

```javascript
function outer(a) {
  const b = 10;

  function middle(c) {
    const d = 20;

    function inner(e) {
      const f = 30;

      // inner has access to ALL outer scopes
      return a + b + c + d + e + f;
    }

    return inner;
  }

  return middle;
}

const mid = outer(1);     // a=1, b=10 in closure
const inn = mid(2);       // a=1, b=10, c=2, d=20 in closure
const result = inn(3);    // a=1, b=10, c=2, d=20, e=3, f=30
console.log(result);      // 66

/*
Closure Scopes:

inner function has access to:
├─ f (own scope)
├─ e (parameter)
├─ d (middle scope)
├─ c (middle parameter)
├─ b (outer scope)
├─ a (outer parameter)
└─ global scope
*/
```

---

## Summary

### Key Takeaways

1. **Closure** = Function + Lexical environment
2. **Created** when inner function references outer variables
3. **Persists** even after outer function returns
4. **Enables** data privacy, factories, callbacks, state management
5. **Watch for** loop problems, memory leaks, unintended references

### Best Practices

- Use closures for data privacy
- Extract only needed values to avoid memory leaks
- Use `let` in loops instead of `var`
- Be aware of what stays in memory
- Return functions for reusability
- Use IIFE for immediate execution
- Consider arrow functions for context preservation

### Common Patterns

```javascript
// Private variables
function create() {
  let private = 0;
  return {
    get: () => private,
    set: (val) => private = val
  };
}

// Function factory
function makeFunc(config) {
  return (input) => process(input, config);
}

// Module pattern
const module = (function() {
  let private = 0;
  return { public: () => private };
})();

// Event handler
element.addEventListener('click', function() {
  // Closure over element and outer variables
});
```

### Interview Questions to Prepare

1. What is a closure?
2. How do closures work in loops?
3. What are memory implications of closures?
4. Give practical examples of closure usage
5. Explain the difference between closure and scope
6. How do you create private variables in JavaScript?
7. What is the module pattern?
8. How do closures relate to callbacks?
