# Contributing to Theory & Practice Study Guide

Thank you for your interest in contributing to this study guide! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Content Guidelines](#content-guidelines)
- [Code Style](#code-style)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

## Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Theories.git
   cd Theories
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Content Improvements

You can contribute by:
- Fixing typos or grammatical errors
- Clarifying confusing explanations
- Adding examples or diagrams
- Updating outdated information
- Adding new topics or sections

### Code Improvements

You can contribute by:
- Fixing bugs
- Improving UI/UX
- Adding new features
- Optimizing performance
- Improving accessibility

## Content Guidelines

### Writing Style

- **Clear and Concise**: Use simple language and avoid jargon when possible
- **Educational**: Focus on teaching concepts, not just listing facts
- **Examples**: Include practical code examples
- **Structure**: Use proper heading hierarchy (H2, H3, etc.)

### Markdown Format

All content is written in Markdown (`.md` files). Follow these conventions:

```markdown
# Topic Title

## Main Section

### Subsection

- Bullet points for lists
- Use **bold** for emphasis
- Use `code` for inline code
- Use ```language for code blocks

#### Example Code
\```javascript
function example() {
  return 'formatted code';
}
\```
```

### Adding a New Topic

1. Create a new markdown file with the naming convention: `##-topic-name.md`
   - Example: `09-async-await.md`

2. Add the topic to `docs/js/pages.config.js`:
   ```javascript
   {
     id: 'async-await',
     title: 'Async/Await',
     source: '09-async-await.md',
     file: '09-async-await.html',
     description: 'Understanding async/await syntax and patterns.',
     number: 9
   }
   ```

3. Build the site to generate HTML:
   ```bash
   npm run build
   ```

4. Test locally by opening `docs/09-async-await.html` in your browser

## Code Style

### JavaScript

We use ESLint and Prettier to maintain consistent code style:

```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### JavaScript Conventions

- Use ES6+ features (const, let, arrow functions, etc.)
- Use single quotes for strings
- Add semicolons
- Use meaningful variable names
- Comment complex logic
- Keep functions small and focused

### Example

```javascript
// Good
const getUserName = (user) => {
  return user?.name || 'Anonymous';
};

// Avoid
var x = function(u) {
  if(u && u.name) return u.name
  else return "Anonymous"
}
```

## Submitting Changes

### Before Submitting

1. **Build the project** to ensure no errors:
   ```bash
   npm run build
   ```

2. **Run linting** and fix any issues:
   ```bash
   npm run lint:fix
   ```

3. **Format your code**:
   ```bash
   npm run format
   ```

4. **Test thoroughly** by checking:
   - All pages render correctly
   - Navigation works
   - Search functionality works
   - Progress tracking works
   - Dark mode toggle works

### Commit Message Guidelines

Write clear, descriptive commit messages:

```
type: short description

Longer description if needed.
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat: add section on arrow functions

docs: clarify closure examples in 04-closures.md

fix: search not highlighting results correctly
```

### Pull Request Process

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues

3. **Respond to feedback**:
   - Be open to suggestions
   - Make requested changes
   - Update your PR as needed

4. **Wait for approval**:
   - A maintainer will review your PR
   - Once approved, your changes will be merged

## Reporting Issues

Found a bug or have a suggestion? Please create an issue!

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and version (if relevant)
- Screenshots (if applicable)

### Feature Requests

Include:
- Clear description of the feature
- Use case / motivation
- Proposed implementation (optional)

### Content Issues

Include:
- File and section with the issue
- Description of what's wrong or missing
- Suggested correction or improvement

## Questions?

If you have questions or need help:
1. Check existing issues and discussions
2. Create a new issue with your question
3. Tag it as `question`

## Code of Conduct

- Be respectful and professional
- Focus on constructive feedback
- Help create a welcoming environment
- Assume good intentions

Thank you for contributing! Your efforts help everyone learn better.
