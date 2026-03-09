---
name: quality-gate
description: Use when finishing tasks, shipping significant features, or before landing changes to ensure work meets standards through automated review
---

# Quality Gate

Dispatch the code-reviewer agent (`agents/code-reviewer.md`) to surface defects before they propagate.

**Core principle:** Inspect early, inspect often.

## Prime Directive

> **NO LANDING WITHOUT REVIEW**

No exceptions. No workarounds. No shortcuts.

## The Entry Protocol

Before initiating a review, confirm:

1. The test suite passes on the current branch
2. All changes are committed (no dirty working tree)
3. You have determined BASE_SHA and HEAD_SHA
4. You can articulate what was built and why
5. You know the plan or specification to review against
6. You have scoped the review correctly (single task vs. batch)

If any condition is unmet, resolve it before requesting review.

## When to Initiate

**Required:**
- After each task in delegated-execution workflows
- After completing a significant feature
- Before landing on the trunk branch

**Discretionary but recommended:**
- When stuck (an outside perspective often unblocks)
- Before starting a large refactor (establish a baseline)
- After resolving a tricky defect

## How to Initiate

**1. Capture the commit range:**
```bash
BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main
HEAD_SHA=$(git rev-parse HEAD)
```

**2. Launch a code-reviewer subagent:**

Dispatch the code-reviewer agent (`agents/code-reviewer.md`) using the Agent tool. Fill in the template at `code-reviewer.md`.

**Template placeholders:**
- `{WHAT_WAS_IMPLEMENTED}` — What was just built
- `{PLAN_OR_REQUIREMENTS}` — What it should satisfy
- `{BASE_SHA}` — Starting commit
- `{HEAD_SHA}` — Ending commit
- `{DESCRIPTION}` — Brief narrative

**3. Respond to findings:**
- Resolve Critical findings immediately
- Resolve Important findings before advancing
- Log Minor findings for a future pass
- Object with evidence if the reviewer is mistaken

## Walkthrough

```
[Just completed Task 3: Add data validation layer]

You: Initiating quality gate before proceeding.

BASE_SHA=$(git log --oneline | grep "Task 2" | head -1 | awk '{print $1}')
HEAD_SHA=$(git rev-parse HEAD)

[Launch code-reviewer agent (agents/code-reviewer.md)]
  WHAT_WAS_IMPLEMENTED: Input validation and sanitization for all API endpoints
  PLAN_OR_REQUIREMENTS: Task 3 from docs/plans/api-hardening-plan.md
  BASE_SHA: c4e19a7
  HEAD_SHA: 8b2f305
  DESCRIPTION: Added validateRequest() and sanitizeInput() with 5 rule types

[Subagent returns]:
  Strengths: Comprehensive rule coverage, solid test assertions
  Issues:
    Important: Missing rate-limit header on validation error responses
    Minor: Hardcoded threshold (50) for payload size check
  Assessment: Ready to proceed after addressing Important item

You: [Fix rate-limit header]
[Continue to Task 4]
```

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "It's a tiny change — no review needed" | Small diffs cause large outages. Review everything. |
| "I tested it exhaustively" | Testing and review catch fundamentally different classes of issues. |
| "Review will slow momentum" | Fixing production incidents slows momentum far more. |
| "The reviewer won't follow this code" | If a reviewer cannot follow it, neither will the next engineer. |
| "I'll batch review on the next PR" | Quality debt compounds. Review now or pay compounded interest later. |

## Integration

**godmode:delegated-execution:**
- Review after EACH delegated task
- Surface defects before they cascade
- Resolve before starting the next task

**godmode:task-runner:**
- Review after each batch of tasks
- Collect feedback, apply corrections, continue

**Ad-Hoc Development:**
- Review before landing
- Review when blocked

## Guardrails

**Prohibited:**
- Skipping review because "it's straightforward"
- Ignoring Critical findings
- Advancing with unresolved Important findings
- Dismissing valid technical feedback without evidence
- Landing changes with open Critical or Important items

**Mandatory:**
- Review after every task in delegated-execution
- Include BASE_SHA and HEAD_SHA in every review request
- Respond to Critical findings immediately
- Object with code or test evidence when disputing feedback
- Request clarification when feedback is vague

## Process Diagram

```
START: Work finished
  |
  +-- Suite green? --NO--> Fix tests first
  |        |
  |       YES
  |        |
  +-- Changes committed? --NO--> Commit changes
  |        |
  |       YES
  |        |
  +-- Determine BASE_SHA and HEAD_SHA
  |        |
  +-- Launch code-reviewer agent (agents/code-reviewer.md)
  |        |
  +-- Wait for results
  |        |
  +-- Critical items? --YES--> Fix now, re-review
  |        |
  |       NO
  |        |
  +-- Important items? --YES--> Fix before advancing
  |        |
  |       NO
  |        |
  +-- Log Minor items for later
  |        |
  +-- ADVANCE to next task
```

See reviewer template at: quality-gate/code-reviewer.md
