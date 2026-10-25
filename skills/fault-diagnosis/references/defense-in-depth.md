# Defense in depth

After you fix a bug caused by invalid data at its source, one check feels like enough. It is not: another caller, a refactor or a mock can route around a single check.

**Principle: validate at each layer the data crosses, so the bug is not just fixed but structurally hard to reintroduce.**

Use this after the root cause is fixed, not instead of fixing it.

## The four layers

### 1. Entry point: reject what is clearly invalid

At the public boundary (an API handler, a CLI argument parser, a library's exported function), reject input that cannot be right.

```typescript
export function createProject(name: string, baseDir: string) {
  if (!baseDir.trim()) throw new Error('baseDir must not be empty');
  if (!existsSync(baseDir)) throw new Error(`baseDir does not exist: ${baseDir}`);
  if (!statSync(baseDir).isDirectory()) throw new Error(`baseDir is not a directory: ${baseDir}`);
  // ...
}
```

### 2. Business logic: check the data makes sense for this operation

Internal functions check the preconditions they rely on, even if the entry point "already did".

```typescript
function setupWorkspace(projectPath: string, sessionId: string) {
  if (!projectPath) throw new Error('setupWorkspace needs a projectPath');
  // ...
}
```

### 3. Environment guards: refuse dangerous operations in the wrong context

Some operations are fine in production and destructive in tests, or the reverse. Guard them by context.

```typescript
async function gitInit(dir: string) {
  if (process.env.NODE_ENV === 'test') {
    const target = path.resolve(dir);
    const tmp = path.resolve(os.tmpdir());
    if (!target.startsWith(tmp + path.sep)) {
      throw new Error(`Refusing git init outside the temp directory during tests: ${dir}`);
    }
  }
  // ...
}
```

### 4. Diagnostics: leave a trail for next time

A debug-level log just before the risky operation, with the context needed to trace it, so the next investigation starts with evidence.

```typescript
logger.debug('git init', { dir, cwd: process.cwd() });
```

## How to apply it

1. **Map the path.** List every function the bad value passed through, from where it was created to where it did damage.
2. **Choose the checks.** For each layer, decide which check belongs there: format at the entry point, meaning in the business logic, context in the guard.
3. **Test each layer on its own.** Bypass layer 1 (call the internal function directly) and confirm layer 2 catches the value; do the same for the guard. A check without a test is a check you hope works.
4. **Keep the messages specific.** Each error names the value, the expectation and the function, so a failure points at its cause.

## Worked example

Bug: an empty `projectPath` made `git init` run in the source directory.

| Layer | Check added |
|---|---|
| Entry | `createProject` rejects an empty, missing or non-directory `baseDir` |
| Business logic | `WorkspaceManager` rejects an empty `projectPath` |
| Environment | `gitInit` refuses to run outside the temporary directory during tests |
| Diagnostics | A trace log before `git init` |

During the fix, each layer caught something the others missed: a second caller skipped the entry point, a mock bypassed the business check, and a platform-specific path form slipped past the first version of the guard.

## When not to add layers

- Do not duplicate the same check in every function of a hot path; check at the boundary and at the point of danger.
- Do not validate types the type system already guarantees; validate values and context.
- Do not turn validation into silent correction. Rejecting bad input loudly is the point.
