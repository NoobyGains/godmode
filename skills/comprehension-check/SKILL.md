---
name: comprehension-check
description: Use when implementing any substantial feature, multi-file modification, or architectural change - produces a plain-language walkthrough of every alteration so the developer can verify genuine understanding before committing, preventing the accumulation of cognitive debt where code ships faster than comprehension
---

# Comprehension Check

## Overview

AI produces code at a pace that outstrips human absorption. Shipping changes you cannot fully explain creates cognitive debt -- the inability to troubleshoot, extend, or reason about what was built.

**Core principle:** Comprehension precedes commitment. If you cannot articulate every modification in ordinary language, you have not earned the right to commit it.

## The Prime Directive

```
NO COMMIT UNTIL EVERY CHANGE IS UNDERSTOOD
```

Before any AI-generated or AI-assisted code reaches version control, the developer must grasp what each change accomplishes and why it was implemented that way.

## When to Use

**Triggered after:**
- Any modification touching 3 or more files
- Non-trivial algorithm or data-structure implementations
- Structural shifts (new modules, altered data flow, dependency rewiring)
- Security-adjacent code (authentication, encryption, input sanitization)
- Autonomous agent decisions (changes you did not explicitly dictate)

**Skippable for:**
- Single-character or typo corrections
- Changes the developer dictated verbatim, line by line
- Pure boilerplate generation (scaffolding configs, lockfiles)

## The Process

### Phase 1: Produce a Change Walkthrough

After implementation completes, before any commit occurs:

```
For EVERY modified file, articulate:

1. WHAT: What is different now? (Describe the meaning, not the diff)
2. WHY: What motivated this particular change?
3. CONTEXT: How does this change interact with the broader modification set?
4. HAZARD: What failure modes does this change introduce?
```

### Phase 2: Deliver the Walkthrough

Structure the output as follows:

```markdown
## Modification Walkthrough

### [path/to/first-file]
**What:** Introduced sliding-window rate limiting that counts requests per IP address.
**Why:** The login endpoint was exposed to brute-force enumeration.
**Context:** Middleware executes ahead of authentication routes; relies on Redis for distributed state.
**Hazard:** If Redis becomes unreachable, the limiter fails open (permits all traffic). Worth discussing: should it fail closed instead?

### [path/to/second-file]
**What:** Login handler now returns HTTP 429 when the rate limiter activates.
**Why:** The middleware flags rate-limited requests via `req.rateLimited`.
**Context:** Early exit occurs before password verification, which also blocks timing-based attacks.
**Hazard:** Negligible -- a simple conditional guard.

## Structural Consequences
- New runtime dependency: Redis (stores rate-limit counters)
- New middleware layer inserted between routing and handler execution
- Login request lifecycle now: rate-check -> authenticate -> respond

## Open Questions
1. Should the rate limiter deny all traffic when Redis is unavailable, or allow it?
2. Should rate limiting extend beyond authentication endpoints?
```

### Phase 3: Obtain Explicit Confirmation

**Ask directly:** "Do you fully understand these changes and want to proceed with the commit?"

When the developer raises questions:
- Resolve them thoroughly
- Do not gloss over confusion
- Lingering confusion equals accruing cognitive debt

### Phase 4: Surface Unsolicited Changes

Whenever a change was not part of the original request:

```
HEADS UP: I additionally [modified X] because [rationale].
This was NOT part of your original instruction. Keep it or revert?
```

AI agents frequently make "helpful" supplementary changes. Every one must be disclosed.

## Indicators of Genuine Comprehension

The developer should be able to:
- [ ] Describe what each altered file does differently now
- [ ] Justify why each alteration was necessary
- [ ] Predict what would break if a specific change were rolled back
- [ ] Enumerate any new dependencies or patterns that were introduced
- [ ] Identify where to investigate if a bug surfaces in this code later

## Cognitive Traps

| Rationalization | Truth |
|---|---|
| "The test suite passes, so I trust it" | Tests validate behavior, not understanding. You will debug this blind later. |
| "I will review it when things calm down" | You will not. The context window closes the moment you move on. |
| "It is mostly boilerplate" | A single incorrect line in boilerplate can open a security hole. |
| "I grasp the overall concept" | High-level intuition collapses at debugging time. Specific comprehension is required. |
| "Deep review reduces my velocity" | Deploying code you cannot explain reduces velocity far more when it fails. |
| "The AI is competent" | AI generates plausible output. Plausible and correct are not the same thing. |

## Guardrails

**Prohibited actions:**
- Committing AI-produced code without reading the walkthrough
- Suppressing unsolicited-change disclosures
- Rushing past developer confusion or uncertainty
- Equating green tests with genuine comprehension

**Required actions:**
- Generate walkthroughs for all multi-file modifications
- Disclose every change that exceeded the original request
- Collect explicit confirmation before committing
- Fully resolve every developer question

## Integration

**Invoked after:**
- **godmode:delegated-execution** -- Review output from delegated agent implementations
- **godmode:test-first** -- After code is written and tests pass
- **godmode:parallel-execution** -- After merging results from parallel agent work

**Invoked before:**
- **godmode:completion-gate** -- First understand, then verify
- **godmode:merge-protocol** -- Understand before merging into the target branch
