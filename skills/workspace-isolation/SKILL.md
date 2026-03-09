---
name: workspace-isolation
description: Use when starting feature work that needs isolation from the current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Workspace Isolation

## Overview

Git worktrees create isolated workspaces sharing the same repository, enabling work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm applying the workspace-isolation skill to set up an isolated workspace."

## The Prime Directive

> **NO FEATURE WORK ON THE MAIN BRANCH**

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required for:**
- Feature development of any size
- Bug fixes requiring more than a single-line change
- Refactoring work
- Any task from a development plan (delegated or otherwise)
- Experimental or exploratory implementation

**Not required for:**
- Single-line hotfixes on main
- Documentation-only changes
- Configuration file updates (e.g., .gitignore, CLAUDE.md)
- Reading or investigating code without making changes

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "It's a small feature, I'll just work on main" | Small features grow. Worktrees cost seconds, broken main costs hours. |
| "Setting up a worktree takes too long" | Worktree creation is faster than untangling work mixed into main. |
| "I'll create a branch later when it's ready" | Working on main means every mistake is on main. Branch first. |
| "The worktree setup failed, I'll skip it" | Fix the setup issue. Do not proceed on main as a workaround. |
| "I'm just prototyping, it doesn't matter" | Prototypes on main become accidental commits. Isolate always. |

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that directory. If both exist, `.worktrees` takes precedence.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference is specified:** Use it without asking.

### 3. Ask User

If no directory exists and no CLAUDE.md preference:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/godmode/worktrees/<project-name>/ (global location)

Which do you prefer?
```

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify the directory is ignored before creating the worktree:**

```bash
# Check if directory is ignored (respects local, global, and system gitignore)
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:**

Fix it immediately:
1. Add the appropriate line to .gitignore
2. Commit the change
3. Proceed with worktree creation

**Why critical:** Prevents accidentally committing worktree contents to the repository.

### For Global Directory (~/.config/godmode/worktrees)

No .gitignore verification needed -- outside the project entirely.

## Creation Steps

### 1. Detect Project Name

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. Create Worktree

```bash
# Determine full path
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.config/godmode/worktrees/*)
    path="~/.config/godmode/worktrees/$project/$BRANCH_NAME"
    ;;
esac

# Create worktree with new branch
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 3. Run Project Setup

Auto-detect and run the appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
if [ -f pyproject.toml ]; then poetry install; fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 4. Verify Clean Baseline

Run tests to ensure the worktree starts clean:

```bash
# Examples - use the project-appropriate command
npm test
cargo test
pytest
go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### 5. Report Location

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| `worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md -> Ask user |
| Directory not ignored | Add to .gitignore + commit |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

### Skipping ignore verification

- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always use `git check-ignore` before creating a project-local worktree

### Assuming directory location

- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: existing > CLAUDE.md > ask

### Proceeding with failing tests

- **Problem:** Cannot distinguish new defects from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

### Hardcoding setup commands

- **Problem:** Breaks on projects using different tooling
- **Fix:** Auto-detect from project files (package.json, etc.)

## Example Workflow

```
You: I'm applying the workspace-isolation skill to set up an isolated workspace.

[Check .worktrees/ - exists]
[Verify ignored - git check-ignore confirms .worktrees/ is ignored]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]
[Run npm install]
[Run npm test - 47 passing]

Worktree ready at /home/user/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

## Guardrails

**Never:**
- Create a worktree without verifying it is ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking
- Assume directory location when ambiguous
- Skip CLAUDE.md check

**Always:**
- Follow directory priority: existing > CLAUDE.md > ask
- Verify directory is ignored for project-local
- Auto-detect and run project setup
- Verify clean test baseline

## Connections

**Called by:**
- **intent-discovery** (Phase 4) - REQUIRED when design is approved and implementation follows
- **delegated-execution** - REQUIRED before executing any tasks
- **task-runner** - REQUIRED before executing any tasks
- Any skill needing isolated workspace

**Pairs with:**
- **merge-protocol** - REQUIRED for cleanup after work is complete
