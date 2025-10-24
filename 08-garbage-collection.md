# Garbage Collection in JavaScript

## Table of Contents
- [Basic Understanding](#basic-understanding)
- [Purpose and Benefits](#purpose-and-benefits)
- [Memory Management](#memory-management)
- [Memory Leaks](#memory-leaks)
- [Manual Intervention](#manual-intervention)
- [GC Algorithms](#gc-algorithms)
- [V8 Engine and Node.js](#v8-engine-and-nodejs)
- [Minimizing GC Impact](#minimizing-gc-impact)
- [Advanced Topics](#advanced-topics)

---

## Basic Understanding

### What is Garbage Collection?

**Garbage Collection (GC)** is the automatic memory management process that identifies and frees memory that is no longer in use.

**Key Points:**
- Runs automatically in background
- Identifies unreachable objects
- Frees their memory
- Prevents memory leaks
- No manual memory management needed

### Basic Concept

```javascript
// Memory allocated
let obj = {
  data: new Array(1000000).fill('large data')
};

// Object is reachable and in use
console.log(obj.data.length);

// Make object unreachable
obj = null;

// Now obj is eligible for garbage collection
// GC will free the memory automatically (eventually)
```

---

## Purpose and Benefits

### Purpose

1. **Automatic memory cleanup**: Reclaim unused memory
2. **Prevent memory leaks**: Free memory that's no longer needed
3. **Optimize memory usage**: Keep memory footprint low
4. **Application stability**: Prevent out-of-memory crashes

### Benefits

```javascript
// Before GC (manual memory management - C/C++)
// malloc() to allocate
// free() to deallocate
// Easy to forget free() → memory leaks

// With GC (JavaScript)
function createData() {
  const data = new Array(1000);  // Memory allocated
  // ... use data ...
  // No need to manually free
  // GC handles it automatically
}

createData();
// Memory freed automatically when function returns
// and data is no longer referenced
```

**Key benefits:**
- Developers don't manually manage memory
- Reduces memory-related bugs (leaks, use-after-free, double-free)
- Improves developer productivity
- More stable applications
- Focus on business logic, not memory management

---

## Memory Management

### Memory Lifecycle

Three phases in every memory lifecycle:

```javascript
// 1. ALLOCATION - Memory is allocated
let user = {
  name: "Alice",
  email: "alice@example.com",
  friends: ["Bob", "Charlie"]
};

// 2. USE - Memory is read and written
console.log(user.name);
user.friends.push("Dave");

// 3. RELEASE - Memory is freed by GC
user = null;  // No more references
// GC will eventually free this memory
```

### Stack vs Heap

#### Stack Memory
- Stores primitive values and function calls
- Managed automatically (push/pop)
- Fixed size per value
- Fast allocation/deallocation
- Limited size

```javascript
function example() {
  let x = 5;           // Stack
  let y = "string";    // Stack (primitive)
  let z = true;        // Stack

  // When function returns, stack is cleared automatically
}
```

#### Heap Memory
- Stores objects, arrays, functions
- Managed by garbage collector
- Dynamic size
- Slower than stack
- Larger capacity

```javascript
function example() {
  let obj = {          // Reference on stack
    data: [1, 2, 3]    // Object on heap
  };

  let arr = [4, 5, 6]; // Reference on stack, array on heap

  // Stack cleared when function returns,
  // but heap memory freed later by GC
}
```

### Memory Allocation Examples

```javascript
// Primitive allocation (stack)
let num = 42;
let str = "hello";
let bool = true;

// Object allocation (heap)
let obj = { x: 1, y: 2 };
let arr = [1, 2, 3, 4, 5];
let fn = function() { return 42; };

// Nested objects (heap)
let complex = {
  user: {
    name: "Alice",
    address: {
      street: "123 Main St",
      city: "New York"
    }
  },
  items: [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" }
  ]
};

// String allocation (heap for large strings)
let largeString = "x".repeat(1000000);  // 1 million characters
```

---

## Memory Leaks

### What is a Memory Leak?

Memory that is **no longer needed** but **not freed** because references still exist.

### Common Causes and Examples

#### 1. Forgotten Timers

```javascript
// ❌ Memory leak - interval never cleared
function startPolling() {
  setInterval(() => {
    const data = fetchLargeData();  // Accumulates in memory
    // data is never released
  }, 1000);
}

startPolling();
// Interval runs forever, data keeps accumulating

// ✅ Fixed - clear interval when done
function startPolling() {
  const intervalId = setInterval(() => {
    const data = fetchLargeData();
    processData(data);
  }, 1000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

const cleanup = startPolling();
// Later: cleanup();
```

#### 2. Closures Holding References

```javascript
// ❌ Memory leak - closure keeps large data
function createLeak() {
  const largeData = new Array(1000000).fill('data');

  return function() {
    console.log(largeData[0]);  // Entire array kept in memory
  };
}

const leak = createLeak();
// largeData can never be garbage collected

// ✅ Fixed - reference only what you need
function createFixed() {
  const largeData = new Array(1000000).fill('data');
  const firstElement = largeData[0];  // Extract needed value

  return function() {
    console.log(firstElement);  // Only stores one element
  };
}

const noLeak = createFixed();
// largeData can be garbage collected
```

#### 3. Global Variables

```javascript
// ❌ Accidental global (memory leak)
function oops() {
  leakedVar = "I'm global!";  // No var/let/const
  // Can never be garbage collected
}

// ❌ Intentional global that grows
window.cache = [];
setInterval(() => {
  window.cache.push(new Array(1000));  // Grows forever
}, 100);

// ✅ Fixed - use proper scoping
function fixed() {
  let localVar = "I'm local!";
  // Will be GC'd when function scope ends
}

// ✅ Fixed - limit cache size
const cache = [];
const MAX_CACHE_SIZE = 100;

setInterval(() => {
  if (cache.length >= MAX_CACHE_SIZE) {
    cache.shift();  // Remove oldest
  }
  cache.push(new Array(1000));
}, 100);
```

#### 4. Detached DOM Nodes

```javascript
// ❌ Memory leak - DOM node kept in memory
let elements = [];

document.getElementById('button').addEventListener('click', () => {
  const div = document.createElement('div');
  document.body.appendChild(div);
  elements.push(div);  // Keep reference

  // Later remove from DOM
  document.body.removeChild(div);
  // But still in 'elements' array - memory leak!
});

// ✅ Fixed - remove references
let elements = [];

function cleanup() {
  elements.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
  elements = [];  // Clear references
}
```

#### 5. Event Listeners Not Removed

```javascript
// ❌ Memory leak - listener not removed
class Component {
  constructor(element) {
    this.element = element;
    this.data = new Array(1000000);

    this.element.addEventListener('click', () => {
      console.log(this.data.length);
    });
  }

  destroy() {
    this.element.remove();
    // Listener still exists - 'this' and 'data' can't be GC'd
  }
}

// ✅ Fixed - remove listener
class Component {
  constructor(element) {
    this.element = element;
    this.data = new Array(1000000);

    this.handler = () => {
      console.log(this.data.length);
    };

    this.element.addEventListener('click', this.handler);
  }

  destroy() {
    this.element.removeEventListener('click', this.handler);
    this.element.remove();
    this.data = null;  // Help GC
  }
}
```

#### 6. Circular References (Modern JS Handles This)

```javascript
// Modern JS GC handles circular references
function createCycle() {
  const obj1 = {};
  const obj2 = {};

  obj1.ref = obj2;
  obj2.ref = obj1;

  // Both can still be GC'd if no external references
}

createCycle();
// obj1 and obj2 will be garbage collected
```

---

## Manual Intervention

### Limited Manual Control

JavaScript provides **no direct API** to trigger garbage collection.

You can help GC by:
- Setting references to `null`
- Clearing timers/intervals
- Removing event listeners
- Using WeakMap/WeakSet

### Helping GC

```javascript
// 1. Nullify large objects
let largeObject = {
  data: new Array(1000000).fill('data')
};

// ... use object ...

largeObject = null;  // Help GC (if no other references)

// 2. Clear timers
const intervalId = setInterval(() => {}, 1000);
clearInterval(intervalId);  // Allow GC to clean up

const timeoutId = setTimeout(() => {}, 5000);
clearTimeout(timeoutId);

// 3. Remove event listeners
const handler = () => console.log('clicked');
element.addEventListener('click', handler);
// Later:
element.removeEventListener('click', handler);

// 4. Clear data structures
const arr = [1, 2, 3, /* ... many items */];
arr.length = 0;  // Clear array

const map = new Map();
map.clear();  // Clear map

const set = new Set();
set.clear();  // Clear set
```

### WeakMap and WeakSet

Allow garbage collection of keys/values.

```javascript
// Regular Map - prevents GC
const map = new Map();
let obj = { data: 'important' };

map.set(obj, 'value');
obj = null;  // Object CANNOT be GC'd (map still references it)

// WeakMap - allows GC
const weakMap = new WeakMap();
let obj2 = { data: 'important' };

weakMap.set(obj2, 'value');
obj2 = null;  // Object CAN be GC'd (weak reference)

// Use case: private data
const privateData = new WeakMap();

class User {
  constructor(name) {
    this.name = name;
    privateData.set(this, { password: 'secret' });
  }

  getPrivate() {
    return privateData.get(this);
  }
}

let user = new User('Alice');
console.log(user.getPrivate());  // { password: 'secret' }
user = null;  // User and private data can be GC'd
```

### Manual GC in Node.js (Development Only)

```javascript
// Expose GC in Node.js (requires --expose-gc flag)
// node --expose-gc app.js

if (global.gc) {
  global.gc();  // Force garbage collection
  console.log('GC triggered');
} else {
  console.log('GC not exposed. Run with --expose-gc');
}

// ⚠️ Never use in production!
// - Blocks application
// - Engine knows better when to GC
// - Only for debugging/testing
```

---

## GC Algorithms

### Reference Counting (Old, Not Used)

Count references to each object. Free when count reaches zero.

```javascript
// Conceptual (not how modern JS works)
let obj = { data: 'value' };  // ref count = 1
let ref = obj;                 // ref count = 2
ref = null;                    // ref count = 1
obj = null;                    // ref count = 0 → free memory

// ❌ Problem: Circular references
const obj1 = {};
const obj2 = {};
obj1.ref = obj2;  // ref count: obj2 = 1
obj2.ref = obj1;  // ref count: obj1 = 1

// Both have ref count > 0, but both are unreachable!
// Memory leak with reference counting
```

### Mark-and-Sweep (Modern Approach)

Used by all modern JavaScript engines.

#### Algorithm Steps:

1. **Mark Phase**: Start from roots, mark all reachable objects
2. **Sweep Phase**: Free all unmarked (unreachable) objects

#### Roots:
- Global object (`window`, `global`)
- Currently executing call stack
- Global variables

```javascript
// Example execution

// Root: global scope
let globalObj = { data: 'global' };  // ✅ Reachable from root

function example() {
  let localObj = { data: 'local' };   // ✅ Reachable (on call stack)

  let temp = { data: 'temporary' };   // ✅ Reachable while function runs

  return localObj;
}

let result = example();
// After function:
// - 'result' is reachable (returned) ✅
// - 'temp' is unreachable ❌ → will be GC'd

// Circular references work fine
const obj1 = {};
const obj2 = {};
obj1.ref = obj2;
obj2.ref = obj1;

// If no root can reach obj1 or obj2:
// - Both marked as unreachable
// - Both get garbage collected
// ✅ No leak!
```

#### Mark-and-Sweep Handles Circular References

```javascript
function createCircular() {
  const obj1 = { name: 'obj1' };
  const obj2 = { name: 'obj2' };

  obj1.ref = obj2;
  obj2.ref = obj1;

  // Not returned, not assigned to global
  // No root can reach them
}

createCircular();
// Both obj1 and obj2 will be garbage collected
// despite circular reference
```

---

## V8 Engine and Node.js

### V8's Garbage Collection Strategy

V8 (Chrome and Node.js) uses **generational garbage collection**.

#### Generations

1. **Young Generation (New Space)**
   - New objects allocated here
   - Small size (~1-8 MB)
   - Fast, frequent GC
   - Most objects die young

2. **Old Generation (Old Space)**
   - Long-lived objects promoted here
   - Larger size
   - Slower, less frequent GC
   - Objects that survived young GC

### GC Algorithms in V8

#### 1. Scavenge (Young Generation)

**Cheney's Algorithm:**
- Divides young generation into two halves
- Allocate in one half
- When full, copy live objects to other half
- Clear original half
- Very fast (5-10ms)

```javascript
// Fast allocation in young generation
function createMany() {
  for (let i = 0; i < 1000; i++) {
    const obj = { id: i };  // Allocated in young generation
    // Most will be GC'd quickly by Scavenge
  }
}
```

#### 2. Mark-Sweep-Compact (Old Generation)

**Three phases:**
- **Mark**: Identify live objects
- **Sweep**: Free dead objects
- **Compact**: Move live objects together (reduces fragmentation)

```javascript
// Long-lived objects in old generation
const cache = new Map();

function cacheData(key, value) {
  cache.set(key, value);
  // These objects survive multiple GCs
  // → promoted to old generation
}
```

### Incremental Marking

Break GC into small steps to reduce pause times.

```javascript
// Instead of:
// [Running] → [PAUSE: 100ms GC] → [Running]

// Incremental:
// [Running] → [5ms GC] → [Running] → [5ms GC] → [Running] → ...
// Smaller pauses, less noticeable
```

---

## Minimizing GC Impact

### Strategies

#### 1. Object Pooling

Reuse objects instead of creating/destroying many.

```javascript
// ❌ Without pooling - many allocations
function processMany() {
  for (let i = 0; i < 10000; i++) {
    const obj = { x: i, y: i * 2 };  // 10000 allocations
    process(obj);
    // obj eligible for GC
  }
}

// ✅ With pooling - reuse objects
const objectPool = [];

function getObject() {
  return objectPool.pop() || { x: 0, y: 0 };
}

function releaseObject(obj) {
  obj.x = 0;
  obj.y = 0;
  objectPool.push(obj);
}

function processManyPooled() {
  for (let i = 0; i < 10000; i++) {
    const obj = getObject();  // Reuse from pool
    obj.x = i;
    obj.y = i * 2;
    process(obj);
    releaseObject(obj);  // Return to pool
  }
}
```

#### 2. Avoid Temporary Objects

```javascript
// ❌ Creates temporary strings
function badConcat(arr) {
  let result = "";
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];  // Creates new string each iteration
  }
  return result;
}

// ✅ Efficient concatenation
function goodConcat(arr) {
  return arr.join("");  // Single allocation
}

// ❌ Temporary array
function badFilter(arr) {
  return arr.filter(x => x > 0)
            .map(x => x * 2)
            .filter(x => x < 100);
  // Creates 3 intermediate arrays
}

// ✅ Single pass
function goodFilter(arr) {
  const result = [];
  for (let x of arr) {
    if (x > 0) {
      const doubled = x * 2;
      if (doubled < 100) {
        result.push(doubled);
      }
    }
  }
  return result;
  // Only 1 array created
}
```

#### 3. Reuse Objects

```javascript
// ❌ New object each time
function processRequest() {
  const config = {  // New object each request
    timeout: 5000,
    retries: 3
  };
  fetch(url, config);
}

// ✅ Reuse object
const config = {
  timeout: 5000,
  retries: 3
};

function processRequest() {
  fetch(url, config);  // Reuse same config
}
```

#### 4. Use Appropriate Data Structures

```javascript
// ❌ Array for lookups (slow + GC overhead)
const users = [];
function findUser(id) {
  return users.find(u => u.id === id);  // O(n)
}

// ✅ Map for lookups (fast + efficient)
const users = new Map();
function findUser(id) {
  return users.get(id);  // O(1)
}

// ✅ WeakMap for cache with auto-cleanup
const cache = new WeakMap();

function getData(key) {
  if (!cache.has(key)) {
    cache.set(key, expensiveOperation(key));
  }
  return cache.get(key);
}
// Keys can be GC'd when no longer referenced elsewhere
```

---

## Advanced Topics

### When GC is Beneficial

- **Long-running applications**: Servers, SPAs
- **Memory-intensive operations**: Data processing, image manipulation
- **Many temporary objects**: Parsers, compilers
- **Event-driven code**: Prevents accumulation of event handler closures
- **Cached data**: Manage lifecycle of cached data

### Memory Leak Prevention Patterns

#### Pattern 1: Proper Cleanup

```javascript
class DataManager {
  constructor() {
    this.data = [];
    this.intervalId = setInterval(() => {
      this.data.push(new Date());
    }, 1000);
  }

  destroy() {
    clearInterval(this.intervalId);  // Clean up!
    this.data = null;
  }
}

const manager = new DataManager();
// Later:
manager.destroy();  // Always call cleanup
```

#### Pattern 2: Remove Event Listeners

```javascript
class EventHandler {
  constructor(element) {
    this.element = element;
    this.handler = this.handleClick.bind(this);
    this.element.addEventListener('click', this.handler);
  }

  handleClick() {
    console.log('Clicked');
  }

  destroy() {
    this.element.removeEventListener('click', this.handler);
    this.element = null;
  }
}
```

#### Pattern 3: Limit Cache Size

```javascript
class LimitedCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first in Map)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key) {
    return this.cache.get(key);
  }
}
```

### Limitations and Challenges

#### Limitations:
- **Non-deterministic**: Can't control exactly when GC runs
- **Pause times**: "Stop-the-world" GC pauses execution
- **No guarantees**: Can't guarantee immediate cleanup
- **Memory overhead**: GC itself uses memory
- **Complex tuning**: Optimal settings vary by application

#### Challenges:
- **Detecting leaks**: Not always obvious
- **Balancing frequency vs pause time**: More frequent GC = shorter app pauses, but more overhead
- **Platform differences**: Browser vs Node.js behave differently
- **Large heaps**: Bigger heaps = longer GC times
- **Framework overhead**: Libraries may hold unexpected references

### GC in Node.js vs Browser

| Aspect | Node.js | Browser |
|--------|---------|---------|
| **Engine** | V8 (same as Chrome) | Various (V8, SpiderMonkey, JavaScriptCore) |
| **Use case** | Server, long-running | Client, shorter sessions |
| **Control** | CLI flags, heap size tuning | Limited control |
| **Monitoring** | CLI tools, `--trace-gc` | DevTools profiling |
| **Memory leaks** | More critical (24/7 servers) | Less critical (tab closure cleans up) |
| **Heap size** | Configurable (`--max-old-space-size`) | Browser-dependent |

### Node.js GC Flags

```bash
# Increase heap size (default: ~1.5GB)
node --max-old-space-size=4096 app.js  # 4GB

# Expose gc() function for manual triggering
node --expose-gc app.js

# Log GC events
node --trace-gc app.js

# Detailed GC logging
node --trace-gc --trace-gc-verbose app.js

# Optimize for throughput
node --optimize-for-size --max-old-space-size=2048 app.js
```

### Impact on Performance

**Negative impacts:**
- GC pauses block JavaScript execution
- Longer pauses with larger heaps
- CPU overhead during GC
- Unpredictable timing (can happen during critical operations)

**Mitigation:**
- Incremental/concurrent GC (modern engines)
- Reduce object creation rate
- Keep heap size reasonable
- Profile and optimize hot paths
- Use object pooling for frequently created objects

### GC and Async Operations

```javascript
// GC can run between async operations
async function processData() {
  const data = await fetchData();  // ← GC might run here
  const processed = transform(data);  // ← And here
  await save(processed);  // ← And here
  return processed;
}

// Ensure cleanup in async code
async function withCleanup() {
  let resource = null;
  try {
    resource = await acquireResource();
    await useResource(resource);
  } finally {
    if (resource) {
      await releaseResource(resource);
      resource = null;  // Help GC
    }
  }
}
```

### Monitoring Memory

#### Node.js

```javascript
// Check memory usage
console.log(process.memoryUsage());
/*
{
  rss: 4935680,        // Resident Set Size (total memory)
  heapTotal: 1826816,  // Total heap size
  heapUsed: 650472,    // Used heap
  external: 49879,     // C++ objects
  arrayBuffers: 9386   // ArrayBuffers and SharedArrayBuffers
}
*/

// Monitor over time
setInterval(() => {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory: ${Math.round(used * 100) / 100} MB`);
}, 1000);
```

#### Browser

```javascript
// Chrome only
if (performance.memory) {
  console.log({
    totalJSHeapSize: performance.memory.totalJSHeapSize,
    usedJSHeapSize: performance.memory.usedJSHeapSize,
    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
  });
}

// Memory pressure API (experimental)
if ('memory' in performance) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('Memory pressure:', entry);
    }
  });
  observer.observe({ entryTypes: ['memory'] });
}
```

### Advanced Techniques

#### WeakRef (ES2021)

Allow GC even if weak references exist.

```javascript
class Cache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, new WeakRef(value));
  }

  get(key) {
    const ref = this.cache.get(key);
    if (ref) {
      const value = ref.deref();  // May be undefined if GC'd
      if (value) {
        return value;
      } else {
        this.cache.delete(key);  // Clean up dead reference
      }
    }
    return undefined;
  }
}

let obj = { large: 'data' };
const cache = new Cache();
cache.set('key', obj);

obj = null;  // Object can be GC'd even though in cache
```

#### FinalizationRegistry (ES2021)

Run cleanup code when object is garbage collected.

```javascript
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object ${heldValue} was garbage collected`);
});

{
  const obj = { data: 'important' };
  registry.register(obj, 'myObject');

  // When obj is GC'd, callback runs
}
```

---

## Summary

### Key Takeaways

1. **GC is automatic** - reclaims unused memory
2. **Mark-and-sweep** - modern algorithm handles circular references
3. **Generational GC** - optimizes for "most objects die young"
4. **Memory leaks** - caused by unintentional references
5. **Limited manual control** - help by nullifying refs, clearing timers
6. **WeakMap/WeakSet** - allow GC of keys/values
7. **Monitor memory** - use tools to detect leaks

### Best Practices

- Set large objects to `null` when done
- Clear timers/intervals when component unmounts
- Remove event listeners when element removed
- Use WeakMap for caches that should allow GC
- Limit cache sizes
- Avoid global variables that grow indefinitely
- Profile memory usage regularly
- Test for memory leaks in long-running scenarios

### Common Memory Leak Patterns

```javascript
// ❌ Forgotten timer
setInterval(() => {}, 1000);  // Never cleared

// ❌ Closure over large data
return function() { console.log(largeArray); };

// ❌ Growing global
window.cache.push(data);  // Grows forever

// ❌ Event listener not removed
element.addEventListener('click', handler);
element.remove();  // Listener still exists

// ❌ Detached DOM node
const div = document.createElement('div');
document.body.appendChild(div);
document.body.removeChild(div);
// But still referenced in variable
```

### Debugging Memory Leaks

1. **Chrome DevTools**:
   - Take heap snapshots
   - Compare snapshots over time
   - Use Allocation Timeline
   - Check Detached DOM nodes

2. **Node.js**:
   - Use `--trace-gc` flag
   - Monitor `process.memoryUsage()`
   - Use heap snapshots
   - Profile with clinic.js or other tools

3. **General approach**:
   - Identify growing memory over time
   - Take snapshots before/after operations
   - Find objects that should be GC'd but aren't
   - Trace references back to root
   - Fix by removing unneeded references

### Quick Reference

```javascript
// Help GC
obj = null;
array.length = 0;
map.clear();
clearInterval(id);
element.removeEventListener('click', handler);

// Weak references (allow GC)
const weakMap = new WeakMap();
const weakSet = new WeakSet();
const weakRef = new WeakRef(obj);

// Monitor memory (Node.js)
process.memoryUsage();

// Trigger GC (Node.js, dev only)
// node --expose-gc
global.gc();
```
