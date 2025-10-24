# Event Loop and Asynchronous Programming

## Table of Contents
- [Async and Sync Programming](#async-and-sync-programming)
- [Blocking Code](#blocking-code)
- [Event Loop](#event-loop)
- [setTimeout and setInterval](#settimeout-and-setinterval)
- [Zero Delay setTimeout](#zero-delay-settimeout)
- [Macro Tasks and Micro Tasks](#macro-tasks-and-micro-tasks)

---

## Async and Sync Programming

### Synchronous Programming

Code executes line by line, each operation must complete before next starts.

```javascript
// Synchronous code
console.log("First");

const result = 2 + 2;
console.log(result);

console.log("Last");

// Output (predictable order):
// First
// 4
// Last
```

**Characteristics:**
- Sequential execution
- Blocking (each line waits for previous to complete)
- Predictable order
- Simple to understand and debug
- Can freeze UI if operation takes time

### Asynchronous Programming

Operations can start before previous ones complete.

```javascript
// Asynchronous code
console.log("First");

setTimeout(() => {
  console.log("Async");
}, 0);

console.log("Last");

// Output (async executes later):
// First
// Last
// Async
```

**Characteristics:**
- Non-blocking execution
- Operations can overlap
- Order not guaranteed without explicit management
- Better performance for I/O operations
- More complex to understand

### Comparison

```javascript
// Synchronous - blocks for 3 seconds
function syncOperation() {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // Block for 3 seconds
  }
  console.log("Sync done");
}

console.log("Before sync");
syncOperation();  // Blocks here!
console.log("After sync");

// Output:
// Before sync
// (3 second pause)
// Sync done
// After sync

// Asynchronous - doesn't block
function asyncOperation() {
  setTimeout(() => {
    console.log("Async done");
  }, 3000);
}

console.log("Before async");
asyncOperation();  // Returns immediately!
console.log("After async");

// Output:
// Before async
// After async
// (3 second pause)
// Async done
```

---

## Blocking Code

### What is Blocking Code?

Code that prevents the JavaScript engine from executing other code while waiting for an operation to complete.

### Impact on Node.js Performance

Node.js is **single-threaded**. Blocking code blocks the entire application!

```javascript
// ❌ BAD: Synchronous file read (blocking)
const fs = require('fs');

console.log("Start reading...");
const data = fs.readFileSync('large-file.txt');  // BLOCKS!
console.log("File read complete");
// All other requests are blocked during file read

// ✅ GOOD: Asynchronous file read (non-blocking)
console.log("Start reading...");
fs.readFile('large-file.txt', (err, data) => {
  console.log("File read complete");
});
console.log("Can do other things!");
// Other requests can be handled while file is being read
```

### Examples of Blocking Operations

```javascript
// 1. Synchronous I/O
const data = fs.readFileSync('file.txt');  // Blocks
const json = JSON.parse(fs.readFileSync('data.json'));  // Blocks

// 2. CPU-intensive operations
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
const result = fibonacci(45);  // Blocks for seconds!

// 3. Infinite or long loops
while (true) {  // Blocks forever!
  // Do something
}

let sum = 0;
for (let i = 0; i < 1000000000; i++) {  // Blocks
  sum += i;
}

// 4. Synchronous network requests
const request = require('sync-request');
const res = request('GET', 'https://api.example.com');  // Blocks
```

### Consequences

1. **Server becomes unresponsive**
```javascript
// Server example
app.get('/slow', (req, res) => {
  // Blocks for 5 seconds
  const start = Date.now();
  while (Date.now() - start < 5000) {}
  res.send('Done');
  // All other requests wait during this time!
});
```

2. **Poor scalability**
```javascript
// Can't handle concurrent users
// Each request blocks others
```

3. **Degraded user experience**
```javascript
// Browser freezes
button.addEventListener('click', () => {
  // Long synchronous operation
  for (let i = 0; i < 1000000000; i++) {
    // User can't interact with page
  }
});
```

### Solutions

```javascript
// 1. Use async APIs
fs.readFile('file.txt', callback);  // Non-blocking
await fs.promises.readFile('file.txt');  // Non-blocking

// 2. Break up long operations
function processLargeArray(array) {
  let index = 0;

  function processChunk() {
    const chunkSize = 1000;
    const end = Math.min(index + chunkSize, array.length);

    for (let i = index; i < end; i++) {
      // Process array[i]
    }

    index = end;

    if (index < array.length) {
      setTimeout(processChunk, 0);  // Yield to event loop
    }
  }

  processChunk();
}

// 3. Use Worker Threads (Node.js)
const { Worker } = require('worker_threads');

const worker = new Worker('./heavy-computation.js');
worker.on('message', (result) => {
  console.log('Result:', result);
});

// 4. Use Web Workers (Browser)
const worker = new Worker('worker.js');
worker.postMessage({ data: largeData });
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

---

## Event Loop

### What is the Event Loop?

The mechanism that allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded.

### How It Works

```
┌───────────────────────────┐
┌─>│        timers            │  setTimeout, setInterval
│  └─────────────┬────────────┘
│  ┌─────────────┴────────────┐
│  │   pending callbacks      │  I/O callbacks
│  └─────────────┬────────────┘
│  ┌─────────────┴────────────┐
│  │    idle, prepare         │  Internal use
│  └─────────────┬────────────┘
│  ┌─────────────┴────────────┐  ┌───────────────┐
│  │        poll              │<─┤  incoming:    │
│  │                          │  │  connections, │
│  └─────────────┬────────────┘  │  data, etc.   │
│  ┌─────────────┴────────────┐  └───────────────┘
│  │        check             │  setImmediate
│  └─────────────┬────────────┘
│  ┌─────────────┴────────────┐
└──┤   close callbacks        │  socket.on('close', ...)
   └──────────────────────────┘
```

### Phases of Event Loop

1. **Timers**: Execute `setTimeout` and `setInterval` callbacks
2. **Pending callbacks**: I/O callbacks deferred from previous cycle
3. **Idle, prepare**: Internal Node.js use
4. **Poll**: Retrieve new I/O events, execute I/O callbacks
5. **Check**: Execute `setImmediate` callbacks
6. **Close callbacks**: Execute close event callbacks

### Simple Example

```javascript
console.log('1: Sync');

setTimeout(() => {
  console.log('2: setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Promise');
});

console.log('4: Sync');

// Output:
// 1: Sync
// 4: Sync
// 3: Promise (microtask)
// 2: setTimeout (macrotask)
```

### Call Stack, Task Queue, Microtask Queue

```javascript
// Call Stack: Currently executing code
// Microtask Queue: Promises, queueMicrotask
// Task Queue (Macrotask): setTimeout, setInterval, I/O

console.log('Start');  // 1. Call stack

setTimeout(() => {
  console.log('Timeout');  // 5. Task queue → Call stack
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');  // 3. Microtask queue → Call stack
  })
  .then(() => {
    console.log('Promise 2');  // 4. Microtask queue → Call stack
  });

console.log('End');  // 2. Call stack

// Execution order:
// 1. Execute all synchronous code (Call stack)
// 2. Execute ALL microtasks (empty microtask queue)
// 3. Execute ONE macrotask (from task queue)
// 4. Execute ALL microtasks again
// 5. Repeat steps 3-4
```

---

## setTimeout and setInterval

### setTimeout

Execute callback once after specified delay.

```javascript
// Basic usage
setTimeout(() => {
  console.log("Executed after 1 second");
}, 1000);

// With arguments
setTimeout((name, age) => {
  console.log(`${name} is ${age} years old`);
}, 1000, "Alice", 30);

// Store timeout ID
const timeoutId = setTimeout(() => {
  console.log("This might not run");
}, 5000);

// Can cancel before it runs
clearTimeout(timeoutId);
```

### setInterval

Execute callback repeatedly at specified interval.

```javascript
// Basic usage
const intervalId = setInterval(() => {
  console.log("Executed every 2 seconds");
}, 2000);

// Stop after some time
setTimeout(() => {
  clearInterval(intervalId);
}, 10000);  // Stop after 10 seconds

// With arguments
setInterval((message) => {
  console.log(message);
}, 1000, "Tick");
```

### Clearing Timers

```javascript
// setTimeout
const timeoutId = setTimeout(() => {
  console.log("Won't execute");
}, 1000);
clearTimeout(timeoutId);

// setInterval
const intervalId = setInterval(() => {
  console.log("Repeating...");
}, 1000);

// Clear after 5 seconds
setTimeout(() => {
  clearInterval(intervalId);
  console.log("Interval stopped");
}, 5000);
```

### Practical Uses for User Experience

#### 1. Debouncing

Delay execution until user stops typing.

```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Search as user types
const searchInput = document.getElementById('search');
const debouncedSearch = debounce((query) => {
  console.log(`Searching for: ${query}`);
  // API call here
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

#### 2. Throttling

Limit function execution frequency.

```javascript
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Scroll event
const throttledScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 1000);

window.addEventListener('scroll', throttledScroll);
```

#### 3. Auto-save

Periodically save user's work.

```javascript
let autoSaveInterval;

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    const content = document.getElementById('editor').value;
    localStorage.setItem('draft', content);
    console.log('Auto-saved!');
  }, 30000);  // Every 30 seconds
}

function stopAutoSave() {
  clearInterval(autoSaveInterval);
}
```

#### 4. Delayed Tooltips

Show tooltip after hover delay.

```javascript
let tooltipTimeout;

element.addEventListener('mouseenter', () => {
  tooltipTimeout = setTimeout(() => {
    showTooltip();
  }, 500);  // 500ms delay
});

element.addEventListener('mouseleave', () => {
  clearTimeout(tooltipTimeout);
  hideTooltip();
});
```

#### 5. Animations

Smooth transitions.

```javascript
function animateProgress(element, targetWidth) {
  let width = 0;
  const interval = setInterval(() => {
    if (width >= targetWidth) {
      clearInterval(interval);
    } else {
      width += 5;
      element.style.width = width + '%';
    }
  }, 50);
}
```

---

## Zero Delay setTimeout

### The Misconception

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);  // Zero delay - executes immediately, right? WRONG!

console.log('3');

// Output:
// 1
// 3
// 2 (NOT immediate!)
```

### Why It Doesn't Execute Immediately

Even with 0ms delay, callback is placed in task queue:

1. Synchronous code executes first (call stack)
2. Microtasks execute (promise callbacks)
3. Then macro tasks (setTimeout) execute

```javascript
console.log('Sync 1');

setTimeout(() => {
  console.log('setTimeout 0ms');
}, 0);

setTimeout(() => {
  console.log('setTimeout 100ms');
}, 100);

Promise.resolve().then(() => {
  console.log('Promise');
});

console.log('Sync 2');

// Output:
// Sync 1
// Sync 2
// Promise (microtask before macrotask)
// setTimeout 0ms
// setTimeout 100ms
```

### Impact on Event Loop Execution

**Without setTimeout:**
```javascript
function heavySync() {
  for (let i = 0; i < 1000000000; i++) {
    // Blocks event loop
  }
}

console.log('Before');
heavySync();  // Blocks everything
console.log('After');
// UI is frozen during heavySync
```

**With setTimeout (0ms):**
```javascript
function heavyAsync() {
  let i = 0;
  function chunk() {
    const end = Math.min(i + 1000000, 1000000000);
    for (; i < end; i++) {
      // Process chunk
    }
    if (i < 1000000000) {
      setTimeout(chunk, 0);  // Yield to event loop
    }
  }
  chunk();
}

console.log('Before');
heavyAsync();  // Returns immediately
console.log('After');
// UI remains responsive
```

### Use Cases

1. **Breaking up long tasks**
```javascript
function processLargeArray(array) {
  let index = 0;

  function process() {
    const chunk = array.slice(index, index + 1000);
    chunk.forEach(item => {
      // Process item
    });

    index += 1000;

    if (index < array.length) {
      setTimeout(process, 0);  // Let other code run
    }
  }

  process();
}
```

2. **Deferring execution**
```javascript
// Execute after current code and microtasks
function deferExecution(fn) {
  setTimeout(fn, 0);
}

console.log('1');
deferExecution(() => console.log('3'));
console.log('2');
// Output: 1, 2, 3
```

3. **Ensuring DOM updates**
```javascript
element.textContent = 'Loading...';

setTimeout(() => {
  // DOM has been updated, now do heavy work
  heavyComputation();
}, 0);
```

---

## Macro Tasks and Micro Tasks

### Definitions

**Macro Tasks (Task Queue):**
- `setTimeout`
- `setInterval`
- `setImmediate` (Node.js)
- I/O operations
- UI rendering (browser)
- `requestAnimationFrame` (browser)

**Micro Tasks (Job Queue):**
- `Promise.then/catch/finally`
- `queueMicrotask()`
- `process.nextTick()` (Node.js, highest priority)
- `MutationObserver` (browser)
- `async/await` (uses Promises)

### Execution Order

```
┌─────────────────┐
│  Call Stack     │ Execute synchronous code
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Microtask Queue │ Execute ALL microtasks
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Macrotask      │ Execute ONE macrotask
│  (Task Queue)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Microtask Queue │ Execute ALL microtasks again
└────────┬────────┘
         │
         ↓ (repeat)
```

### Basic Example

```javascript
console.log('1: Sync');  // Call stack

setTimeout(() => {
  console.log('2: Macro task');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Micro task');
});

console.log('4: Sync');  // Call stack

// Output:
// 1: Sync
// 4: Sync
// 3: Micro task (all micros before macro)
// 2: Macro task
```

### Complex Example

```javascript
console.log('Start');  // 1

setTimeout(() => {
  console.log('Timeout 1');  // 7
  Promise.resolve().then(() => {
    console.log('Promise 3');  // 8
  });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('Promise 1');  // 3
    setTimeout(() => {
      console.log('Timeout 2');  // 9
    }, 0);
  })
  .then(() => {
    console.log('Promise 2');  // 4
  });

setTimeout(() => {
  console.log('Timeout 3');  // 10
}, 0);

console.log('End');  // 2

Promise.resolve().then(() => {
  console.log('Promise 4');  // 5
}).then(() => {
  console.log('Promise 5');  // 6
});

/* Execution order:
1. Start (sync)
2. End (sync)
3. Promise 1 (microtask)
4. Promise 2 (microtask - chained)
5. Promise 4 (microtask)
6. Promise 5 (microtask - chained)
7. Timeout 1 (macrotask)
8. Promise 3 (microtask after macrotask)
9. Timeout 2 (macrotask)
10. Timeout 3 (macrotask)
*/
```

### Differences in Node.js

Node.js has `process.nextTick()` which has **higher priority** than microtasks:

```javascript
console.log('1: Sync');

setTimeout(() => {
  console.log('2: setTimeout');
}, 0);

setImmediate(() => {
  console.log('3: setImmediate');
});

process.nextTick(() => {
  console.log('4: nextTick');
});

Promise.resolve().then(() => {
  console.log('5: Promise');
});

console.log('6: Sync');

// Output in Node.js:
// 1: Sync
// 6: Sync
// 4: nextTick (highest priority)
// 5: Promise (microtask)
// 2: setTimeout (macrotask - timers phase)
// 3: setImmediate (macrotask - check phase)
```

### Priority Order in Node.js

1. Synchronous code (call stack)
2. `process.nextTick()` queue
3. Microtask queue (Promises)
4. Macrotask queue (timers, I/O, setImmediate)

```javascript
console.log('1');

Promise.resolve().then(() => console.log('2: Promise'));

process.nextTick(() => console.log('3: nextTick'));

setTimeout(() => console.log('4: setTimeout'), 0);

queueMicrotask(() => console.log('5: queueMicrotask'));

process.nextTick(() => console.log('6: nextTick 2'));

console.log('7');

// Output:
// 1
// 7
// 3: nextTick
// 6: nextTick 2
// 2: Promise
// 5: queueMicrotask
// 4: setTimeout
```

### Practical Implications

#### 1. Promise chains execute before setTimeout

```javascript
setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve()
  .then(() => console.log('promise 1'))
  .then(() => console.log('promise 2'))
  .then(() => console.log('promise 3'));

// Output:
// promise 1
// promise 2
// promise 3
// timeout
```

#### 2. async/await uses microtasks

```javascript
async function asyncFunc() {
  console.log('async start');
  await Promise.resolve();
  console.log('async end');  // Microtask
}

setTimeout(() => {
  console.log('timeout');
}, 0);

asyncFunc();

console.log('sync');

// Output:
// async start
// sync
// async end (microtask)
// timeout (macrotask)
```

#### 3. Microtasks can starve macrotasks

```javascript
// ⚠️ Warning: This will block macrotasks
function recursiveMicrotask() {
  Promise.resolve().then(recursiveMicrotask);
}

setTimeout(() => {
  console.log('This will never run!');
}, 0);

recursiveMicrotask();  // Infinite microtasks prevent macrotasks!
```

#### 4. Event loop visualization

```javascript
console.log('🔵 Script start');

setTimeout(() => {
  console.log('⏰ setTimeout 1');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('💜 Promise 1');
    return Promise.resolve();
  })
  .then(() => {
    console.log('💜 Promise 2');
  });

setTimeout(() => {
  console.log('⏰ setTimeout 2');
  Promise.resolve().then(() => {
    console.log('💜 Promise 3');
  });
}, 0);

Promise.resolve().then(() => {
  console.log('💜 Promise 4');
});

console.log('🔵 Script end');

/* Output:
🔵 Script start
🔵 Script end
💜 Promise 1
💜 Promise 4
💜 Promise 2
⏰ setTimeout 1
⏰ setTimeout 2
💜 Promise 3
*/
```

---

## Summary

### Key Takeaways

1. **Event loop** enables async operations in single-threaded JavaScript
2. **Blocking code** freezes entire application (especially critical in Node.js)
3. **setTimeout(fn, 0)** doesn't execute immediately - goes to task queue
4. **Microtasks** execute before macrotasks
5. **Priority**: sync → nextTick → microtasks → macrotasks
6. Use async APIs to avoid blocking

### Best Practices

- Avoid synchronous operations (especially I/O)
- Break up long-running tasks with `setTimeout(fn, 0)`
- Use async/await for cleaner async code
- Understand microtask vs macrotask for correct execution order
- Use debounce/throttle for frequent events
- Clear timers when no longer needed

### Quick Reference

```javascript
// Execution order
console.log('1');              // Sync
process.nextTick(() => {});    // 2nd (Node.js only)
Promise.resolve().then(() => {}); // 3rd (microtask)
setTimeout(() => {}, 0);       // 4th (macrotask)
setImmediate(() => {});        // Last (Node.js, after poll)

// Debounce
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

// Throttle
function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### Common Patterns

```javascript
// Break up long task
function processInChunks(array) {
  let i = 0;
  function process() {
    const chunk = array.slice(i, i + 1000);
    // Process chunk
    i += 1000;
    if (i < array.length) {
      setTimeout(process, 0);
    }
  }
  process();
}

// Defer execution
setTimeout(() => {
  // Runs after current code + microtasks
}, 0);

// Ensure DOM update
element.textContent = 'Loading...';
setTimeout(() => {
  // DOM updated, now do work
}, 0);
```
