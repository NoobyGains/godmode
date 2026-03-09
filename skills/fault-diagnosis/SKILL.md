---
name: fault-diagnosis
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Fault Diagnosis

## Overview

Guessing at fixes wastes time and introduces new defects. Quick patches mask underlying problems.

**Core principle:** ALWAYS identify root cause before attempting any fix. Treating symptoms is failure.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you have not completed Phase 1, you are not authorized to propose fixes.

## When to Use

Apply to ANY technical issue:
- Test failures
- Production bugs
- Unexpected behavior
- Performance degradation
- Build failures
- Integration breakdowns

**Especially important when:**
- Under time pressure (urgency makes guessing tempting)
- "Just one quick fix" seems obvious
- You have already attempted multiple fixes
- A previous fix did not resolve the issue
- You do not fully understand the problem

**Do not skip when:**
- The issue appears simple (simple bugs have root causes too)
- You are in a hurry (systematic investigation is faster than flailing)
- Someone wants it resolved NOW (methodical work is faster than thrashing)

## The Four Phases

You MUST complete each phase before advancing to the next.

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Thoroughly**
   - Do not skip past errors or warnings
   - They frequently contain the exact answer
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Reliably**
   - Can you trigger it consistently?
   - What are the exact reproduction steps?
   - Does it happen every time?
   - If not reproducible, gather more data -- do not guess

3. **Examine Recent Changes**
   - What changed that could cause this?
   - Git diff, recent commits
   - New dependencies, configuration changes
   - Environmental differences

4. **Gather Evidence in Multi-Component Systems**

   **WHEN the system has multiple components (CI -> build -> signing, API -> service -> database):**

   **BEFORE proposing fixes, add diagnostic instrumentation:**
   ```
   For EACH component boundary:
     - Log what data enters the component
     - Log what data exits the component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to collect evidence showing WHERE it breaks
   THEN analyze evidence to identify the failing component
   THEN investigate that specific component
   ```

   **Example (multi-layer system):**
   ```bash
   # Layer 1: Orchestrator
   echo "=== Orchestrator state: ==="
   echo "TOKEN: ${TOKEN:+SET}${TOKEN:-UNSET}"

   # Layer 2: Build script
   echo "=== Build environment: ==="
   env | grep TOKEN || echo "TOKEN not in environment"

   # Layer 3: Signing module
   echo "=== Certificate state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual operation
   codesign --sign "$IDENTITY" --verbose=4 "$ARTIFACT"
   ```

   **This reveals:** Which layer fails (secrets -> orchestrator OK, orchestrator -> build FAIL)

5. **Trace Data Flow**

   **WHEN the error is deep in the call stack:**

   See `root-cause-tracing.md` in this directory for the complete backward tracing method.

   **Short version:**
   - Where does the bad value originate?
   - What called this function with the bad value?
   - Keep tracing upward until you find the source
   - Fix at the source, not at the symptom

### Phase 2: Pattern Analysis

**Find the pattern before fixing:**

1. **Locate Working Examples**
   - Find similar working code in the same codebase
   - What works that resembles what is broken?

2. **Compare Against References**
   - If implementing a pattern, read the reference implementation COMPLETELY
   - Do not skim -- read every line
   - Understand the pattern fully before applying

3. **Identify Differences**
   - What differs between working and broken?
   - List every difference, no matter how small
   - Do not assume "that cannot matter"

4. **Understand Dependencies**
   - What other components does this require?
   - What settings, configuration, environment?
   - What assumptions does it make?

### Phase 3: Hypothesis and Testing

**Scientific method:**

1. **Form a Single Hypothesis**
   - State clearly: "I believe X is the root cause because Y"
   - Write it down
   - Be specific, not vague

2. **Test Minimally**
   - Make the SMALLEST possible change to test the hypothesis
   - One variable at a time
   - Do not fix multiple things simultaneously

3. **Verify Before Continuing**
   - Did it work? Yes -> Phase 4
   - Did not work? Form a NEW hypothesis
   - DO NOT pile additional fixes on top

4. **When You Do Not Know**
   - Say "I do not understand X"
   - Do not pretend to know
   - Ask for help
   - Research further

### Phase 4: Implementation

**Fix the root cause, not the symptom:**

1. **Create a Failing Test Case**
   - Simplest possible reproduction
   - Automated test if possible
   - One-off test script if no framework available
   - MUST exist before fixing
   - Use the `godmode:test-first` skill for writing proper failing tests

2. **Implement a Single Fix**
   - Address the root cause identified
   - ONE change at a time
   - No "while I'm here" improvements
   - No bundled refactoring

3. **Verify the Fix**
   - Test passes now?
   - No other tests broken?
   - Issue actually resolved?

4. **If the Fix Does Not Work**
   - STOP
   - Count: How many fixes have you attempted?
   - If < 3: Return to Phase 1, re-analyze with new information
   - **If >= 3: STOP and question the architecture (step 5 below)**
   - DO NOT attempt fix #4 without architectural discussion

5. **If 3+ Fixes Failed: Question Architecture**

   **Pattern indicating an architectural problem:**
   - Each fix reveals new shared state/coupling/problems in different locations
   - Fixes require "massive refactoring" to implement
   - Each fix creates new symptoms elsewhere

   **STOP and question fundamentals:**
   - Is this pattern fundamentally sound?
   - Are we persisting through sheer inertia?
   - Should we refactor the architecture vs. continue fixing symptoms?

   **Discuss with your human partner before attempting more fixes**

   This is NOT a failed hypothesis -- this is a flawed architecture.

## Guardrails - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see what happens"
- "Apply multiple changes, run tests"
- "Skip the test, I'll verify manually"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- **"One more fix attempt" (when already tried 2+)**
- **Each fix reveals new problems in different places**

**ALL of these mean: STOP. Return to Phase 1.**

**If 3+ fixes failed:** Question the architecture (see Phase 4, step 5)

## Human Partner Signals You Are Off Track

**Watch for these redirections:**
- "Is that not happening?" - You assumed without verifying
- "Will it show us...?" - You should have added evidence gathering
- "Stop guessing" - You are proposing fixes without understanding
- "Think deeper" - Question fundamentals, not just symptoms
- "We're stuck?" (frustrated) - Your approach is not working

**When you see these:** STOP. Return to Phase 1.

## Cognitive Traps

| Rationalization | What Is Actually True |
|----------------|----------------------|
| "Issue is simple, process not needed" | Simple issues have root causes too. The process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic diagnosis is FASTER than guess-and-check flailing. |
| "Just try this first, then investigate" | The first fix sets the pattern. Do it right from the start. |
| "I'll write the test after confirming the fix works" | Untested fixes do not hold. Test first proves it. |
| "Multiple fixes at once saves time" | Cannot isolate what worked. Creates new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms is not the same as understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question the pattern, do not fix again. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or new hypothesis |
| **4. Implementation** | Create test, fix, verify | Bug resolved, tests pass |

## When Investigation Reveals No Root Cause

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:

1. You have completed the process
2. Document what you investigated
3. Implement appropriate handling (retry, timeout, error message)
4. Add monitoring/logging for future investigation

**But:** 95% of "no root cause" cases are incomplete investigation.

## Supporting Methods

These methods are part of fault diagnosis and available in this directory:

- **`root-cause-tracing.md`** - Trace bugs backward through the call stack to find the original trigger
- **`defense-in-depth.md`** - Add validation at multiple layers after finding root cause
- **`condition-based-waiting.md`** - Replace arbitrary timeouts with condition polling

**Related skills:**
- **godmode:test-first** - For creating failing test case (Phase 4, Step 1)
- **godmode:completion-gate** - Verify fix worked before declaring success

## Real-World Impact

From diagnosis sessions:
- Systematic approach: 15-30 minutes to resolution
- Random fix approach: 2-3 hours of flailing
- First-attempt fix rate: 95% vs 40%
- New bugs introduced: Near zero vs common
