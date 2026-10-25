---
name: fault-diagnosis
description: "Use when a test fails, a build breaks, a bug is reported, behaviour is unexpected, performance degrades or an integration stops working, before proposing or making any fix."
---

# Fault Diagnosis

A fix that is not aimed at the root cause is a guess, and guesses pile up: each one adds a change, hides a symptom and makes the next failure harder to read. Diagnosis runs in four phases (reproduce, isolate, find the root cause, fix with a regression test) and each phase leaves evidence behind. **No fix until you can say what is broken, where, and why.**

## The Prime Directive

```
NO FIX WITHOUT A REPRODUCED FAILURE AND A ROOT CAUSE YOU CAN STATE
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Any failing test, broken build, crash, error message or wrong output.
- A bug report from the user or from production.
- Flaky behaviour: passes sometimes, fails sometimes.
- Performance that got worse, and integrations that stopped working.
- Especially when the fix "looks obvious", when time is short, and when a previous fix did not work.

**Skip:**
- Nothing. For a simple bug the four phases take minutes; the process is fast exactly when the problem is simple.

## The Protocol

### Phase 1: Reproduce

1. **Read the whole error.** The full message, the full stack trace, the exit code, the lines just before the failure. Note file paths, line numbers and error codes. Errors often state the answer outright.
2. **Reproduce it on demand.** Find the exact steps, inputs and environment that trigger it, and write them down. Run them and see the failure yourself. If you cannot reproduce it, you are not ready to fix it: gather more data (logs, inputs, versions, timing) instead of guessing.
3. **Make the reproduction small and fast.** Strip away everything that does not affect the failure until you have the shortest command or test that shows it. Ideally it is already a failing automated test.
4. **Check what changed.** `git log` and `git diff` since the last known-good state, dependency and lockfile changes, configuration, environment, data. If a known-good commit exists, `git bisect run <reproduction command>` finds the first bad commit mechanically.

Evidence: the reproduction steps and the failing output.

### Phase 2: Isolate

5. **Find the failing component.** In a system with several layers (CI, build script, signing step; API, service, database), add temporary logging at each boundary: what goes in, what comes out, which configuration and environment each layer sees. Run once. The first boundary where the data goes wrong is where you look next.
6. **Trace the bad value backwards.** When the error surfaces deep in the call stack, follow the bad value up the chain to where it was created. The method is in [root cause tracing](references/root-cause-tracing.md).
7. **Compare with something that works.** Find similar code in the same codebase that works, or the reference implementation of the pattern you are using, and read it completely. List every difference, however small. Do not decide in advance which differences "cannot matter".
8. **For test pollution** (a test passes alone, fails in the suite, or the suite leaves files behind), bisect the test files: run halves of the suite in a fixed order until one file produces the effect. The root cause tracing reference describes the method.

Evidence: the component, the line or the commit where good data turns bad.

### Phase 3: Root Cause

9. **State one hypothesis** in writing: "X is the root cause because Y." It must explain every symptom you have seen, not just the most visible one.
10. **Test it with the smallest possible change or observation.** One variable at a time: a log line, an assertion, a changed input. Predict the result before you run it.
11. **Confirmed:** go to phase 4. **Refuted:** discard the hypothesis, keep what you learned, form a new one. Do not stack a second change on top of the first.
12. **If you do not know, say so.** "I do not understand why X" is a valid state. Research it (read the library source, its issue tracker, its current documentation via `godmode:grounding`) or ask the user, rather than pretending.

Evidence: the hypothesis, the prediction and the observation that confirmed it.

### Phase 4: Fix with a Regression Test

13. **Write the failing test first.** It reproduces the bug through the same entry point, and you watch it fail for the reason you identified (`godmode:test-first`).
14. **Fix the root cause, once.** One change, at the source, not at the place the symptom appeared. No unrelated clean-ups in the same change.
15. **Verify.** The new test passes, the full suite passes, the original reproduction from phase 1 no longer fails. Revert the fix and watch the test fail again; restore it. Report this evidence through `godmode:completion-gate`.
16. **Harden where it pays.** If bad data reached deep code, add validation at the layers it crossed so the same class of bug cannot recur: see [defense in depth](references/defense-in-depth.md). If the failure was timing-related, replace sleeps with [condition-based waiting](references/condition-based-waiting.md); a complete helper is in [the waiting example](references/condition-based-waiting-example.ts).

### When fixes keep failing

Count your fix attempts for this issue. After **two** failed fixes, the next attempt must come from a new pass through phases 1 to 3, not from a variation of the last fix. After **three**, stop and invoke `godmode:error-recovery`: repeated failures that each reveal a new problem somewhere else usually mean the design is wrong, not the last line you edited. Discuss the design with the user before a fourth attempt.

## When There Is No Root Cause in the Code

Sometimes the cause really is outside the code: a provider outage, a clock skew, an external rate limit, a race in a dependency you cannot change. You may conclude this only after phases 1 to 3, with evidence. Then:

1. Write down what you investigated and what ruled the code out.
2. Handle it explicitly: a bounded retry with backoff, a timeout, a clear error message, a fallback the user agreed to.
3. Add logging or monitoring that will catch it next time with more detail.

Most "it must be the environment" conclusions are unfinished investigations. Treat the conclusion as a hypothesis like any other and test it.

## Signals That You Have Skipped a Phase

From your own thoughts:
- "Quick fix for now, investigate later."
- "Let me just try changing X."
- "I will change a few things and run the tests."
- "It is probably X." (without evidence)
- Listing fixes before you have reproduced the failure.

From the user:
- "Is that actually happening?" You assumed without checking.
- "Stop guessing." You are proposing fixes without a root cause.
- "Will that show us anything?" You should be collecting evidence, not changing code.
- "We are going round in circles." Your approach is not converging; go to `godmode:error-recovery`.

Any of these: stop and go back to phase 1.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "The bug is simple; the process is overkill." | Simple bugs have root causes too, and for them the phases take minutes. |
| "This is urgent; no time for diagnosis." | Guess-and-check under pressure is the slowest way to fix anything. |
| "I can see the problem; let me fix it." | You can see a symptom. The root cause is what explains all the symptoms. |
| "Several changes at once will save time." | When it works you will not know which change did it, and when it fails you will not know which one broke it. |
| "I will add the test once the fix works." | A fix without a failing test first has no proof it fixes this bug. |
| "The reference is long; I will adapt the pattern from memory." | Half-read patterns are a reliable source of new bugs. Read it all. |
| "One more attempt." (after two failures) | Two failures are a signal. Go back to phase 1, or after three, to error recovery. |
| "It must be a caching or environment issue." | Maybe. Prove it with a clean run before you build on it. |

## Guardrails

**Never:**
- Propose or make a fix before the failure is reproduced and the root cause stated.
- Change more than one variable per experiment.
- Fix at the symptom when you can trace to the source.
- Delete, skip or weaken a failing test to make the suite pass.
- Leave temporary diagnostic logging in the final change.
- Attempt a fourth fix without stepping back with the user.

**Always:**
- Read the full error and keep the failing output.
- Write the hypothesis down and predict the result of each experiment.
- Reproduce the bug as a failing test before the fix.
- Verify with the new test, the full suite and the original reproduction.
- Report what you found, including the parts you could not explain.

## Connections

- `godmode:test-first`: the failing regression test in phase 4.
- `godmode:error-recovery`: takes over after three failed fixes or when diagnosis stops converging.
- `godmode:completion-gate`: evidence that the fix holds before you say it is fixed.
- `godmode:grounding`: current documentation, changelogs and issue trackers when a library or platform behaves unexpectedly.
- `godmode:performance-tuning`: when the fault is slowness rather than wrong output.
- `godmode:environment-awareness`: shell, path, line-ending and platform differences that cause "works on my machine".
