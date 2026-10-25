# Condition-based waiting

Flaky tests often wait a guessed number of milliseconds and hope the work is done. On a fast machine it is; under CI load or in parallel runs it is not.

**Principle: wait for the condition you actually need, with a timeout and a clear message, never for a guessed duration.**

## When to use it

- A test contains `setTimeout`, `sleep`, `time.sleep()` or similar before an assertion.
- A test passes alone and fails under load, in CI or when run in parallel.
- A test waits for an asynchronous operation (an event, a file, a state change, a message).

Do **not** use it when the test is about timing itself (a debounce interval, a throttle window, a timeout). Then a fixed delay is correct, and it gets a comment saying why.

## The pattern

```typescript
// Before: a guess about how long it takes
await new Promise((r) => setTimeout(r, 50));
expect(getResult()).toBeDefined();

// After: wait for the thing you need
await waitUntil(() => getResult() !== undefined, 'result to be set');
expect(getResult()).toBeDefined();
```

## Common conditions

| Waiting for | Condition |
|---|---|
| An event | `() => events.some((e) => e.type === 'DONE')` |
| A state | `() => machine.state === 'ready'` |
| A count | `() => items.length >= 5` |
| A file | `() => fs.existsSync(outputPath)` |
| A compound condition | `() => job.done && job.errors.length === 0` |

## A minimal helper

```typescript
export async function waitUntil<T>(
  check: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000,
  intervalMs = 10,
): Promise<T> {
  const start = Date.now();
  for (;;) {
    const value = check();
    if (value) return value;
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out after ${timeoutMs} ms waiting for ${description}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
```

A fuller version with event helpers and an abort signal is in `condition-based-waiting-example.ts` next to this file.

Most test frameworks and UI testing libraries ship their own polling assertions; prefer the project's existing helper when there is one, and check its current documentation for the exact name and options.

## Mistakes to avoid

| Mistake | Fix |
|---|---|
| Polling every millisecond | Poll every 10 ms or so; it is fast enough and does not burn CPU |
| No timeout | Always set one, so a missing condition fails with a message instead of hanging |
| Reading state once before the loop | Read it inside the check, so each poll sees fresh data |
| A vague timeout message | Say what was awaited and, for counts, how many arrived |
| Replacing a sleep with a longer sleep | That moves the flake; it does not remove it |

## When a fixed delay is right

```typescript
// The poller ticks every 100 ms; the test needs two ticks to see partial output.
await waitUntil(() => tool.started, 'tool to start');   // first wait for the trigger
await new Promise((r) => setTimeout(r, 200));            // then wait the known duration
```

Requirements: wait for the triggering condition first, base the duration on a known interval rather than a guess, and write the reason in a comment.
