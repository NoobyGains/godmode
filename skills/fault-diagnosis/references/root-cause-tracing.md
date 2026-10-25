# Root cause tracing

Bugs often surface far from where they start: `git init` runs in the wrong directory, a file appears in the wrong place, a query hits the wrong database. Patching the place the error appears fixes one path to the bug and leaves the source in place.

**Principle: follow the bad value backwards through the call chain until you reach the place it was created. Fix it there.**

## When to use it

- The error is raised deep inside the code, not at the entry point.
- The stack trace is long and the bad value passed through several functions.
- You cannot tell where an invalid value came from.
- Something happens during tests and you do not know which test causes it.

## The method

1. **Write down the symptom exactly.**
   `Error: git init failed in /home/dev/project/packages/core`
2. **Find the line that directly produces it.**
   `await execFile('git', ['init'], { cwd: targetDir });`
3. **Ask what called it, and with which value.** Walk up one frame at a time and note the value at each step:
   ```
   WorktreeManager.create(targetDir = '')
     <- Session.setupWorkspace(projectDir = '')
       <- Session.create(ctx.workDir = '')
         <- test file, top level, before beforeEach ran
   ```
4. **Find where the value was created.** Here an empty string from a test context was read at module load time, before the setup hook filled it in. An empty `cwd` falls back to the process's current directory, which was the source tree.
5. **Fix at the source.** Make the context throw if `workDir` is read before setup, so the mistake fails loudly at the point it is made.
6. **Then harden the layers it passed through** (see `defense-in-depth.md`), so a different path to the same mistake is also stopped.

If you cannot trace one more level up (the value comes from outside your code), the boundary where it enters is the place to validate it.

## When reading is not enough: instrument

Add a temporary log immediately before the dangerous operation, with the context you need to trace it:

```typescript
async function gitInit(dir: string) {
  console.error('TRACE gitInit', {
    dir,
    cwd: process.cwd(),
    stack: new Error().stack,
  });
  await execFile('git', ['init'], { cwd: dir });
}
```

```bash
npm test 2>&1 | grep -A 20 'TRACE gitInit'
```

- In tests, write to standard error directly; the project's logger may be silenced in the test environment.
- Log before the operation, not in the error handler after it fails.
- Include the inputs, the working directory, the relevant environment and the stack.
- Look for the test file name and line in the captured stacks, and for the pattern across calls (same test, same parameter, same order).
- Remove the instrumentation when you have the answer.

## Finding the test that pollutes

Symptoms: a test passes alone and fails in the full run; the suite leaves a file, a directory or a database row behind; the result depends on test order.

1. **Fix the order.** Run the suite in a fixed order (most runners have a flag for sequential or seeded order) so the result is repeatable.
2. **Define the check.** A command that answers "is the pollution there?": a file exists, a row exists, the victim test fails.
3. **Bisect the test files.** List the test files that run before the victim. Run the first half followed by the victim, clean the state, check. Keep the half that produces the effect and split it again. A suite of 200 files takes about eight runs.
4. **Within the guilty file,** repeat with individual tests, or read its setup and teardown for shared state: globals, singletons, environment variables, the working directory, temporary files outside a temporary directory, timers left running, mocks that are never restored.
5. **Fix the polluter, not the victim.** The victim test is usually correct; it is the one telling you something leaked.

When a known-good commit exists and the reproduction is a single command, `git bisect run <command>` finds the commit that introduced the problem without manual halving.

## Worked example

Symptom: a `.git` directory appears inside `packages/core/` after the test run.

| Step | Finding |
|---|---|
| Immediate cause | `git init` ran with `cwd: ''`, which resolves to the process directory |
| One level up | `WorktreeManager.create` received an empty `targetDir` |
| Two levels up | `Session.create` passed `ctx.workDir`, which was `''` |
| Source | The test read `ctx.workDir` at module load, before `beforeEach` set it |
| Fix | `workDir` became a getter that throws if read before setup |
| Hardening | Validation in `Project.create` and `WorktreeManager.create`, a test-only guard refusing `git init` outside the temporary directory, and a trace log before `git init` |

## Tips

- Name each frame and its values as you go; a written chain is easier to check than one held in your head.
- When two code paths reach the same failure, trace both. They may share the source or have two.
- Fixing the source and hardening the layers are both needed: the first fixes this bug, the second stops its relatives.
