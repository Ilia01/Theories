# Prototypal Inheritance

## Table of Contents
- [Inheritance Conception](#inheritance-conception)
- [Prototypal Inheritance Basics](#prototypal-inheritance-basics)
- [Prototype Chain](#prototype-chain)
- [__proto__ vs prototype](#__proto__-vs-prototype)
- [Creating Objects with Prototypes](#creating-objects-with-prototypes)
- [Prototypal vs Functional Inheritance](#prototypal-vs-functional-inheritance)
- [Methods to Set/Get Prototype](#methods-to-setget-prototype)
- [Secure Objects](#secure-objects)
- [Object.prototype Methods](#objectprototype-methods)
- [Practical Applications](#practical-applications)

---

## Inheritance Conception

### What is Inheritance?

**Inheritance** is a mechanism that allows one object/class to acquire properties and methods from another.

### Benefits of Inheritance

1. **Code Reusability**
   - Write once, use in multiple places
   - Reduce duplication
   - Easier maintenance

2. **Establish Relationships**
   - Create hierarchies (is-a relationships)
   - Logical organization
   - Natural modeling of real-world concepts

3. **Override/Extend Behavior**
   - Customize inherited functionality
   - Add new capabilities
   - Keep base behavior intact

4. **Polymorphism**
   - Same interface, different implementations
   - Flexible and extensible code
   - Substitutability

### Example

```javascript
// Without inheritance - code duplication
const dog = {
  name: "Rex",
  age: 3,
  eat() { console.log(`${this.name} is eating`); },
  sleep() { console.log(`${this.name} is sleeping`); }
};

const cat = {
  name: "Whiskers",
  age: 2,
  eat() { console.log(`${this.name} is eating`); },
  sleep() { console.log(`${this.name} is sleeping`); }
};

// With inheritance - reuse common behavior
const animal = {
  eat() { console.log(`${this.name} is eating`); },
  sleep() { console.log(`${this.name} is sleeping`); }
};

const dog2 = Object.create(animal);
dog2.name = "Rex";
dog2.bark = function() { console.log("Woof!"); };

const cat2 = Object.create(animal);
cat2.name = "Whiskers";
cat2.meow = function() { console.log("Meow!"); };
```

---

## Prototypal Inheritance Basics

### Core Concept

- **Every JavaScript object has an internal `[[Prototype]]` link**
- Objects inherit properties and methods from their prototype
- Prototype is also an object (which has its own prototype)
- Creates a **prototype chain** that ends at `Object.prototype` → `null`

### Simple Example

```javascript
// Create prototype object
const animal = {
  eats: true,
  walk() {
    console.log("Animal walks");
  }
};

// Create object that inherits from animal
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats);  // true (inherited from animal)
console.log(rabbit.jumps); // true (own property)
rabbit.walk();             // "Animal walks" (inherited method)

// Check property ownership
console.log(rabbit.hasOwnProperty('jumps')); // true
console.log(rabbit.hasOwnProperty('eats'));  // false (inherited)
```

### How Property Lookup Works

When you access `object.property`:

1. Check if property exists on the object itself
2. If not, check object's prototype
3. If not, check prototype's prototype
4. Continue up the chain until found or reach `null`

```javascript
const animal = {
  eats: true
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

// Lookup for rabbit.jumps:
// 1. Check rabbit → found! Return true

// Lookup for rabbit.eats:
// 1. Check rabbit → not found
// 2. Check animal (rabbit's prototype) → found! Return true

// Lookup for rabbit.flies:
// 1. Check rabbit → not found
// 2. Check animal → not found
// 3. Check Object.prototype → not found
// 4. Reached null → return undefined
```

---

## Prototype Chain

### Understanding the Chain

Every object has a prototype chain:

```javascript
const obj = {};

// Chain: obj → Object.prototype → null
console.log(Object.getPrototypeOf(obj) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype)); // null
```

```javascript
const arr = [];

// Chain: arr → Array.prototype → Object.prototype → null
console.log(Object.getPrototypeOf(arr) === Array.prototype); // true
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype); // true
```

```javascript
function fn() {}

// Chain: fn → Function.prototype → Object.prototype → null
console.log(Object.getPrototypeOf(fn) === Function.prototype); // true
console.log(Object.getPrototypeOf(Function.prototype) === Object.prototype); // true
```

### Visualizing the Chain

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.sleep = function() {
  console.log(`${this.name} is sleeping`);
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log("Woof!");
};

const myDog = new Dog("Rex", "Labrador");

/*
Prototype Chain:

myDog
  ├─ name: "Rex"
  ├─ breed: "Labrador"
  └─ [[Prototype]] → Dog.prototype
       ├─ bark: function
       ├─ constructor: Dog
       └─ [[Prototype]] → Animal.prototype
            ├─ sleep: function
            ├─ constructor: Animal
            └─ [[Prototype]] → Object.prototype
                 ├─ toString: function
                 ├─ hasOwnProperty: function
                 └─ [[Prototype]] → null
*/

// Property lookup follows the chain:
myDog.bark();          // Found on Dog.prototype
myDog.sleep();         // Found on Animal.prototype
myDog.toString();      // Found on Object.prototype
myDog.nonExistent;     // Not found anywhere → undefined
```

### Chain Traversal

```javascript
// Manual chain traversal
let current = myDog;
while (current !== null) {
  console.log(current);
  current = Object.getPrototypeOf(current);
}
// Output:
// myDog instance
// Dog.prototype
// Animal.prototype
// Object.prototype
// (null - end of chain)
```

---

## __proto__ vs prototype

### Key Differences

| Aspect | `__proto__` | `prototype` |
|--------|-------------|-------------|
| **Property of** | All objects | Functions only |
| **Purpose** | Access object's prototype | Template for new instances |
| **When used** | Property lookup | Object creation with `new` |
| **Type** | Instance property | Constructor property |
| **Access** | `obj.__proto__` | `Constructor.prototype` |
| **Status** | Deprecated | Standard |
| **Modern alternative** | `Object.getPrototypeOf()` | No replacement needed |

### `__proto__` (Deprecated)

Getter/setter for an object's internal `[[Prototype]]`.

```javascript
const animal = {
  eats: true
};

const rabbit = {
  jumps: true
};

// Set prototype using __proto__ (deprecated)
rabbit.__proto__ = animal;

console.log(rabbit.eats);  // true (inherited)
console.log(rabbit.jumps); // true (own property)

// Get prototype
console.log(rabbit.__proto__ === animal); // true

// Modern alternative (preferred):
Object.getPrototypeOf(rabbit) === animal; // true
Object.setPrototypeOf(rabbit, animal);    // Set prototype
```

### `prototype`

Property of constructor functions that becomes the prototype of instances.

```javascript
function Dog(name) {
  this.name = name;  // Instance property
}

// Add method to prototype (shared by all instances)
Dog.prototype.bark = function() {
  console.log(`${this.name} says woof!`);
};

const dog1 = new Dog("Rex");
const dog2 = new Dog("Max");

// Both instances share the same bark method
console.log(dog1.bark === dog2.bark); // true

// Relationship:
console.log(dog1.__proto__ === Dog.prototype);           // true
console.log(Object.getPrototypeOf(dog1) === Dog.prototype); // true (preferred)
console.log(Dog.prototype.constructor === Dog);          // true
```

### The Complete Picture

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const alice = new Person("Alice");

/*
Relationships:

alice (instance)
  ├─ name: "Alice"
  └─ __proto__ / [[Prototype]]
       ↓
Person.prototype (object)
  ├─ greet: function
  ├─ constructor: Person
  └─ __proto__ / [[Prototype]]
       ↓
Object.prototype
  └─ __proto__ / [[Prototype]]
       ↓
     null

Person (function)
  └─ prototype
       ↓
Person.prototype (same object as above)
*/

// Verify relationships:
alice.__proto__ === Person.prototype;                    // true
Person.prototype.constructor === Person;                 // true
alice.__proto__.__proto__ === Object.prototype;          // true
Object.getPrototypeOf(alice) === Person.prototype;       // true (preferred)
```

### Why the Confusion?

```javascript
function Dog() {}

const dog = new Dog();

// These all refer to the same thing:
dog.__proto__
Object.getPrototypeOf(dog)
Dog.prototype

// They all equal Dog.prototype
console.log(dog.__proto__ === Dog.prototype);                  // true
console.log(Object.getPrototypeOf(dog) === Dog.prototype);     // true

// But Dog.__proto__ is different!
console.log(Dog.__proto__ === Function.prototype);             // true
// (Dog is a function, so its prototype is Function.prototype)
```

---

## Creating Objects with Prototypes

### Method 1: Object.create()

**Most modern and flexible approach.**

```javascript
// Create prototype object
const animal = {
  type: 'animal',
  speak() {
    console.log(`${this.name} makes a sound`);
  }
};

// Create object with animal as prototype
const dog = Object.create(animal);
dog.name = "Rex";
dog.breed = "Labrador";

console.log(dog.type);  // "animal" (inherited)
dog.speak();            // "Rex makes a sound"

// With property descriptors
const cat = Object.create(animal, {
  name: {
    value: "Whiskers",
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 3,
    writable: true
  }
});

console.log(cat.name); // "Whiskers"
console.log(cat.age);  // 3
```

### Method 2: Constructor Functions

**Classic JavaScript approach.**

```javascript
function Person(name, age) {
  // Instance properties
  this.name = name;
  this.age = age;
}

// Shared methods on prototype
Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}, ${this.age} years old`);
};

Person.prototype.sayAge = function() {
  console.log(`I'm ${this.age} years old`);
};

// Create instances
const john = new Person("John", 30);
const jane = new Person("Jane", 25);

john.greet();  // "Hi, I'm John, 30 years old"
jane.greet();  // "Hi, I'm Jane, 25 years old"

// Methods are shared (memory efficient)
console.log(john.greet === jane.greet); // true
```

### Method 3: ES6 Classes

**Syntactic sugar over prototypes.**

```javascript
class Animal {
  constructor(name) {
    this.name = name;  // Instance property
  }

  // Method (added to Animal.prototype)
  speak() {
    console.log(`${this.name} makes a sound`);
  }

  // Static method (on class itself)
  static info() {
    console.log("Animals are living organisms");
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call parent constructor
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`);
  }

  fetch() {
    console.log(`${this.name} fetches the ball`);
  }
}

const dog = new Dog("Rex", "Labrador");
dog.speak();      // "Rex barks"
dog.fetch();      // "Rex fetches the ball"
Animal.info();    // "Animals are living organisms"
```

### Method 4: Object.setPrototypeOf()

**Works but slow - avoid in production.**

```javascript
const animal = {
  eats: true
};

const rabbit = {
  jumps: true
};

// Set prototype after creation (slow!)
Object.setPrototypeOf(rabbit, animal);

console.log(rabbit.eats);  // true
console.log(rabbit.jumps); // true

// Why it's slow: changes object's internal structure
// Engine optimizations are invalidated
```

### Comparison

```javascript
// 1. Object.create - most flexible
const proto1 = { method() { console.log("proto1"); } };
const obj1 = Object.create(proto1);

// 2. Constructor - classic pattern
function Constructor() {}
Constructor.prototype.method = function() { console.log("constructor"); };
const obj2 = new Constructor();

// 3. ES6 Class - modern, clean syntax
class MyClass {
  method() { console.log("class"); }
}
const obj3 = new MyClass();

// All achieve the same result:
obj1.method(); // "proto1"
obj2.method(); // "constructor"
obj3.method(); // "class"
```

---

## Prototypal vs Functional Inheritance

### Prototypal Inheritance

Objects inherit from other objects via prototype chain.

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

Animal.prototype.sleep = function() {
  console.log(`${this.name} is sleeping`);
};

const dog = new Animal("Rex");
const cat = new Animal("Whiskers");

dog.speak();  // "Rex makes a sound"
cat.speak();  // "Whiskers makes a sound"

// Methods are shared (memory efficient)
console.log(dog.speak === cat.speak); // true
```

**Characteristics:**
- Methods stored on prototype (shared)
- Memory efficient
- Uses `new` keyword
- Public properties (no true privacy)
- Prototype chain visible

### Functional Inheritance

Factory functions that return objects with methods.

```javascript
function createAnimal(name) {
  // Private variable (true privacy via closure)
  let energy = 100;

  return {
    name: name,

    speak() {
      console.log(`${this.name} makes a sound`);
    },

    sleep() {
      energy += 10;
      console.log(`${this.name} is sleeping. Energy: ${energy}`);
    },

    getEnergy() {
      return energy;  // Controlled access to private variable
    }
  };
}

const dog = createAnimal("Rex");
const cat = createAnimal("Whiskers");

dog.speak();         // "Rex makes a sound"
dog.sleep();         // "Rex is sleeping. Energy: 110"
console.log(dog.getEnergy()); // 110

// Methods are NOT shared (each instance has its own copy)
console.log(dog.speak === cat.speak); // false

// Private variables are truly private
console.log(dog.energy); // undefined (no direct access)
```

### Comparison Table

| Aspect | Prototypal | Functional |
|--------|-----------|-----------|
| **Memory** | Efficient (shared methods) | Less efficient (duplicate methods) |
| **Privacy** | No true privacy | True privacy via closures |
| **Syntax** | `new` keyword, `prototype` | Factory function, returns object |
| **Inheritance** | Via prototype chain | Via composition |
| **instanceof** | Works | Doesn't work |
| **Performance** | Faster | Slightly slower |
| **Flexibility** | Less flexible | More flexible |

### Hybrid Approach

Combine both for best of both worlds:

```javascript
function createPerson(name, age) {
  // Private variables
  let _id = Math.random();

  // Use constructor for shared methods
  function Person() {
    this.name = name;
    this.age = age;
  }

  Person.prototype.greet = function() {
    console.log(`Hi, I'm ${this.name}`);
  };

  // Create instance
  const instance = new Person();

  // Add methods that need access to private data
  instance.getId = function() {
    return _id;
  };

  return instance;
}

const person = createPerson("John", 30);
person.greet();  // "Hi, I'm John"
console.log(person.getId());  // Random number
console.log(person._id);      // undefined (private)
```

---

## Methods to Set/Get Prototype

### Getting Prototype

#### Modern (Preferred)

```javascript
const obj = {};

// Get prototype - preferred method
const proto = Object.getPrototypeOf(obj);
console.log(proto === Object.prototype); // true
```

#### Legacy (Deprecated)

```javascript
const obj = {};

// Using __proto__ - deprecated but still works
console.log(obj.__proto__ === Object.prototype); // true
```

### Setting Prototype

#### At Creation (Preferred)

```javascript
const animal = {
  eats: true
};

// Object.create - best practice
const rabbit = Object.create(animal);
console.log(rabbit.eats); // true

// With property descriptors
const bird = Object.create(animal, {
  flies: {
    value: true,
    writable: true,
    enumerable: true
  }
});
```

#### After Creation (Avoid)

```javascript
const animal = {
  eats: true
};

const rabbit = {
  jumps: true
};

// Object.setPrototypeOf - works but slow!
Object.setPrototypeOf(rabbit, animal);
console.log(rabbit.eats); // true

// __proto__ - deprecated
// rabbit.__proto__ = animal;
```

### Checking Prototype Relationships

```javascript
const animal = {
  eats: true
};

const rabbit = Object.create(animal);

// Check if animal is in rabbit's prototype chain
console.log(animal.isPrototypeOf(rabbit)); // true

// instanceof (works with constructors)
function Dog() {}
const dog = new Dog();
console.log(dog instanceof Dog);    // true
console.log(dog instanceof Object); // true

// Check constructor
console.log(rabbit.constructor === Object); // true
console.log(dog.constructor === Dog);       // true
```

### Creating Objects with null Prototype

```javascript
// Object with no prototype (truly empty)
const obj = Object.create(null);

console.log(obj.toString); // undefined
console.log(Object.getPrototypeOf(obj)); // null

// Useful for:
// - Pure dictionaries
// - No inherited properties
// - No prototype pollution

// Use case: clean map/dictionary
const dictionary = Object.create(null);
dictionary.hasOwnProperty = "my value";  // Would conflict on normal object
console.log(dictionary.hasOwnProperty);  // "my value" (not the method)
```

### Summary of Methods

```javascript
// GET prototype
Object.getPrototypeOf(obj)        // ✅ Preferred
obj.__proto__                     // ❌ Deprecated

// SET prototype at creation
Object.create(proto)              // ✅ Preferred
Object.create(proto, properties)  // ✅ With descriptors

// SET prototype after creation
Object.setPrototypeOf(obj, proto) // ⚠️ Slow, avoid
obj.__proto__ = proto             // ❌ Deprecated

// CHECK relationships
proto.isPrototypeOf(obj)          // ✅ Check if in chain
obj instanceof Constructor        // ✅ For constructors
```

---

## Secure Objects

### Prevent Extensions

No new properties can be added.

```javascript
const obj = { x: 1 };

Object.preventExtensions(obj);

obj.x = 2;      // OK - modify existing
console.log(obj.x); // 2

obj.y = 3;      // Silently fails (strict mode: throws)
console.log(obj.y); // undefined

delete obj.x;   // OK - can delete
console.log(obj.x); // undefined

// Check if extensible
console.log(Object.isExtensible(obj)); // false
```

### Seal

No add/remove properties, but can modify existing values.

```javascript
const obj = { x: 1, y: 2 };

Object.seal(obj);

obj.x = 10;     // OK - modify existing
console.log(obj.x); // 10

obj.z = 3;      // Fails - can't add
console.log(obj.z); // undefined

delete obj.y;   // Fails - can't delete
console.log(obj.y); // 2 (still there)

// Check if sealed
console.log(Object.isSealed(obj)); // true
```

### Freeze

Completely immutable (shallow).

```javascript
const obj = { x: 1, y: 2 };

Object.freeze(obj);

obj.x = 10;     // Fails - can't modify
console.log(obj.x); // 1 (unchanged)

obj.z = 3;      // Fails - can't add
console.log(obj.z); // undefined

delete obj.y;   // Fails - can't delete
console.log(obj.y); // 2 (still there)

// Check if frozen
console.log(Object.isFrozen(obj)); // true
```

### Important: Shallow Operations

```javascript
const obj = {
  x: 1,
  nested: { y: 2 }
};

Object.freeze(obj);

obj.x = 10;           // Fails
console.log(obj.x);   // 1

obj.nested.y = 20;    // Works! (nested object not frozen)
console.log(obj.nested.y); // 20

// Deep freeze (recursive)
function deepFreeze(obj) {
  Object.freeze(obj);

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      deepFreeze(obj[key]);
    }
  });

  return obj;
}

const obj2 = {
  x: 1,
  nested: { y: 2 }
};

deepFreeze(obj2);
obj2.nested.y = 20;   // Now fails
console.log(obj2.nested.y); // 2 (unchanged)
```

### Comparison Table

| Operation | Extensible | Sealed | Frozen |
|-----------|-----------|--------|--------|
| Add properties | ✅ | ❌ | ❌ |
| Delete properties | ✅ | ❌ | ❌ |
| Modify values | ✅ | ✅ | ❌ |
| Modify descriptors | ✅ | ❌ | ❌ |

### Creating Truly Empty Objects

```javascript
// Regular object has inherited properties
const obj1 = {};
console.log(obj1.toString); // [Function: toString] (inherited)

// Object with null prototype - truly empty
const obj2 = Object.create(null);
console.log(obj2.toString); // undefined (no inheritance)

// Benefits:
// - No prototype pollution
// - Clean dictionaries
// - No naming conflicts

// Use case: safe key-value store
const map = Object.create(null);
map['toString'] = "my value";  // Safe! Won't conflict
map['__proto__'] = "another value";  // Safe!
```

### Private Fields with Closures

```javascript
function createSecureObject(secret) {
  // Private variable - truly private
  let _secret = secret;

  // Public interface
  return {
    getSecret() {
      return _secret;
    },

    setSecret(newSecret) {
      if (typeof newSecret === 'string') {
        _secret = newSecret;
      }
    }
  };
}

const obj = createSecureObject("password123");
console.log(obj.getSecret());  // "password123"
console.log(obj._secret);      // undefined (no direct access)
obj.setSecret("newpassword");
console.log(obj.getSecret());  // "newpassword"
```

### ES6 Private Fields (Classes)

```javascript
class SecureAccount {
  #balance = 0;  // Private field

  constructor(initialBalance) {
    this.#balance = initialBalance;
  }

  deposit(amount) {
    this.#balance += amount;
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new SecureAccount(100);
account.deposit(50);
console.log(account.getBalance());  // 150
// console.log(account.#balance);   // SyntaxError: Private field
```

---

## Object.prototype Methods

Common methods inherited by all objects:

### hasOwnProperty()

Check if property is own (not inherited).

```javascript
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.hasOwnProperty('jumps')); // true (own)
console.log(rabbit.hasOwnProperty('eats'));  // false (inherited)
console.log(rabbit.hasOwnProperty('flies')); // false (doesn't exist)
```

### isPrototypeOf()

Check if object is in another's prototype chain.

```javascript
const animal = { eats: true };
const rabbit = Object.create(animal);

console.log(animal.isPrototypeOf(rabbit));          // true
console.log(Object.prototype.isPrototypeOf(rabbit)); // true
console.log(Array.prototype.isPrototypeOf(rabbit));  // false
```

### propertyIsEnumerable()

Check if property is enumerable.

```javascript
const obj = { x: 1 };

Object.defineProperty(obj, 'y', {
  value: 2,
  enumerable: false
});

console.log(obj.propertyIsEnumerable('x'));  // true
console.log(obj.propertyIsEnumerable('y'));  // false
console.log(obj.propertyIsEnumerable('toString')); // false (inherited)
```

### toString()

String representation of object.

```javascript
const obj = { x: 1 };
console.log(obj.toString()); // "[object Object]"

// Override for custom behavior
obj.toString = function() {
  return `Object with x=${this.x}`;
};
console.log(obj.toString()); // "Object with x=1"

// Get precise type
Object.prototype.toString.call([]);        // "[object Array]"
Object.prototype.toString.call(new Date()); // "[object Date]"
Object.prototype.toString.call(/regex/);   // "[object RegExp]"
```

### valueOf()

Primitive value of object.

```javascript
const obj = { x: 1 };
console.log(obj.valueOf()); // { x: 1 } (the object itself)

// Custom behavior
obj.valueOf = function() {
  return this.x;
};

console.log(obj + 10); // 11 (valueOf() called during coercion)
```

### toLocaleString()

Localized string representation.

```javascript
const date = new Date();
console.log(date.toLocaleString()); // Localized date string

const num = 123456.789;
console.log(num.toLocaleString('en-US'));  // "123,456.789"
console.log(num.toLocaleString('de-DE'));  // "123.456,789"
```

---

## Practical Applications

### Example 1: Inheritance Hierarchy

```javascript
// Base class
function Shape(color) {
  this.color = color;
}

Shape.prototype.draw = function() {
  console.log(`Drawing ${this.color} shape`);
};

Shape.prototype.getColor = function() {
  return this.color;
};

// Derived class - Circle
function Circle(color, radius) {
  Shape.call(this, color);  // Call parent constructor
  this.radius = radius;
}

// Set up inheritance
Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

// Add Circle-specific methods
Circle.prototype.area = function() {
  return Math.PI * this.radius ** 2;
};

Circle.prototype.draw = function() {
  console.log(`Drawing ${this.color} circle with radius ${this.radius}`);
};

// Derived class - Rectangle
function Rectangle(color, width, height) {
  Shape.call(this, color);
  this.width = width;
  this.height = height;
}

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.area = function() {
  return this.width * this.height;
};

Rectangle.prototype.draw = function() {
  console.log(`Drawing ${this.color} rectangle ${this.width}x${this.height}`);
};

// Usage
const circle = new Circle('red', 5);
const rect = new Rectangle('blue', 10, 20);

circle.draw();  // "Drawing red circle with radius 5"
rect.draw();    // "Drawing blue rectangle 10x20"

console.log(circle.area());  // 78.54...
console.log(rect.area());    // 200

console.log(circle instanceof Circle);    // true
console.log(circle instanceof Shape);     // true
console.log(circle instanceof Rectangle); // false
```

### Example 2: Mixins via Prototypes

```javascript
// Define mixins (behaviors)
const canEat = {
  eat(food) {
    console.log(`${this.name} is eating ${food}`);
  }
};

const canSwim = {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

const canFly = {
  fly() {
    console.log(`${this.name} is flying`);
  }
};

// Apply mixins to constructor
function Duck(name) {
  this.name = name;
}

// Mix in multiple behaviors
Object.assign(Duck.prototype, canEat, canSwim, canFly);

const duck = new Duck("Donald");
duck.eat("bread");  // "Donald is eating bread"
duck.swim();        // "Donald is swimming"
duck.fly();         // "Donald is flying"

// Apply different mixins to different constructors
function Fish(name) {
  this.name = name;
}

Object.assign(Fish.prototype, canEat, canSwim);

const fish = new Fish("Nemo");
fish.eat("plankton");  // "Nemo is eating plankton"
fish.swim();           // "Nemo is swimming"
// fish.fly();         // TypeError: fish.fly is not a function
```

### Example 3: Plugin System

```javascript
// Base plugin system
function App() {
  this.plugins = [];
}

App.prototype.use = function(plugin) {
  this.plugins.push(plugin);
  plugin.install(this);
};

// Plugin 1: Logger
const LoggerPlugin = {
  install(app) {
    app.log = function(message) {
      console.log(`[LOG] ${message}`);
    };
  }
};

// Plugin 2: Storage
const StoragePlugin = {
  install(app) {
    app.storage = {
      data: {},
      set(key, value) {
        this.data[key] = value;
      },
      get(key) {
        return this.data[key];
      }
    };
  }
};

// Use plugins
const myApp = new App();
myApp.use(LoggerPlugin);
myApp.use(StoragePlugin);

myApp.log("Application started");  // "[LOG] Application started"
myApp.storage.set("user", "John");
console.log(myApp.storage.get("user"));  // "John"
```

### Example 4: Method Chaining

```javascript
function Calculator(value = 0) {
  this.value = value;
}

Calculator.prototype.add = function(n) {
  this.value += n;
  return this;  // Return this for chaining
};

Calculator.prototype.subtract = function(n) {
  this.value -= n;
  return this;
};

Calculator.prototype.multiply = function(n) {
  this.value *= n;
  return this;
};

Calculator.prototype.divide = function(n) {
  this.value /= n;
  return this;
};

Calculator.prototype.result = function() {
  return this.value;
};

// Method chaining
const result = new Calculator(10)
  .add(5)
  .multiply(2)
  .subtract(10)
  .divide(2)
  .result();

console.log(result);  // 10
```

### Example 5: Observable Pattern

```javascript
function Observable() {
  this.observers = [];
}

Observable.prototype.subscribe = function(fn) {
  this.observers.push(fn);
};

Observable.prototype.unsubscribe = function(fn) {
  this.observers = this.observers.filter(observer => observer !== fn);
};

Observable.prototype.notify = function(data) {
  this.observers.forEach(observer => observer(data));
};

function DataModel() {
  Observable.call(this);  // Inherit Observable
  this.data = null;
}

DataModel.prototype = Object.create(Observable.prototype);
DataModel.prototype.constructor = DataModel;

DataModel.prototype.setData = function(data) {
  this.data = data;
  this.notify(data);  // Notify all observers
};

// Usage
const model = new DataModel();

const observer1 = (data) => console.log(`Observer 1 received: ${data}`);
const observer2 = (data) => console.log(`Observer 2 received: ${data}`);

model.subscribe(observer1);
model.subscribe(observer2);

model.setData("Hello");
// Output:
// Observer 1 received: Hello
// Observer 2 received: Hello

model.unsubscribe(observer1);
model.setData("World");
// Output:
// Observer 2 received: World
```

---

## Summary

### Key Takeaways

1. **Prototypal inheritance** - objects inherit from other objects
2. **Prototype chain** - property lookup follows chain to null
3. **`__proto__` vs `prototype`** - instance vs constructor property
4. **Multiple ways to create** - Object.create, constructors, classes
5. **Prototypal vs functional** - trade-offs between memory and privacy
6. **Secure objects** - prevent extensions, seal, freeze
7. **Practical patterns** - mixins, plugins, method chaining

### Best Practices

- Use `Object.create()` for setting up inheritance
- Prefer `Object.getPrototypeOf()` over `__proto__`
- Don't use `Object.setPrototypeOf()` in production (slow)
- Share methods on prototype (memory efficient)
- Use ES6 classes for cleaner syntax
- Check own properties with `hasOwnProperty()`
- Create null-prototype objects for dictionaries

### Common Patterns

```javascript
// Inheritance setup
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// Mixins
Object.assign(Constructor.prototype, mixin1, mixin2);

// Method chaining
return this;

// Check type
obj instanceof Constructor
proto.isPrototypeOf(obj)
```
