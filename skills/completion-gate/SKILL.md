---
name: completion-gate
description: Use when about to declare work done, fixed, or passing, before committing or opening PRs - demands executing verification commands and reading their output before making any success assertions; evidence precedes claims always
---

# Completion Gate

## Overview

Declaring work complete without verification is dishonesty, not efficiency.

**Core principle:** Evidence precedes assertions, always.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO COMPLETION ASSERTIONS WITHOUT FRESH VERIFICATION OUTPUT
```

If the verification command has not been executed in this message, you cannot assert it passes.

## The Entry Protocol

```
BEFORE asserting any status or expressing confidence:

1. IDENTIFY: Which command substantiates this assertion?
2. EXECUTE: Run the FULL command (fresh, complete)
3. INSPECT: Read every line of output, check exit code, tally failures
4. CONFIRM: Does the output support the assertion?
   - If NO: Report actual status with evidence
   - If YES: State the assertion WITH supporting evidence
5. ONLY THEN: Make the assertion

Skipping any step = fabrication, not verification
```

## Verification Requirements

| Assertion | Demands | Insufficient |
|-----------|---------|--------------|
| Tests pass | Test runner output showing 0 failures | Prior run, "should pass" |
| Linter clean | Linter output showing 0 errors | Partial scan, extrapolation |
| Build succeeds | Build command with exit code 0 | Linter passing, log fragments |
| Bug resolved | Original symptom tested and passes | Code modified, assumed fixed |
| Regression test valid | Red-green cycle confirmed | Single green pass |
| Agent finished | VCS diff showing actual changes | Agent self-reported "done" |
| Specification met | Line-by-line requirement checklist | Tests passing alone |

## Guardrails - HALT

- Using hedging language: "should", "probably", "seems to"
- Expressing premature satisfaction ("Done!", "Perfect!", "All good!")
- About to commit/push/open PR without verification
- Trusting an agent's self-reported success
- Relying on partial or stale verification
- Thinking "just this one time"
- Fatigued and wanting to wrap up
- **ANY phrasing that implies success without having run verification**

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "Should work now" | EXECUTE the verification |
| "I'm confident" | Confidence is not evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter is not the compiler |
| "Agent reported success" | Verify independently |
| "I'm tired" | Fatigue is not justification |
| "Partial check is enough" | Partial proof is no proof |
| "Different wording so rule doesn't apply" | Intent over technicality |

## Verification Patterns

**Tests:**
```
CORRECT: [Run test command] [Output: 34/34 pass] "All tests pass"
WRONG: "Should pass now" / "Looks correct"
```

**Regression tests (Red-Green cycle):**
```
CORRECT: Write -> Run (pass) -> Revert fix -> Run (MUST FAIL) -> Restore -> Run (pass)
WRONG: "I've written a regression test" (without red-green confirmation)
```

**Build:**
```
CORRECT: [Run build] [Output: exit 0] "Build passes"
WRONG: "Linter passed" (linter does not validate compilation)
```

**Specification compliance:**
```
CORRECT: Re-read plan -> Create checklist -> Verify each item -> Report gaps or completion
WRONG: "Tests pass, phase done"
```

**Agent delegation:**
```
CORRECT: Agent reports done -> Check VCS diff -> Verify changes -> Report actual state
WRONG: Trust agent report at face value
```

## Verifying Configuration Changes

When testing changes to configuration, providers, feature flags, or environment settings:

**Do not merely confirm the operation succeeded. Confirm the output reflects the intended change.**

### The Silent Fallback Problem

An operation can succeed because *some* valid configuration exists, even if it is not the configuration you intended to apply.

| Change | Insufficient | Required |
|--------|-------------|----------|
| Switch LLM provider | HTTP 200 | Response body contains expected model identifier |
| Toggle feature flag | No errors | Feature behavior observably active |
| Change environment | Deployment succeeds | Logs/variables reference the new environment |
| Set credentials | Authentication succeeds | Authenticated identity is the correct one |

### Configuration Verification Sequence

```
BEFORE asserting a configuration change works:

1. IDENTIFY: What should be DIFFERENT after this change?
2. LOCATE: Where is that difference observable?
3. EXECUTE: Command that exposes the observable difference
4. CONFIRM: Output contains the expected difference
5. ONLY THEN: Assert the configuration change works

Warning signs:
  - "Request succeeded" without inspecting content
  - Checking status code but ignoring response body
  - Confirming no errors but lacking positive confirmation
```

## Verifying UI Work

When asserting UI work is complete:

| Assertion | Demands | Insufficient |
|-----------|---------|--------------|
| Component matches design | Visual comparison against UX reference | "It looks right to me" |
| Responsive design works | Tested at mobile, tablet, desktop breakpoints | Desktop-only check |
| Accessibility passes | Screen reader test + keyboard navigation + contrast check | "I added aria labels" |
| Design tokens applied | Spacing/colors/typography match token values | "I used the right classes" |

## Why This Matters

From accumulated failure patterns:
- your human partner said "I don't believe you" — trust shattered
- Undefined functions shipped — immediate crash
- Missing requirements shipped — incomplete features
- Time wasted on false completion -> redirect -> rework
- Violates: "Honesty is a core value. If you lie, you'll be replaced."

## When to Apply

**ALWAYS before:**
- ANY variation of success or completion claims
- ANY expression of satisfaction
- ANY positive statement about work state
- Committing, PR creation, task completion
- Transitioning to the next task
- Delegating to agents

**Rule applies to:**
- Exact phrases
- Paraphrases and synonyms
- Implications of success
- ANY communication suggesting completion or correctness

## The Bottom Line

**There are no shortcuts for verification.**

Execute the command. Read the output. THEN state the result.

This is non-negotiable.
