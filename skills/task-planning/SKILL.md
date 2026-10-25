---
name: task-planning
description: "Use when an approved design, specification or clear requirement exists for work that touches more than one file or behaviour, before any implementation code is written"
---

# Task Planning

Write the implementation plan for a builder who has never seen this codebase or the conversation. They write good code once they know the exact interface and the exact test; what they cannot know is what was decided. **Put every decision in the plan: which files, which names and signatures, which values, which test proves each task, and which command shows it passed.**

## The Prime Directive

```
NO IMPLEMENTATION WITHOUT A SAVED PLAN OF ATOMIC, VERIFIABLE TASKS
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- A design was approved in `godmode:intent-discovery`.
- A multi-file feature, refactor or migration.
- A bug fix that spans components, once `godmode:fault-diagnosis` has found the root cause.
- Any work another agent will execute.

**Skip:**
- One-file changes with obvious scope (a typo, a config value, one added test).
- Documentation-only edits.
- Work sized "quick, clear task" in intent discovery.

## Entry Check

Confirm before writing. If any item fails, go back to `godmode:intent-discovery` or ask the user one question.

1. The design is approved, and you have its path.
2. You can list every component that will change.
3. "Done" is defined by acceptance criteria, not impressions.
4. The stack is known, and every version and interface the plan relies on was verified with `godmode:grounding`.
5. You know how each piece will be tested.

## The Protocol

1. **Scope check.** If the design covers independent subsystems, write one plan per subsystem; each plan must produce working, testable software on its own.
2. **Map the files.** List every file to create, modify or delete and the one responsibility of each. Follow the codebase's existing layout (`godmode:codebase-conventions`). Prefer small focused files; files that change together live together.
3. **Cut the tasks.** A task is the smallest unit with its own test cycle that a reviewer could reject while approving its neighbour. Fold setup and config into the task that needs them. Each task ends with something testable.
4. **Write the steps.** Each step is one action of 2-5 minutes with a checkable result: write the failing test; run it and see it fail; write the minimal code; run it and see it pass; commit.
5. **Write what decides, not what transcribes.** A plan is the set of decisions the builder cannot make alone. A test step carries the test as code, with the design's exact values in its assertions. A code step carries the exact signature (name, parameters, return type), the file it lives in and the values the design pins; the builder writes the body. A body appears only for an algorithm the signature and tests do not determine, or for exact copy the design fixes. Every command states its expected output. Every path is exact, with line ranges for modifications. A plan several times longer than the design it implements has written the program, not planned it.
6. **Self-review the plan** against the checklist below and fix the gaps.
7. **Save** to `docs/plans/YYYY-MM-DD-<feature>.md` and commit it (the user's preferred location overrides this).
8. **Hand off** with a recommended execution mode (see Handoff).

## Plan Header

Every plan opens with:

```markdown
# <Feature> Implementation Plan

> For the executing agent: use godmode:inline-execution or godmode:delegated-execution
> to run this plan task by task. Steps use checkboxes for tracking.

**Goal:** <one sentence>
**Design:** docs/plans/YYYY-MM-DD-<topic>-design.md
**Architecture:** <two or three sentences>
**Stack:** <languages, frameworks, key libraries with versions>

## Global Constraints
<Project-wide requirements copied verbatim from the design: version floors, dependency limits,
naming rules, platform requirements. Every task implicitly includes this section.>

## Review Focus
<The five input classes or failure modes the design implies but no task's tests exercise that
are most likely to bite a user: one line each, naming the input and the behaviour a reasonable
person expects, most likely first. The design's silence on an input is not permission for it to
break the program. Each line's test is then pinned to the task that owns the code.>

## Sources
<Each external fact the plan relies on: URL and date checked.>

## File Map
| File | Action | Responsibility |
```

## Task Template

````markdown
### Task N: <component>

**Files:**
- Create: `src/exact/path/file.ts`
- Modify: `src/exact/path/existing.ts:40-62`
- Test: `tests/exact/path/file.test.ts`

**Covers:** acceptance criteria 2 and 3 from the design.

**Interfaces:**
- Consumes: `loadConfig(): Config` from Task 1 (`src/config.ts`)
- Produces: `parseDuration(s: string): number` in `src/duration.ts`; Task 4 calls it

- [ ] **Step 1: Write the failing test**

```ts
import { parseDuration } from '../src/duration';
test('parses minutes', () => {
  expect(parseDuration('5m')).toBe(300);
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run tests/duration.test.ts`
Expected: FAIL, "parseDuration is not a function"

- [ ] **Step 3: Implement `parseDuration(s: string): number` in `src/duration.ts`**

Accept `<digits>m` only and return minutes times 60; throw `Error("bad duration: <input>")` on anything else. The builder writes the body.

- [ ] **Step 4: Run it and confirm it passes**

Run: `npx vitest run tests/duration.test.ts`
Expected: PASS, 1 test

- [ ] **Step 5: Commit**

```bash
git add src/duration.ts tests/duration.test.ts
git commit -m "feat: parse minute durations"
```
````

## Self-Review Checklist

- Every path is exact; every modification has a line range or an anchor.
- Every step lets the builder write exactly one reasonable thing. A line that decides nothing ("add validation here", "similar to Task 2") is a gap; a body the signature and the test already determine is a transcript. Fix both.
- Every run step has the exact command and the expected output, including the failing run.
- Every acceptance criterion in the design maps to at least one task.
- Names and signatures are consistent across tasks, and every name a task consumes appears, with the same signature, in an earlier task's Produces line.
- Review Focus holds the five uncovered input classes most likely to bite a user, each with its test pinned to the owning task; an empty section means you checked and found none.
- The plan is not several times longer than the design; where it is, bodies become signatures, test names and assertions.
- Each task ends with a commit and a message.
- No task needs knowledge that exists only in the conversation.
- Tasks of the same shape (five similar endpoints, ten similar migrations) are marked as a batch so the executor can group them.

## Handoff

After saving, recommend one execution mode and let the user choose:

| Mode | Recommend when |
|---|---|
| `godmode:inline-execution` | few tasks, small and sequential, context will hold; the cheapest mode |
| `godmode:delegated-execution` | many tasks, or tasks large enough to flood one context; a fresh subagent per task with reviews between |
| `godmode:parallel-execution` | groups of tasks touch disjoint files and need no coordination |

Say it like: "Plan saved to `docs/plans/<file>.md`: N tasks. I recommend inline execution because the tasks are small and sequential. Delegated execution is the alternative if you want a review between every task."

If the work should happen on a branch or worktree, invoke `godmode:workspace-isolation` before execution starts.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It's too simple for a plan" | If it touches more than one file, the plan takes minutes and saves the rework. |
| "The design is the plan" | The design says what. The plan says which file, which code, which command. |
| "I'll write out every function body" | A plan longer than the code it describes has written the program without its tests. Give the signature, the test and the pinned values; the builder writes the body. |
| "The builder will know what I mean by handle errors" | A line that decides nothing is a gap. Name the input and the behaviour expected. |
| "Expected output is obvious" | The failing run's message is what proves the test tests the right thing. Write it. |
| "I'll figure it out while building" | That is improvising with no checkpoint. Edge cases get skipped. |
| "One big task is easier to review" | Reviewers cannot reject half of a task. Cut it smaller. |
| "The version I remember is fine" | Plans spread a wrong version to every task. Ground it first. |

## Guardrails

**Never:**
- Write a step like "implement the feature", "handle errors" or "add tests".
- Paste a function body the signature and the test already determine.
- Omit a command's expected output.
- Leave a path vague ("the config file", "the utils folder").
- Start implementing before the plan is saved.
- Put a fact that can change in the plan without its source.

**Always:**
- Open with the header, global constraints and sources.
- Follow test-first order inside each task (`godmode:test-first`).
- Give a task an Interfaces block whenever another task consumes or produces its names.
- End every task with a commit.
- Recommend an execution mode at handoff.

## Connections

- `godmode:intent-discovery`: produces the approved design this skill plans from.
- `godmode:grounding`: verifies every interface and version before it enters the plan.
- `godmode:codebase-conventions`: sets file layout and naming for the file map.
- `godmode:test-first`: the cycle every task follows.
- `godmode:workspace-isolation`: sets up the branch or worktree before execution.
- `godmode:inline-execution`: runs the plan in one context.
- `godmode:delegated-execution`: runs the plan with a subagent per task.
- `godmode:parallel-execution`: runs independent task groups at once.
