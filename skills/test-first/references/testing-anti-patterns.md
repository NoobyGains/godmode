# Testing anti-patterns

Read this before adding a mock, a fake, a test helper or a cleanup method, and whenever a test passes for reasons you cannot explain.

Two principles sit under every pattern here:

1. **Every test names the break it catches.** You can say which realistic production mistake would make it fail.
2. **Every test exercises the real thing.** Mocks isolate slow or external dependencies; they are never the subject of an assertion.

Watching a test fail against real code before you write the implementation prevents most of what follows, which is why `godmode:test-first` insists on it.

## Contents

1. Asserting on the mock
2. Test-only methods on production classes
3. Mocking without knowing the side effects
4. Incomplete fake data
5. Mirror assertions
6. Change detectors
7. Sleeping instead of waiting
8. Tests as an afterthought
9. Quick reference

## 1. Asserting on the mock

```typescript
// Bad: proves the mock rendered, not that the dashboard works
render(<Dashboard />);
expect(screen.getByTestId('nav-panel-mock')).toBeInTheDocument();

// Good: assert what the real component exposes to a user
render(<Dashboard />);
expect(screen.getByRole('navigation')).toBeInTheDocument();
```

The bad test passes whenever the mock exists and fails whenever it does not. It says nothing about the component.

**Check:** before asserting on anything a mock produced, ask whether you are checking the system or the stand-in. If the stand-in, delete the assertion or remove the mock.

## 2. Test-only methods on production classes

```typescript
// Bad: teardown() exists only so tests can clean up
class Connection {
  async teardown() { await this.pool?.destroy(this.id); }
}

// Good: the cleanup lives with the tests
// test-utils/connection.ts
export async function closeTestConnection(conn: Connection) {
  const info = conn.poolInfo();
  if (info) await poolManager.destroy(info.id);
}
```

A test-only method looks like production API, will be called in production one day, and blurs who owns the resource.

**Check:** is the method called only from tests? Does this class own the resource it cleans up? If the answers are yes and no, it belongs in test utilities.

## 3. Mocking without knowing the side effects

```typescript
// Bad: the mock swallows the write that duplicate detection depends on
vi.mock('./registry', () => ({ syncAndCache: vi.fn().mockResolvedValue(undefined) }));
await addEntry(config);
await addEntry(config); // should throw a duplicate error, never will

// Good: mock only the slow external call below the write
vi.mock('./remote-catalog');
await addEntry(config);
await expect(addEntry(config)).rejects.toThrow('duplicate');
```

**Check, before mocking any method:**
1. List the real method's side effects (writes, events, cache updates).
2. Mark the ones this test depends on.
3. Mock one level lower, at the slow or external boundary, so those side effects stay real.
4. If you are unsure, run the test against the real implementation first and observe what happens.

Warning signs: "I will mock it to be safe", "this might be slow", a mock added before the test has ever run.

## 4. Incomplete fake data

```typescript
// Bad: only the fields this test reads
const response = { status: 'ok', data: { userId: '42' } };

// Good: the full shape the real API returns, taken from its documentation or a recorded response
const response = {
  status: 'ok',
  data: { userId: '42', name: 'Ada' },
  meta: { requestId: 'req-001', timestamp: 1767225600 },
};
```

A partial fake hides structural assumptions. Downstream code reads `meta.requestId`, the test still passes, production breaks.

**Check:** build fakes from a real response or the documented schema, with every field the system might read. Give success, error and malformed cases their own fixtures so the wrong branch cannot satisfy the test.

## 5. Mirror assertions

```typescript
// Bad: the same function produces both sides, so the test is always true
expect(buildQuery({ tag: 'urgent' })).toBe(buildQuery({ tag: 'urgent' }));

// Good: a literal you derived by hand
expect(buildQuery({ tag: 'urgent' })).toBe('tag:"urgent"');
```

An expectation computed by the code under test, or by its helpers, passes whatever that code does. Prefer table-driven tests with literal expected values.

## 6. Change detectors

```typescript
// Bad: fails on every deliberate redesign, sleeps through real bugs
expect(MAX_RETRIES).toBe(5);

// Good: tests the behaviour that depends on the decision
test('a failing call is attempted five times and never a sixth', async () => { /* ... */ });
```

Tests that only intentional decisions can break (a constant, exact message wording, private structure, the text of a config file) cost upkeep and catch nothing. Test the observable behaviour that depends on the decision. For scripts and configuration, run them against controlled inputs and assert outputs, side effects or exit codes, not their source text.

## 7. Sleeping instead of waiting

```typescript
// Bad: a guess about timing, flaky under load
await new Promise((r) => setTimeout(r, 300));
expect(results).toHaveLength(2);

// Good: wait for the condition, with a timeout and a clear message
await waitUntil(() => results.length >= 2, 'two results', 5000);
expect(results).toHaveLength(2);
```

The polling helper and the rare cases where a fixed delay is correct are in the condition-based waiting reference of `godmode:fault-diagnosis`.

## 8. Tests as an afterthought

"Implementation done, tests next" means the tests will be shaped to the code and will pass on first run. Testing is part of implementing. If you find yourself here, `godmode:test-first` says to delete the untested code and rebuild it from failing tests.

## When mocks get out of hand

Switch to an integration test with real components when:
- the mock setup is longer than the test logic;
- the mocks lack methods the real objects have;
- a test breaks when the mock changes but not when the code does;
- you cannot explain why a particular mock is needed.

## 9. Quick reference

| Anti-pattern | Fix |
|---|---|
| Asserting on mock output | Assert real behaviour, or remove the mock |
| Test-only method on a production class | Move it to test utilities |
| Mocking a method whose side effects the test needs | Mock one level lower |
| Partial fake data | Mirror the full documented shape |
| Expected value computed by the code under test | Hand-derived literal |
| Asserting constants or source text | Assert the behaviour that depends on them |
| Fixed sleeps | Condition-based waiting |
| Tests written after the code | Delete and rebuild test-first |
