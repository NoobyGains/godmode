# Layered Validation

## Overview

When you fix a bug caused by invalid data, adding a single validation check feels sufficient. But that single check can be bypassed by different code paths, refactoring, or test mocks.

**Core principle:** Validate at EVERY layer data passes through. Make the bug structurally impossible to reoccur.

## Why Multiple Layers

Single validation: "We fixed the bug"
Multiple layers: "We made the bug impossible"

Different layers catch different scenarios:
- Entry validation catches most bugs
- Business logic validation catches edge cases
- Environment guards prevent context-specific dangers
- Debug instrumentation helps when other layers fail

## The Four Layers

### Layer 1: Entry Point Validation
**Purpose:** Reject clearly invalid input at the API boundary

```typescript
function initProject(name: string, baseDir: string) {
  if (!baseDir || baseDir.trim() === '') {
    throw new Error('baseDir cannot be empty');
  }
  if (!existsSync(baseDir)) {
    throw new Error(`baseDir does not exist: ${baseDir}`);
  }
  if (!statSync(baseDir).isDirectory()) {
    throw new Error(`baseDir is not a directory: ${baseDir}`);
  }
  // ... proceed
}
```

### Layer 2: Business Logic Validation
**Purpose:** Ensure data is meaningful for this operation

```typescript
function setupWorkspace(projectPath: string, sessionId: string) {
  if (!projectPath) {
    throw new Error('projectPath required for workspace setup');
  }
  // ... proceed
}
```

### Layer 3: Environment Guards
**Purpose:** Prevent dangerous operations in specific contexts

```typescript
async function gitInit(dir: string) {
  // During testing, refuse git init outside temporary directories
  if (process.env.NODE_ENV === 'test') {
    const normalized = normalize(resolve(dir));
    const tmp = normalize(resolve(tmpdir()));

    if (!normalized.startsWith(tmp)) {
      throw new Error(
        `Refusing git init outside temp dir during tests: ${dir}`
      );
    }
  }
  // ... proceed
}
```

### Layer 4: Debug Instrumentation
**Purpose:** Capture context for forensic analysis

```typescript
async function gitInit(dir: string) {
  const trace = new Error().stack;
  logger.debug('About to run git init', {
    dir,
    cwd: process.cwd(),
    trace,
  });
  // ... proceed
}
```

## How to Apply

When you discover a bug:

1. **Trace the data flow** - Where does the bad value originate? Where is it consumed?
2. **Map all checkpoints** - List every point data passes through
3. **Add validation at each layer** - Entry, business logic, environment, debug
4. **Test each layer** - Try to bypass layer 1, verify layer 2 catches it

## Worked Example

Bug: Empty `projectPath` caused `git init` in the source code directory

**Data flow:**
1. Test setup -> empty string
2. `Project.create('name', '')`
3. `WorkspaceManager.createWorkspace('')`
4. `git init` runs in `process.cwd()`

**Four layers added:**
- Layer 1: `Project.create()` validates not empty/exists/writable
- Layer 2: `WorkspaceManager` validates projectPath not empty
- Layer 3: `WorktreeManager` refuses git init outside tmpdir in tests
- Layer 4: Stack trace logging before git init

**Result:** Full test suite passed, bug impossible to reproduce

## Key Insight

All four layers were necessary. During testing, each layer caught bugs the others missed:
- Different code paths bypassed entry validation
- Mocks bypassed business logic checks
- Edge cases on different platforms needed environment guards
- Debug instrumentation identified structural misuse

**Do not stop at one validation point.** Add checks at every layer.
