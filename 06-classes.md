# Classes in JavaScript

## Table of Contents
- [Class Conception](#class-conception)
- [Creating Classes](#creating-classes)
- [Class vs Function Constructor](#class-vs-function-constructor)
- [Class Syntax](#class-syntax)
- [Inheritance and extends](#inheritance-and-extends)
- [Constructors](#constructors)
- [Class and Instance Methods](#class-and-instance-methods)
- [Private and Protected Properties](#private-and-protected-properties)
- [Static Properties and Methods](#static-properties-and-methods)
- [instanceof Operator](#instanceof-operator)

---

## Class Conception

### What is a Class?

A **class** is a blueprint/template for creating objects with predefined properties and methods.

**Key Points:**
- Introduced in ES6 (2015)
- Syntactic sugar over JavaScript's prototypal inheritance
- More familiar syntax for developers from OOP languages
- Under the hood, still uses prototypes

### Why Classes?

```javascript
// Before classes (ES5)
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

// With classes (ES6)
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

// Both work the same way!
```

---

## Creating Classes

### Method 1: ES6 Class Syntax (Preferred)

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hi, I'm ${this.name}, ${this.age} years old`);
  }
}

const alice = new Person("Alice", 30);
alice.greet();  // "Hi, I'm Alice, 30 years old"
```

### Method 2: Constructor Function (Pre-ES6)

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}, ${this.age} years old`);
};

const bob = new Person("Bob", 25);
bob.greet();  // "Hi, I'm Bob, 25 years old"
```

### Method 3: Factory Function

```javascript
function createPerson(name, age) {
  return {
    name,
    age,
    greet() {
      console.log(`Hi, I'm ${this.name}, ${this.age} years old`);
    }
  };
}

const charlie = createPerson("Charlie", 35);
charlie.greet();  // "Hi, I'm Charlie, 35 years old"
```

### Method 4: Object.create()

```javascript
const PersonPrototype = {
  greet() {
    console.log(`Hi, I'm ${this.name}, ${this.age} years old`);
  }
};

function createPerson(name, age) {
  const person = Object.create(PersonPrototype);
  person.name = name;
  person.age = age;
  return person;
}

const dave = createPerson("Dave", 40);
dave.greet();  // "Hi, I'm Dave, 40 years old"
```

---

## Class vs Function Constructor

### Differences

| Class | Function Constructor |
|-------|---------------------|
| Must use `new` keyword | Can call without `new` (usually wrong) |
| Not hoisted | Hoisted |
| Always in strict mode | Not strict by default |
| Methods non-enumerable | Methods on prototype are enumerable |
| Cleaner, more concise syntax | More verbose |
| Has `super` keyword | Manual parent calling |
| Cannot call as function | Can be called as function |

### Examples

```javascript
// Constructor function - can call without new (problematic)
function Dog(name) {
  this.name = name;  // 'this' might be global!
}

const dog1 = new Dog("Rex");  // Correct
const dog2 = Dog("Max");      // Oops! 'this' is global
console.log(window.name);     // "Max" (global pollution!)

// Class - requires new
class Cat {
  constructor(name) {
    this.name = name;
  }
}

const cat1 = new Cat("Whiskers");  // Correct
// const cat2 = Cat("Fluffy");     // TypeError: Cannot call a class as a function
```

### Hoisting

```javascript
// Function constructor - hoisted
const dog = new Dog("Rex");  // Works!

function Dog(name) {
  this.name = name;
}

// Class - NOT hoisted
// const cat = new Cat("Whiskers");  // ReferenceError

class Cat {
  constructor(name) {
    this.name = name;
  }
}

const cat = new Cat("Whiskers");  // Works!
```

### Enumeration

```javascript
// Constructor function
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p1 = new Person("Alice");

for (let key in p1) {
  console.log(key);  // "name", "greet" (method is enumerable!)
}

// Class
class PersonClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hi, I'm ${this.name}`);
  }
}

const p2 = new PersonClass("Bob");

for (let key in p2) {
  console.log(key);  // "name" only (method is NOT enumerable)
}
```

---

## Class Syntax

### Basic Structure

```javascript
class ClassName {
  // Constructor - runs when creating instance
  constructor(param1, param2) {
    this.property1 = param1;
    this.property2 = param2;
  }

  // Instance method (on prototype)
  methodName() {
    return this.property1;
  }

  // Getter
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Setter
  set fullName(value) {
    const parts = value.split(' ');
    this.firstName = parts[0];
    this.lastName = parts[1];
  }

  // Static method (on class itself)
  static staticMethod() {
    return 'Static';
  }
}
```

### Complete Example

```javascript
class Rectangle {
  // Constructor
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  // Instance methods
  area() {
    return this.width * this.height;
  }

  perimeter() {
    return 2 * (this.width + this.height);
  }

  // Getter
  get dimensions() {
    return `${this.width} x ${this.height}`;
  }

  // Setter
  set dimensions(value) {
    const [w, h] = value.split('x').map(Number);
    this.width = w;
    this.height = h;
  }

  // Static method
  static fromSquare(side) {
    return new Rectangle(side, side);
  }

  // Static method
  static compare(rect1, rect2) {
    return rect1.area() - rect2.area();
  }
}

// Usage
const rect = new Rectangle(10, 20);
console.log(rect.area());        // 200
console.log(rect.dimensions);    // "10 x 20"
rect.dimensions = "30 x 40";
console.log(rect.area());        // 1200

const square = Rectangle.fromSquare(5);
console.log(square.area());      // 25

console.log(Rectangle.compare(rect, square)); // 1175 (1200 - 25)
```

---

## Inheritance and extends

### Basic Inheritance

```javascript
// Parent class
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound`);
  }

  sleep() {
    console.log(`${this.name} is sleeping`);
  }
}

// Child class
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call parent constructor - MUST be first!
    this.breed = breed;
  }

  speak() {
    console.log(`${this.name} barks`);  // Override parent method
  }

  fetch() {
    console.log(`${this.name} fetches the ball`);  // New method
  }
}

const dog = new Dog("Rex", "Labrador");
dog.speak();  // "Rex barks" (overridden)
dog.sleep();  // "Rex is sleeping" (inherited)
dog.fetch();  // "Rex fetches the ball" (own method)

console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true
```

### Using super

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Call parent constructor
    this.breed = breed;
  }

  speak() {
    const parentSpeak = super.speak();  // Call parent method
    return `${parentSpeak}. ${this.name} barks!`;
  }

  describe() {
    return `${super.speak()}. Breed: ${this.breed}`;
  }
}

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak());     // "Rex makes a sound. Rex barks!"
console.log(dog.describe());  // "Rex makes a sound. Breed: Labrador"
```

### Multi-Level Inheritance

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    console.log(`${this.name} is eating`);
  }
}

class Mammal extends Animal {
  constructor(name, furColor) {
    super(name);
    this.furColor = furColor;
  }

  walk() {
    console.log(`${this.name} is walking`);
  }
}

class Dog extends Mammal {
  constructor(name, furColor, breed) {
    super(name, furColor);
    this.breed = breed;
  }

  bark() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog("Rex", "brown", "Labrador");
dog.eat();   // From Animal
dog.walk();  // From Mammal
dog.bark();  // From Dog

console.log(dog instanceof Dog);     // true
console.log(dog instanceof Mammal);  // true
console.log(dog instanceof Animal);  // true
```

---

## Constructors

### Constructor Rules

1. Only **one constructor** per class
2. Automatically called when using `new`
3. Must call `super()` first in derived class
4. Can be omitted (default constructor used)

### Basic Constructor

```javascript
class Person {
  constructor(name, age) {
    // Instance properties
    this.name = name;
    this.age = age;
    this.createdAt = new Date();
  }
}

const alice = new Person("Alice", 30);
console.log(alice.name);       // "Alice"
console.log(alice.age);        // 30
console.log(alice.createdAt);  // Current date
```

### Constructor with Validation

```javascript
class User {
  constructor(username, email) {
    if (!username || username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }

    this.username = username;
    this.email = email;
    this.createdAt = new Date();
  }
}

const user = new User("alice", "alice@example.com");  // OK
// const invalid = new User("ab", "invalid");  // Error
```

### Default Constructor

```javascript
// Without constructor
class EmptyClass {
  // Default constructor added automatically:
  // constructor() {}
}

// With inheritance but no constructor
class Child extends Parent {
  // Default constructor added automatically:
  // constructor(...args) {
  //   super(...args);
  // }
}
```

### Constructor Return Value

```javascript
class Normal {
  constructor(value) {
    this.value = value;
    // Implicitly returns 'this'
  }
}

const n = new Normal(42);
console.log(n.value);  // 42

class CustomReturn {
  constructor(value) {
    this.value = value;
    return { custom: "object" };  // Override return value
  }
}

const c = new CustomReturn(42);
console.log(c.value);   // undefined
console.log(c.custom);  // "object"
```

---

## Class and Instance Methods

### Instance Methods

Methods that operate on instance data. Shared via prototype.

```javascript
class Counter {
  constructor(initialValue = 0) {
    this.count = initialValue;  // Instance property
  }

  // Instance methods (on prototype)
  increment() {
    this.count++;
    return this.count;
  }

  decrement() {
    this.count--;
    return this.count;
  }

  reset() {
    this.count = 0;
    return this.count;
  }

  getValue() {
    return this.count;
  }
}

const c1 = new Counter(5);
const c2 = new Counter(10);

c1.increment();
console.log(c1.getValue());  // 6
console.log(c2.getValue());  // 10 (independent)

// Methods are shared (memory efficient)
console.log(c1.increment === c2.increment);  // true
```

### Instance Method vs Instance Property Method

```javascript
class Example {
  // Instance method (on prototype - preferred)
  method1() {
    console.log('Method 1');
  }

  // Instance property method (on each instance - avoid unless needed)
  method2 = function() {
    console.log('Method 2');
  }

  // Arrow function property (useful for event handlers)
  method3 = () => {
    console.log('Method 3');
  }
}

const e1 = new Example();
const e2 = new Example();

// method1 is shared (memory efficient)
console.log(e1.method1 === e2.method1);  // true

// method2 is NOT shared (each instance has own copy)
console.log(e1.method2 === e2.method2);  // false

// method3 is NOT shared, but preserves 'this' binding
console.log(e1.method3 === e2.method3);  // false
```

### Static Methods

Methods that belong to the class itself, not instances.

```javascript
class MathUtil {
  static add(a, b) {
    return a + b;
  }

  static multiply(a, b) {
    return a * b;
  }

  static square(n) {
    return this.multiply(n, n);  // Call another static method
  }
}

// Called on class, not instance
console.log(MathUtil.add(5, 3));      // 8
console.log(MathUtil.multiply(4, 2)); // 8
console.log(MathUtil.square(5));      // 25

// Cannot call on instance
const util = new MathUtil();
// util.add(1, 2);  // TypeError: util.add is not a function
```

---

## Private and Protected Properties

### Private Fields (ES2022)

True private fields using `#` prefix.

```javascript
class BankAccount {
  // Private fields (must be declared)
  #balance = 0;
  #accountNumber;

  constructor(accountNumber, initialBalance) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }

  // Private method
  #validateAmount(amount) {
    return amount > 0 && !isNaN(amount);
  }

  deposit(amount) {
    if (this.#validateAmount(amount)) {
      this.#balance += amount;
      return this.#balance;
    }
    throw new Error('Invalid amount');
  }

  withdraw(amount) {
    if (this.#validateAmount(amount) && amount <= this.#balance) {
      this.#balance -= amount;
      return this.#balance;
    }
    throw new Error('Invalid amount or insufficient funds');
  }

  getBalance() {
    return this.#balance;
  }

  // Getter for private field
  get accountNumber() {
    return this.#accountNumber;
  }
}

const account = new BankAccount("ACC123", 1000);
account.deposit(500);
console.log(account.getBalance());      // 1500
console.log(account.accountNumber);     // "ACC123"

// Private fields are truly private
// console.log(account.#balance);       // SyntaxError
// console.log(account.#accountNumber); // SyntaxError
// account.#validateAmount(100);        // SyntaxError
```

### Protected Properties (Convention)

Using `_` prefix as convention (not enforced).

```javascript
class Vehicle {
  constructor(speed) {
    this._speed = speed;  // Convention: "protected"
    this._maxSpeed = 200;
  }

  // Protected method (convention)
  _checkSpeed() {
    if (this._speed > this._maxSpeed) {
      this._speed = this._maxSpeed;
    }
  }

  accelerate(amount) {
    this._speed += amount;
    this._checkSpeed();
  }

  getSpeed() {
    return this._speed;
  }
}

class Car extends Vehicle {
  constructor(speed, brand) {
    super(speed);
    this.brand = brand;
  }

  turboBoost() {
    // Can access "protected" members in child class
    this._speed += 50;
    this._checkSpeed();
  }
}

const car = new Car(100, "Tesla");
car.turboBoost();
console.log(car.getSpeed());

// Not enforced - can still access (but shouldn't)
console.log(car._speed);  // 150 (still accessible, but indicates "don't use")
```

### Comparison

```javascript
class Example {
  // Public property
  publicProp = 'public';

  // Private field (truly private)
  #privateProp = 'private';

  // Protected property (convention only)
  _protectedProp = 'protected';

  showAll() {
    console.log(this.publicProp);      // OK
    console.log(this.#privateProp);    // OK (inside class)
    console.log(this._protectedProp);  // OK
  }
}

const example = new Example();
console.log(example.publicProp);      // "public" - OK
// console.log(example.#privateProp);  // SyntaxError - cannot access
console.log(example._protectedProp);  // "protected" - works but shouldn't use
```

---

## Static Properties and Methods

### Static Methods

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.id = User.generateId();  // Use static method
  }

  // Instance method
  greet() {
    return `Hi, I'm ${this.name}`;
  }

  // Static methods (on class itself)
  static generateId() {
    return Math.random().toString(36).substring(2);
  }

  static fromEmail(email) {
    const name = email.split('@')[0];
    return new User(name, email);
  }

  static compare(user1, user2) {
    return user1.name.localeCompare(user2.name);
  }
}

// Call static methods on class
const id = User.generateId();
const user1 = User.fromEmail("alice@example.com");
const user2 = new User("Bob", "bob@example.com");

console.log(User.compare(user1, user2));  // -1 (alice < bob)

// Cannot call on instance
// user1.generateId();  // TypeError
```

### Static Properties

```javascript
class Config {
  // Static properties
  static apiUrl = "https://api.example.com";
  static timeout = 5000;
  static version = "1.0.0";

  // Static method using static properties
  static getFullUrl(endpoint) {
    return `${this.apiUrl}${endpoint}`;
  }

  static setTimeout(ms) {
    this.timeout = ms;
  }
}

// Access static properties
console.log(Config.apiUrl);     // "https://api.example.com"
console.log(Config.version);    // "1.0.0"

// Use static methods
console.log(Config.getFullUrl("/users"));  // "https://api.example.com/users"

Config.setTimeout(10000);
console.log(Config.timeout);    // 10000

// Not available on instances
const config = new Config();
console.log(config.apiUrl);     // undefined
```

### Benefits of Static Properties/Methods

1. **Shared across all instances**
```javascript
class Counter {
  static count = 0;

  constructor() {
    Counter.count++;
  }

  static getCount() {
    return Counter.count;
  }
}

new Counter();
new Counter();
new Counter();
console.log(Counter.getCount());  // 3
```

2. **Configuration values**
```javascript
class Database {
  static config = {
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  };

  constructor() {
    this.connection = this.connect(Database.config);
  }

  connect(config) {
    return `Connected to ${config.host}:${config.port}`;
  }
}
```

3. **Utility functions**
```javascript
class StringUtil {
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static reverse(str) {
    return str.split('').reverse().join('');
  }

  static truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }
}

console.log(StringUtil.capitalize("hello"));     // "Hello"
console.log(StringUtil.reverse("hello"));        // "olleh"
console.log(StringUtil.truncate("hello world", 5)); // "hello..."
```

4. **Factory methods**
```javascript
class User {
  constructor(name, role) {
    this.name = name;
    this.role = role;
  }

  static createAdmin(name) {
    return new User(name, 'admin');
  }

  static createGuest(name) {
    return new User(name, 'guest');
  }

  static createModerator(name) {
    return new User(name, 'moderator');
  }
}

const admin = User.createAdmin("Alice");
const guest = User.createGuest("Bob");
```

### Static vs Instance

```javascript
class Example {
  // Instance property
  instanceProp = 'instance';

  // Static property
  static staticProp = 'static';

  // Instance method
  instanceMethod() {
    console.log(this.instanceProp);        // Access instance property
    // console.log(this.staticProp);       // undefined
    console.log(Example.staticProp);       // Access static property
  }

  // Static method
  static staticMethod() {
    console.log(this.staticProp);          // Access static property
    console.log(Example.staticProp);       // Same thing
    // console.log(this.instanceProp);     // undefined
  }
}

const ex = new Example();
ex.instanceMethod();      // Works
Example.staticMethod();   // Works

// ex.staticMethod();     // TypeError
// Example.instanceMethod(); // TypeError
```

---

## instanceof Operator

### Basic Usage

```javascript
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}

const dog = new Dog();
const cat = new Cat();

// Check class membership
console.log(dog instanceof Dog);     // true
console.log(dog instanceof Animal);  // true (inheritance)
console.log(dog instanceof Cat);     // false
console.log(dog instanceof Object);  // true (all objects)

// Check array
console.log([] instanceof Array);    // true
console.log([] instanceof Object);   // true

// Primitives are NOT instances
console.log("string" instanceof String);  // false
console.log(5 instanceof Number);         // false
console.log(true instanceof Boolean);     // false

// But wrapper objects are
console.log(new String("text") instanceof String);  // true
console.log(new Number(5) instanceof Number);       // true
```

### How instanceof Works

Checks if `Constructor.prototype` appears in object's prototype chain.

```javascript
class Animal {}
class Dog extends Animal {}

const dog = new Dog();

// Prototype chain: dog -> Dog.prototype -> Animal.prototype -> Object.prototype

console.log(dog instanceof Dog);     // true (Dog.prototype in chain)
console.log(dog instanceof Animal);  // true (Animal.prototype in chain)
console.log(dog instanceof Object);  // true (Object.prototype in chain)

// Manual check (equivalent to instanceof)
console.log(Dog.prototype.isPrototypeOf(dog));     // true
console.log(Animal.prototype.isPrototypeOf(dog));  // true
console.log(Object.prototype.isPrototypeOf(dog));  // true
```

### Practical Uses

```javascript
// Type checking
function processAnimal(animal) {
  if (animal instanceof Dog) {
    animal.bark();
  } else if (animal instanceof Cat) {
    animal.meow();
  }
}

// Validation
class ValidationError extends Error {}
class NetworkError extends Error {}

function handleError(error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  } else if (error instanceof Error) {
    console.log('Unknown error:', error.message);
  }
}

// Duck typing alternative
function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function';
}

console.log(isIterable([]));        // true
console.log(isIterable("string"));  // true
console.log(isIterable({}));        // false
```

### Limitations

```javascript
// Different window/iframe contexts
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const iframeArray = window.frames[0].Array;
const arr = new iframeArray();

console.log(arr instanceof Array);        // false (different Array constructor!)
console.log(Array.isArray(arr));          // true (better for arrays)

// Constructor replacement
class MyClass {}
const obj = new MyClass();

console.log(obj instanceof MyClass);      // true

// Change constructor
MyClass.prototype = {};

console.log(obj instanceof MyClass);      // false (prototype changed!)
```

---

## Summary

### Key Takeaways

1. **Classes** are syntactic sugar over prototypes
2. **extends** creates inheritance hierarchy
3. **super()** calls parent constructor (required in child)
4. **Private fields** (#) provide true privacy
5. **Static members** belong to class, not instances
6. **instanceof** checks prototype chain

### Best Practices

- Use ES6 classes over constructor functions
- Call `super()` first in child constructor
- Use private fields (#) for true encapsulation
- Use static methods for utilities and factories
- Validate in constructor
- Use getters/setters for computed properties
- Name classes with PascalCase

### Common Patterns

```javascript
// Basic class
class Name {
  constructor(params) {
    this.property = params;
  }

  method() {
    return this.property;
  }
}

// Inheritance
class Child extends Parent {
  constructor(params) {
    super(parentParams);
    this.childProperty = params;
  }

  method() {
    super.method();  // Call parent
    // Child implementation
  }
}

// Private fields
class Example {
  #private = 0;

  get value() {
    return this.#private;
  }
}

// Static members
class Util {
  static helper() {
    return 'help';
  }
}
```

### Checklist for Class Design

- [ ] Constructor validates input
- [ ] Private data uses # fields
- [ ] Methods are instance methods (on prototype)
- [ ] Use static methods for utilities
- [ ] Call super() first in child constructors
- [ ] Override parent methods when needed
- [ ] Use getters/setters appropriately
- [ ] Document public API
