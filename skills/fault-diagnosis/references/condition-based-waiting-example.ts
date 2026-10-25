// Condition-based waiting helpers for tests. Self-contained, no dependencies.
// Replace guessed sleeps with waits for the condition the test needs.
// See condition-based-waiting.md in this directory for when to use them.

export interface WaitOptions {
  /** Give up after this many milliseconds. Default 5000. */
  timeoutMs?: number;
  /** Poll interval in milliseconds. Default 10. */
  intervalMs?: number;
  /** Abort the wait early, for example when the test is cancelled. */
  signal?: AbortSignal;
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Resolve with the first truthy value returned by `check`.
 * Rejects with a message naming `description` when the timeout passes.
 */
export async function waitUntil<T>(
  check: () => T | undefined | null | false,
  description: string,
  { timeoutMs = 5000, intervalMs = 10, signal }: WaitOptions = {},
): Promise<T> {
  const start = Date.now();
  for (;;) {
    if (signal?.aborted) throw new Error(`Aborted while waiting for ${description}`);
    const value = check();
    if (value) return value;
    const elapsed = Date.now() - start;
    if (elapsed > timeoutMs) {
      throw new Error(`Timed out after ${timeoutMs} ms waiting for ${description}`);
    }
    await sleep(Math.min(intervalMs, Math.max(1, timeoutMs - elapsed)));
  }
}

/** Anything that exposes the events it has recorded so far. */
export interface EventSource<E> {
  events(): readonly E[];
}

/** Wait for the first event matching `predicate`. */
export function waitForEvent<E>(
  source: EventSource<E>,
  predicate: (event: E) => boolean,
  description: string,
  options?: WaitOptions,
): Promise<E> {
  return waitUntil(() => source.events().find(predicate), description, options);
}

/** Wait until at least `count` events match `predicate`; resolve with all matches. */
export async function waitForEventCount<E>(
  source: EventSource<E>,
  predicate: (event: E) => boolean,
  count: number,
  description: string,
  options?: WaitOptions,
): Promise<E[]> {
  let seen = 0;
  try {
    return await waitUntil(
      () => {
        const matches = source.events().filter(predicate);
        seen = matches.length;
        return matches.length >= count ? matches : undefined;
      },
      `${count} x ${description}`,
      options,
    );
  } catch (error) {
    throw new Error(`${(error as Error).message} (saw ${seen})`);
  }
}

// Usage, before and after:
//
// Before (flaky, passes about 60 percent of the time under load):
//   const reply = agent.send('run two tools');
//   await sleep(300);                 // hope both tools have started
//   agent.abort();
//   await reply;
//   await sleep(50);                  // hope the results have arrived
//   expect(results).toHaveLength(2);
//
// After (deterministic):
//   const isCall = (e: AgentEvent) => e.type === 'TOOL_CALL';
//   const isResult = (e: AgentEvent) => e.type === 'TOOL_RESULT';
//   const reply = agent.send('run two tools');
//   await waitForEventCount(agent, isCall, 2, 'tool calls');
//   agent.abort();
//   await reply;
//   await waitForEventCount(agent, isResult, 2, 'tool results');
//   expect(results).toHaveLength(2);
