# JavaScript Theory and Practice Study Guide

[![Deploy to GitHub Pages](https://github.com/Ilia01/Theories/actions/workflows/deploy.yml/badge.svg)](https://github.com/Ilia01/Theories/actions/workflows/deploy.yml)

A comprehensive study guide for JavaScript/Node.js theory test preparation, built with modern web technologies and deployed automatically to GitHub Pages.

## Quick Start

### For Studying
Visit the live site: [https://ilia01.github.io/Theories/](https://ilia01.github.io/Theories/)

### For Development

```bash
# Clone the repository
git clone https://github.com/Ilia01/Theories.git
cd Theories

# Install dependencies
npm install

# Build the site
npm run build

# (Optional) Run linting
npm run lint

# (Optional) Format code
npm run format
```

## Contents

This guide covers 8 major topic areas:

1. **[Git and Version Control](01-git-version-control.md)**
   - Version control basics and importance
   - Git basic operations and repository management
   - Branching and merging strategies
   - Remote operations (fetch, pull, clone)
   - Advanced commands (reset, revert, blame)
   - Merge conflict resolution
   - Gitflow workflow
   - Tagging and safe practices

2. **[JavaScript Data Types](02-javascript-data-types.md)**
   - Weakly typed language concepts
   - Primitive data types (7 types)
   - Primitive vs reference types
   - Type conversion and coercion
   - typeof operator usage
   - Type checking and conversion functions

3. **[Prototypal Inheritance](03-prototypal-inheritance.md)**
   - Inheritance concepts and benefits
   - Prototypal inheritance basics
   - Prototype chain understanding
   - `__proto__` vs `prototype`
   - Creating objects with prototypes
   - Prototypal vs functional inheritance
   - Secure objects and Object.prototype methods

4. **[Closures](04-closures.md)**
   - Closure definition and concepts
   - Practical scenarios (privacy, factories, callbacks)
   - Common issues and pitfalls
   - Implementation examples (memoization, debounce, throttle)
   - Writing and analyzing closure code

5. **[Context in JavaScript](05-context.md)**
   - Context definition (this keyword)
   - Global vs runtime context
   - Four binding rules (default, implicit, explicit, new)
   - Context loss problems and solutions
   - Async functions and context
   - Node.js specific context issues

6. **[Classes](06-classes.md)**
   - Class conception and creation methods
   - Class vs function constructor differences
   - Inheritance with extends keyword
   - Constructors and instance methods
   - Private and protected properties
   - Static properties and methods
   - instanceof operator usage

7. **[Event Loop and Async Programming](07-event-loop-async.md)**
   - Sync vs async programming
   - Blocking code and Node.js performance
   - Event loop phases and operation
   - setTimeout and setInterval usage
   - Zero delay setTimeout behavior
   - Macro tasks vs micro tasks

8. **[Garbage Collection](08-garbage-collection.md)**
   - GC basics and purpose
   - Memory management lifecycle
   - Common memory leak causes
   - Manual intervention options
   - GC algorithms (mark-and-sweep)
   - V8 engine specifics
   - Minimizing GC impact strategies

## 🎯 How to Use This Guide

### For Studying

1. **Start with Rate 2 topics** - Build your foundation
2. **Progress to Rate 3-4** - Deepen your understanding
3. **Practice with examples** - Don't just read, code along
4. **Create your own examples** - Test your understanding
5. **Review regularly** - Use spaced repetition

### Skill Levels

Each topic covers multiple skill levels:
- **Rate 2**: Basic understanding and fundamental concepts
- **Rate 3**: Intermediate knowledge and practical application
- **Rate 4**: Advanced techniques and edge cases

### Official Documentation
- [MDN Web Docs](https://developer.mozilla.org/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Git Documentation](https://git-scm.com/doc)
- [V8 Blog](https://v8.dev/blog)

### Books
- "You Don't Know JS" series by Kyle Simpson
- "Eloquent JavaScript" by Marijn Haverbeke
- "JavaScript: The Good Parts" by Douglas Crockford
- "Pro Git" by Scott Chacon

### Interactive Learning
- [JavaScript.info](https://javascript.info/)
- [FreeCodeCamp](https://www.freecodecamp.org/)
- [Learn Git Branching](https://learngitbranching.js.org/)

## Architecture

### Project Structure
```
theory_practice/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── docs/                       # Output directory (served by GitHub Pages)
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── build.js           # Build script
│   │   ├── nav.js             # Navigation functionality
│   │   ├── progress.js        # Progress tracking system
│   │   ├── search.js          # Search functionality
│   │   └── shortcuts.js       # Keyboard shortcuts
│   ├── template.html          # HTML template
│   └── *.html                 # Generated HTML pages
├── *.md                       # Markdown source files
└── package.json
```

### Build Process

The site uses a custom build system that:
1. Reads markdown source files (*.md)
2. Converts markdown to HTML using `marked` with syntax highlighting via `highlight.js`
3. Injects content into the template
4. Generates table of contents automatically
5. Outputs final HTML files to the `docs/` directory

### Progress Tracking

Progress tracking is **individual per user** and works entirely client-side:
- Uses browser `localStorage` to store progress
- Each user has their own progress stored locally
- No backend required
- Progress persists across sessions on the same device
- Users can export/import their progress as JSON

## Deployment

### Automatic Deployment (GitHub Pages)

The site automatically deploys to GitHub Pages when you push to the `main` branch:

1. GitHub Actions workflow runs
2. Dependencies are installed
3. Build script generates HTML files
4. Site is deployed to GitHub Pages

### Manual Deployment

If needed, you can manually trigger deployment:
1. Go to the "Actions" tab in GitHub
2. Select "Deploy to GitHub Pages"
3. Click "Run workflow"

### GitHub Pages Setup

Ensure GitHub Pages is configured correctly:
1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. The site will be available at `https://[username].github.io/[repo-name]/`

## Development

### Adding a New Topic

1. Create a new markdown file (e.g., `09-new-topic.md`)
2. Add the topic to `docs/js/pages.config.js`:
   ```javascript
   {
     id: 'new-topic',
     title: 'New Topic',
     source: '09-new-topic.md',
     file: '09-new-topic.html',
     description: 'Description of the new topic.',
     number: 9
   }
   ```
3. Run `npm run build`
4. Commit and push changes

### Code Quality

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

Quick summary:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

---

Remember: Understanding beats memorization. Focus on the "why" and the "what" will follow.
