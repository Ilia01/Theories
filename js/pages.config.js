/**
 * Study Guide Configuration
 * Single source of truth for all pages/concepts
 */

const path = require('node:path');

module.exports = {
  sourceDir: path.join(__dirname, '..'),

  outputDir: path.join(__dirname, '..', 'docs'),

  site: {
    title: 'JS/NodeJs Concepts',
    subtitle: 'Theory Test Preparation',
    hero: {
      title: 'Theory Test Study Guide',
      description: 'Comprehensive material covering Git, JavaScript fundamentals, and advanced concepts'
    }
  },

  pages: [
    {
      id: 'git',
      title: 'Git & Version Control',
      source: '01-git-version-control.md',
      file: '01-git-version-control.html',
      description: 'Version control basics, Git operations, branching, merging, remote workflows, and safe practices for destructive commands.',
      number: 1,
    },
    {
      id: 'data-types',
      title: 'JavaScript Data Types',
      source: '02-javascript-data-types.md',
      file: '02-javascript-data-types.html',
      description: 'Primitive types, type conversion, coercion, typeof operator, and implementing robust type checking functions.',
      number: 2
    },
    {
      id: 'prototypal-inheritance',
      title: 'Prototypal Inheritance',
      source: '03-prototypal-inheritance.md',
      file: '03-prototypal-inheritance.html',
      description: 'Prototype chains, __proto__ vs prototype, creating objects, inheritance patterns, and practical applications.',
      number: 3
    },
    {
      id: 'closures',
      title: 'Closures',
      source: '04-closures.md',
      file: '04-closures.html',
      description: 'Closure concepts, lexical scoping, practical scenarios, common pitfalls, and advanced implementations like memoization.',
      number: 4
    },
    {
      id: 'context',
      title: 'Context (this)',
      source: '05-context.md',
      file: '05-context.html',
      description: 'Understanding this keyword, binding rules, context loss solutions, and handling context in async functions.',
      number: 5
    },
    {
      id: 'classes',
      title: 'Classes',
      source: '06-classes.md',
      file: '06-classes.html',
      description: 'ES6 classes, inheritance with extends, constructors, private fields, static members, and instanceof operator.',
      number: 6
    },
    {
      id: 'event-loop',
      title: 'Event Loop & Async',
      source: '07-event-loop-async.md',
      file: '07-event-loop-async.html',
      description: 'Event loop phases, blocking code impact, setTimeout behavior, macro tasks vs micro tasks, and execution order.',
      number: 7
    },
    {
      id: 'garbage-collection',
      title: 'Garbage Collection',
      source: '08-garbage-collection.md',
      file: '08-garbage-collection.html',
      description: 'Memory management, GC algorithms, memory leaks, V8 engine specifics, and optimization strategies.',
      number: 8
    }
  ],
};
