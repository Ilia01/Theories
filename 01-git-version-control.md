# Git and Version Control Systems

## Table of Contents
- [Version Control Basics](#version-control-basics)
- [Git Basic Operations](#git-basic-operations)
- [Repository Management](#repository-management)
- [Branching and Merging](#branching-and-merging)
- [Remote Operations](#remote-operations)
- [Advanced Git Commands](#advanced-git-commands)
- [Handling Merge Conflicts](#handling-merge-conflicts)
- [Gitflow Workflow](#gitflow-workflow)
- [Tagging](#tagging)
- [Safe Practices](#safe-practices)

---

## Version Control Basics

### What is a Version Control System (VCS)?
A system that tracks changes to files over time, allowing you to recall specific versions later.

### Importance of VCS
- **Collaboration**: Multiple developers can work together without conflicts
- **History**: Complete record of changes (who, what, when, why)
- **Revert**: Ability to go back to previous states
- **Branching**: Experiment with features without affecting main code
- **Backup**: Disaster recovery and redundancy

### Types of Version Control Systems

#### 1. Local VCS
- Database of changes on local machine
- Example: RCS
- Limited collaboration

#### 2. Centralized VCS (CVCS)
- Single server contains all versioned files
- Examples: SVN, Perforce
- Single point of failure
- Requires network connection

#### 3. Distributed VCS (DVCS)
- Every client mirrors the entire repository
- Examples: Git, Mercurial
- No single point of failure
- Works offline
- Full backup on every client

---

## Git Basic Operations

### Essential Commands

```bash
# Initialize a new repository
git init

# Stage changes
git add <file>        # Stage specific file
git add .             # Stage all changes
git add *.js          # Stage all JavaScript files

# Commit staged changes
git commit -m "Descriptive message"

# Check working directory status
git status

# View commit history
git log
git log --oneline     # Compact view
git log --graph       # Visual branch graph

# Show unstaged changes
git diff
git diff --staged     # Show staged changes
git diff <commit1> <commit2>  # Compare commits
```

### Git Workflow

```
Working Directory → Staging Area (Index) → Local Repository → Remote Repository
     |                    |                      |                    |
  git add          git commit              git push            git pull
```

---

## Repository Management

### Understanding Git Structure

- **Working Directory**: Current state of files you're editing
- **Staging Area (Index)**: Intermediate area where commits are prepared
- **Local Repository**: `.git` directory containing all version history
- **Remote Repository**: Repository hosted on a server (GitHub, GitLab, etc.)

### Repository Commands

```bash
# Create new repository
git init

# Clone existing repository
git clone <url>
git clone <url> <directory-name>

# Configure settings
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --list  # View configuration

# Remove file from tracking
git rm <file>           # Delete from working dir and stage deletion
git rm --cached <file>  # Remove from tracking, keep in working dir

# Rename or move file
git mv <old-name> <new-name>

# View remote repositories
git remote -v
```

---

## Branching and Merging

### Branch Concepts

- **Branch**: Independent line of development
- **HEAD**: Pointer to current branch/commit
- **Master/Main**: Default primary branch

### Branch Commands

```bash
# List branches
git branch              # Local branches
git branch -a           # All branches (local + remote)
git branch -r           # Remote branches only

# Create new branch
git branch <branch-name>

# Switch to branch
git checkout <branch-name>
git switch <branch-name>  # Modern alternative

# Create and switch in one command
git checkout -b <branch-name>
git switch -c <branch-name>  # Modern alternative

# Delete branch
git branch -d <branch-name>   # Safe delete (merged only)
git branch -D <branch-name>   # Force delete

# Rename branch
git branch -m <old-name> <new-name>

# Merge branch into current branch
git merge <branch-name>

# View merged branches
git branch --merged
git branch --no-merged
```

### Merge Types

#### Fast-Forward Merge
```bash
# When target branch has no new commits
git checkout main
git merge feature
# Result: main pointer simply moves forward
```

#### Three-Way Merge
```bash
# When both branches have new commits
git checkout main
git merge feature
# Result: new merge commit created
```

---

## Remote Operations

### Understanding Remotes

- **Remote**: Reference to repository on another server
- **Origin**: Default name for primary remote
- **Upstream**: Common name for original repo (in forks)

### Remote Commands

```bash
# Clone repository (creates local copy)
git clone <url>

# Add remote
git remote add origin <url>
git remote add upstream <url>

# View remotes
git remote -v

# Remove remote
git remote remove <name>

# Rename remote
git remote rename <old-name> <new-name>

# Fetch (download without merging)
git fetch origin
git fetch origin <branch>
git fetch --all  # Fetch all remotes

# Pull (fetch + merge)
git pull origin main
git pull --rebase origin main  # Rebase instead of merge

# Push (upload to remote)
git push origin main
git push -u origin main  # Set upstream tracking
git push --all           # Push all branches
git push --tags          # Push all tags

# View remote branch info
git remote show origin
```

### Fetch vs Pull vs Clone

| Command | What it does |
|---------|--------------|
| `git clone` | Copy entire repository (first time) |
| `git fetch` | Download objects/refs, doesn't merge |
| `git pull` | Fetch + Merge in one operation |

```bash
# Fetch then manually merge
git fetch origin
git merge origin/main

# Equivalent to:
git pull origin main
```

---

## Advanced Git Commands

### Reset

Moves HEAD and branch pointer. **Use carefully!**

```bash
# Soft reset - undo commit, keep changes staged
git reset --soft HEAD~1
git reset --soft <commit-hash>

# Mixed reset (default) - undo commit and unstage
git reset HEAD~1
git reset --mixed HEAD~1

# Hard reset - undo commit and discard changes
git reset --hard HEAD~1
git reset --hard origin/main  # Match remote exactly
```

**When to use each:**
- `--soft`: Want to recommit with different message or changes
- `--mixed`: Want to unstage and re-stage differently
- `--hard`: Want to completely discard changes (dangerous!)

### Revert

Creates new commit that undoes changes. **Safe for published commits.**

```bash
# Revert specific commit
git revert <commit-hash>

# Revert multiple commits
git revert <commit1>..<commit2>

# Revert without committing (stage changes)
git revert -n <commit-hash>
git revert --no-commit <commit-hash>

# Revert merge commit
git revert -m 1 <merge-commit-hash>
```

### Reset vs Revert

| Reset | Revert |
|-------|--------|
| Moves branch pointer backward | Creates new commit |
| Rewrites history | Preserves history |
| Don't use on published commits | Safe for published commits |
| `git reset --hard HEAD~1` | `git revert HEAD` |

### Blame

Shows who modified each line and when.

```bash
# Show line-by-line authorship
git blame <file>

# Blame specific line range
git blame -L 10,20 <file>
git blame -L 10,+5 <file>  # 5 lines starting from line 10

# Show email instead of name
git blame -e <file>

# Ignore whitespace changes
git blame -w <file>

# Show commit hash in short form
git blame -s <file>
```

### Other Useful Advanced Commands

```bash
# Stash (temporarily save changes)
git stash
git stash save "Work in progress"
git stash list
git stash pop    # Apply and remove from stash
git stash apply  # Apply but keep in stash

# Cherry-pick (apply specific commit)
git cherry-pick <commit-hash>

# Reflog (see all HEAD movements)
git reflog
git reflog show <branch>

# Show changes in commit
git show <commit-hash>

# Interactive rebase
git rebase -i HEAD~3

# Find bugs with binary search
git bisect start
git bisect bad          # Current version is bad
git bisect good <commit> # Known good commit
# Git will check out commits for you to test
git bisect good/bad     # Mark each test result
git bisect reset        # When done
```

---

## Handling Merge Conflicts

### What is a Merge Conflict?

Occurs when Git can't automatically merge changes because:
- Same lines modified in both branches
- File deleted in one branch, modified in another
- Same file modified differently

### Conflict Markers

```text
<<<<<<< HEAD
Your changes in current branch
=======
Their changes from merging branch
>>>>>>> feature-branch
```

### Resolution Process

```bash
# 1. Start merge
git merge feature-branch
# CONFLICT (content): Merge conflict in file.js

# 2. View conflicts
git status

# 3. Open file(s) and edit manually
# Remove conflict markers and decide what to keep

# 4. Mark as resolved
git add <file>

# 5. Complete merge
git commit
# Or abort:
git merge --abort
```

### Example Resolution

**Before:**
```javascript
<<<<<<< HEAD
function greet(name) {
    return `Hello, ${name}!`;
}
=======
function greet(name) {
    return `Hi, ${name}!!!`;
}
>>>>>>> feature-branch
```

**After resolution:**
```javascript
function greet(name) {
    return `Hello, ${name}!`;
}
```

### Tools for Resolving Conflicts

```bash
# Use merge tool
git mergetool

# View conflict in different ways
git diff
git diff --ours    # Show diff with our version
git diff --theirs  # Show diff with their version
git diff --base    # Show diff with base version
```

### Reverting Commits

```bash
# Revert last commit (creates new commit)
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert range of commits
git revert <oldest-commit>..<newest-commit>

# Revert but don't commit yet
git revert -n <commit-hash>

# Undo revert
git revert <revert-commit-hash>
```

**Use Revert Instead of Reset When:**
- Commit is already pushed
- Collaborating with others
- Want to preserve history
- Undoing public changes

---

## Gitflow Workflow

### Overview

Gitflow is a branching model that defines a strict branching structure.

### Branch Types

#### Main Branches (live forever)

1. **main/master**
   - Production-ready code
   - Only merge from release or hotfix branches
   - Tagged with version numbers

2. **develop**
   - Integration branch
   - Latest delivered development changes
   - Base for feature branches

#### Supporting Branches (temporary)

3. **feature/***
   - Develop new features
   - Branch from: `develop`
   - Merge back to: `develop`
   - Naming: `feature/user-authentication`

4. **release/***
   - Prepare for production release
   - Branch from: `develop`
   - Merge to: `main` AND `develop`
   - Naming: `release/1.2.0`

5. **hotfix/***
   - Emergency fixes for production
   - Branch from: `main`
   - Merge to: `main` AND `develop`
   - Naming: `hotfix/1.2.1`

### Gitflow in Action

#### Feature Development
```bash
# Start feature
git checkout develop
git checkout -b feature/login
# ... work on feature ...
git add .
git commit -m "Add login feature"

# Finish feature
git checkout develop
git merge --no-ff feature/login
git branch -d feature/login
git push origin develop
```

#### Release Preparation
```bash
# Start release
git checkout develop
git checkout -b release/1.2.0
# ... bump version, update changelog ...
git commit -m "Prepare release 1.2.0"

# Finish release
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

git branch -d release/1.2.0
```

#### Hotfix
```bash
# Start hotfix
git checkout main
git checkout -b hotfix/1.2.1
# ... fix critical bug ...
git commit -m "Fix critical security bug"

# Finish hotfix
git checkout main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1 -m "Hotfix 1.2.1"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/1.2.1
git push origin develop

git branch -d hotfix/1.2.1
```

### Benefits of Gitflow
- Clear separation of concerns
- Parallel development
- Easy to scale with teams
- Structured release process
- Emergency fixes don't disrupt development

---

## Tagging

### What are Tags?

Named references to specific commits, typically used for marking releases.

### Types of Tags

#### Lightweight Tag
Simple pointer to a commit (like a branch that doesn't change).

```bash
git tag v1.0.0
git tag v1.0.0 <commit-hash>
```

#### Annotated Tag
Full object with metadata (message, tagger name, email, date). **Recommended for releases.**

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git tag -a v1.0.0 <commit-hash> -m "Release 1.0.0"
```

### Tag Commands

```bash
# List tags
git tag
git tag -l "v1.*"  # List tags matching pattern

# View tag details
git show v1.0.0

# Create tag
git tag v1.0.0                          # Lightweight
git tag -a v1.0.0 -m "Release 1.0.0"   # Annotated

# Tag old commit
git tag -a v1.0.0 <commit-hash> -m "Release 1.0.0"

# Push tags
git push origin v1.0.0    # Push specific tag
git push origin --tags    # Push all tags
git push --follow-tags    # Push commits and annotated tags

# Delete tag
git tag -d v1.0.0              # Delete local
git push origin --delete v1.0.0 # Delete remote
git push origin :refs/tags/v1.0.0  # Alternative delete

# Checkout tag
git checkout v1.0.0  # Detached HEAD state
git checkout -b version1 v1.0.0  # Create branch from tag
```

### Tag Naming Conventions

**Semantic Versioning (SemVer):**
```
v<MAJOR>.<MINOR>.<PATCH>

v1.0.0   - Initial release
v1.1.0   - New features (backward compatible)
v1.1.1   - Bug fixes
v2.0.0   - Breaking changes
```

**Pre-release versions:**
```
v1.0.0-alpha
v1.0.0-beta.1
v1.0.0-rc.1  (release candidate)
```

### Significance of Tagging

- **Mark release points**: Clear identification of versions
- **Easy rollback**: Quickly checkout stable version
- **Changelog reference**: Link changes to versions
- **Deployment**: Deploy specific tagged versions
- **Documentation**: Version docs with releases
- **Compliance**: Track exactly what was released

---

## Safe Practices for Destructive Commands

### Destructive Commands

Commands that can permanently lose data or rewrite history:
- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git branch -D`
- `git rebase`
- `git filter-branch`

### Safe Practices

#### 1. Always Backup

```bash
# Create backup branch before risky operations
git branch backup-$(date +%s)
git branch backup-before-rebase

# Or tag current state
git tag backup-20250123
```

#### 2. Use Dry Run When Available

```bash
# See what would be deleted
git clean -n
git clean --dry-run

# Preview what would be pushed
git push --dry-run origin main
```

#### 3. Use Git Reflog for Recovery

```bash
# View all HEAD movements
git reflog

# Recover "lost" commits
git reflog
# Find commit before mistake
git reset --hard HEAD@{5}

# Recover deleted branch
git reflog
git checkout -b recovered-branch <commit-hash>
```

#### 4. Use --force-with-lease Instead of --force

```bash
# BAD - overwrites remote regardless
git push --force origin main

# GOOD - fails if remote has changes you don't have
git push --force-with-lease origin main
```

#### 5. Avoid Force Push on Shared Branches

```bash
# Never force push to:
# - main/master
# - develop
# - Any branch others are using

# Only force push to:
# - Your personal feature branches
# - After coordinating with team
```

#### 6. Use Revert Instead of Reset for Published Commits

```bash
# If commit is pushed:
git revert <commit-hash>  # SAFE - creates new commit

# Don't use:
git reset --hard HEAD~1   # DANGEROUS - rewrites history
```

#### 7. Stash Before Switching Context

```bash
# Save work in progress
git stash
git stash save "WIP: implementing feature X"

# Switch to other work
git checkout other-branch

# Return and restore
git checkout original-branch
git stash pop
```

#### 8. Double-Check Branch Name

```bash
# Before destructive operation, verify branch
git branch  # Shows current branch with *

# Use git status
git status

# Full verification
git rev-parse --abbrev-ref HEAD
```

#### 9. Test Destructive Commands Locally First

```bash
# Create test repository
mkdir test-repo
cd test-repo
git init
# ... test your commands here ...
# Delete when done
```

#### 10. Configure Git Aliases for Safety

```bash
# Add confirmation prompts
git config --global alias.delete-branch '!git branch -d'

# Safer force push
git config --global alias.pushf 'push --force-with-lease'

# Better log
git config --global alias.lg "log --graph --oneline --all"
```

### Recovery Scenarios

#### Scenario 1: Accidentally Deleted Commits

```bash
# Find the commit in reflog
git reflog

# Reset to before mistake
git reset --hard HEAD@{2}
```

#### Scenario 2: Accidentally Reset Hard

```bash
# Commits aren't truly deleted for ~30 days
git reflog
git cherry-pick <commit-hash>  # Recover specific commits
# Or
git reset --hard <commit-hash>  # Reset to before the reset
```

#### Scenario 3: Deleted Branch

```bash
# Find branch commit in reflog
git reflog | grep "branch-name"

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

#### Scenario 4: Merge Gone Wrong

```bash
# Immediately after merge
git merge --abort

# After merge commit
git reset --hard HEAD~1

# Or revert the merge
git revert -m 1 <merge-commit-hash>
```

### Checklist Before Destructive Operations

- [ ] Current branch is correct
- [ ] Changes are committed or stashed
- [ ] Created backup branch or tag
- [ ] Tested command in safe environment
- [ ] Confirmed with team (if shared branch)
- [ ] Know how to recover (reflog)
- [ ] Using safer alternatives when possible

### Configuration for Extra Safety

```bash
# Require explicit push for new branches
git config --global push.default nothing

# Warn before deleting
git config --global advice.detachedHead true

# Enable automatic garbage collection safety
git config --global gc.reflogExpire 90
git config --global gc.reflogExpireUnreachable 60

# Prevent accidental commit to main
# (use pre-commit hook)
```

---

## Summary

### Key Takeaways

1. **Version Control** is essential for collaboration and code management
2. **Git** is a distributed VCS with powerful features
3. **Branching** enables parallel development
4. **Remote operations** facilitate team collaboration
5. **Gitflow** provides structured workflow for releases
6. **Tags** mark important points in history
7. **Safety practices** prevent data loss

### Best Practices

- Commit often with meaningful messages
- Pull before push
- Use branches for features and fixes
- Never rewrite published history
- Keep commits atomic and focused
- Review changes before committing
- Use `.gitignore` appropriately
- Document your workflow

### Essential Commands to Master

```bash
git status
git add / git commit
git push / git pull
git branch / git checkout
git merge
git log
git diff
git stash
git reset / git revert
git tag
```
