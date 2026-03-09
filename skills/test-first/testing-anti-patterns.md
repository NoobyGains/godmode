# Testing Anti-Patterns

**Consult this reference when:** writing or modifying tests, introducing mocks, or tempted to add test-only methods to production classes.

## Overview

Tests must verify actual behavior, not mock behavior. Mocks are isolation tools, not the subject under test.

**Core principle:** Validate what the code does, not what the mocks do.

**Adhering to strict test-first discipline prevents these anti-patterns.**

## The Three Laws

```
1. NEVER validate mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding the dependency chain
```

## Anti-Pattern 1: Validating Mock Behavior

**The mistake:**
```typescript
// BAD: Checking that the mock is present
test('renders navigation panel', () => {
  render(<Dashboard />);
  expect(screen.getByTestId('nav-panel-mock')).toBeInTheDocument();
});
```

**Why this fails:**
- You are confirming the mock works, not that the component works
- Test passes when mock exists, fails when it does not
- Reveals nothing about real behavior

**The correction:**
```typescript
// GOOD: Validate real component or skip the mock entirely
test('renders navigation panel', () => {
  render(<Dashboard />);  // Do not mock the nav panel
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});

// OR if the nav panel must be mocked for isolation:
// Do not assert on the mock - test Dashboard behavior with nav panel present
```

### Checkpoint

```
BEFORE asserting on any mock element:
  Ask: "Am I verifying real component behavior or just mock presence?"

  IF verifying mock presence:
    STOP - Remove the assertion or remove the mock

  Validate real behavior instead
```

## Anti-Pattern 2: Test-Only Methods in Production Classes

**The mistake:**
```typescript
// BAD: teardown() only exists for tests
class Connection {
  async teardown() {  // Looks like production API!
    await this._pool?.destroy(this.id);
    // ... cleanup
  }
}

// In tests
afterEach(() => connection.teardown());
```

**Why this fails:**
- Production class polluted with test-only code
- Dangerous if accidentally invoked in production
- Violates YAGNI and separation of concerns
- Confuses object lifecycle with resource lifecycle

**The correction:**
```typescript
// GOOD: Test utilities handle test cleanup
// Connection has no teardown() - it is stateless in production

// In test-utils/
export async function cleanupConnection(conn: Connection) {
  const poolInfo = conn.getPoolInfo();
  if (poolInfo) {
    await poolManager.destroy(poolInfo.id);
  }
}

// In tests
afterEach(() => cleanupConnection(connection));
```

### Checkpoint

```
BEFORE adding any method to a production class:
  Ask: "Is this only consumed by tests?"

  IF yes:
    STOP - Do not add it
    Place it in test utilities instead

  Ask: "Does this class own this resource's lifecycle?"

  IF no:
    STOP - Wrong class for this method
```

## Anti-Pattern 3: Mocking Without Understanding

**The mistake:**
```typescript
// BAD: Mock breaks test logic
test('detects duplicate entry', () => {
  // Mock prevents the write that test depends on!
  vi.mock('Registry', () => ({
    syncAndCache: vi.fn().mockResolvedValue(undefined)
  }));

  await addEntry(config);
  await addEntry(config);  // Should throw - but will not!
});
```

**Why this fails:**
- Mocked method had a side effect the test depends on (writing state)
- Over-mocking "to be safe" breaks actual behavior
- Test passes for the wrong reason or fails mysteriously

**The correction:**
```typescript
// GOOD: Mock at the correct granularity
test('detects duplicate entry', () => {
  // Mock only the slow part, preserve behavior test needs
  vi.mock('ExternalService'); // Just mock slow network calls

  await addEntry(config);  // State written
  await addEntry(config);  // Duplicate detected correctly
});
```

### Checkpoint

```
BEFORE mocking any method:
  STOP - Do not mock yet

  1. Ask: "What side effects does the real method have?"
  2. Ask: "Does this test depend on any of those side effects?"
  3. Ask: "Do I fully understand what this test requires?"

  IF depends on side effects:
    Mock at a lower level (the actual slow/external operation)
    OR use test doubles that preserve necessary behavior
    NOT the high-level method the test depends on

  IF unsure what the test requires:
    Run test with real implementation FIRST
    Observe what actually needs to happen
    THEN add minimal mocking at the correct level

  Warning signs:
    - "I'll mock this to be safe"
    - "This might be slow, better mock it"
    - Mocking without tracing the dependency chain
```

## Anti-Pattern 4: Incomplete Mocks

**The mistake:**
```typescript
// BAD: Only the fields you happen to know about
const mockPayload = {
  status: 'ok',
  data: { userId: '42', name: 'Bob' }
  // Missing: headers that downstream code reads
};

// Later: breaks when code accesses payload.headers.correlationId
```

**Why this fails:**
- **Partial mocks conceal structural assumptions** - You only mocked fields you are aware of
- **Downstream code may depend on fields you omitted** - Silent failures
- **Tests pass but integration fails** - Mock incomplete, real API complete
- **False confidence** - Test proves nothing about real behavior

**The rule:** Mock the COMPLETE data structure as it exists in reality, not only the fields your immediate test uses.

**The correction:**
```typescript
// GOOD: Mirror the real API response completely
const mockPayload = {
  status: 'ok',
  data: { userId: '42', name: 'Bob' },
  headers: { correlationId: 'corr-001', timestamp: 1234567890 }
  // All fields the real API returns
};
```

### Checkpoint

```
BEFORE creating mock responses:
  Check: "What fields does the real API response contain?"

  Actions:
    1. Examine actual API response from documentation/examples
    2. Include ALL fields the system might consume downstream
    3. Verify mock matches real response schema completely

  Critical:
    If creating a mock, you must understand the ENTIRE structure
    Partial mocks fail silently when code depends on omitted fields

  When uncertain: Include all documented fields
```

## Anti-Pattern 5: Tests as an Afterthought

**The mistake:**
```
Implementation complete
No tests written
"Ready for testing"
```

**Why this fails:**
- Testing is part of implementation, not an optional follow-up
- Test-first would have prevented this
- Cannot claim completeness without tests

**The correction:**
```
Test-first cycle:
1. Write failing test
2. Implement to pass
3. Refactor
4. THEN claim complete
```

## When Mocks Become Unmanageable

**Warning signs:**
- Mock setup exceeds test logic in length
- Mocking everything to get the test to pass
- Mocks are missing methods the real components have
- Test breaks when mock changes

**Consider:** Integration tests with real components are often simpler than elaborate mocks

## Test-First Prevents These Anti-Patterns

**How test-first helps:**
1. **Write test first** -- Forces you to clarify what you are actually testing
2. **Watch it fail** -- Confirms the test verifies real behavior, not mocks
3. **Minimal implementation** -- No test-only methods creep in
4. **Real dependencies** -- You see what the test actually needs before mocking

**If you are validating mock behavior, you violated test-first** -- you added mocks without watching the test fail against real code first.

## Quick Reference

| Anti-Pattern | Correction |
|--------------|-----------|
| Assert on mock elements | Test real component or remove the mock |
| Test-only methods in production | Relocate to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely |
| Tests as afterthought | Test-first: tests before code |
| Over-complex mocks | Consider integration tests |

## Guardrails

- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup exceeds 50% of test
- Test fails when mock is removed
- Cannot explain why mock is needed
- Mocking "just to be safe"

## The Bottom Line

**Mocks are isolation tools, not subjects under test.**

If test-first reveals you are validating mock behavior, something went wrong.

Correction: Validate real behavior or question why you are mocking at all.
