---
name: inline-execution
description: "Use when a written implementation plan is to be executed by the current agent itself rather than by subagents: the user chose the cheaper mode, the harness cannot dispatch subagents, or the plan is short and fully specified."
---

# Inline Execution

Execute the plan yourself, task by task, in this context. There is no implementer or reviewer per task; there is one fresh review of the whole branch at the end. This is the cheapest execution mode: one context plus one reviewer.

**Core principle: the plan already did the thinking, so execute it exactly, prove every step with a test you watched fail and pass, and leave a ledger that survives your own forgetting.** Inline mode gives up a fresh context and a second pair of eyes per task. It buys them back by other means: the brief is the spec, the ledger is the memory, test-first is the per-task gate, and the final reviewer is the second pair of eyes.

## The Prime Directive

```
NO TASK IS DONE WITHOUT A TEST RUN YOU READ AND A LEDGER LINE THAT RECORDS IT
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- A plan from `godmode:task-planning` exists and the user chose inline execution.
- Or the harness has no way to dispatch subagents. Never pretend to dispatch one; run the plan here.
- Or the plan is short and fully specified (it contains the code to write), so execution is transcription plus testing.

**Skip:**
- The user wants a review gate on every task: use `godmode:delegated-execution`.
- The plan is long enough that its last tasks would run on a heavily compacted context: prefer `godmode:delegated-execution`. Inline still works over a long plan because the ledger makes it recoverable, but the last tasks get the least of you.
- Several independent problems with no shared plan: use `godmode:parallel-execution`.

**Cost note for the user.** A fully specified plan runs well on a mid-tier session model. The one seat that earns the top tier is the final review, which this skill dispatches separately (see `godmode:model-routing`). Say so when the user picks this mode.

## Operating Rules

**Run continuously.** Do not stop between tasks to ask "should I continue?". The user chose this mode to spend less, not to answer prompts.

**Optional checkpoints.** If the user asked for them ("check in every 3 tasks"), stop after every N completed tasks with a five-line status: tasks done, rulings made, deferred minors, next task, anything that needs their eyes. Record `Checkpoint: after Task <N>` in the ledger. Without that request, there are no checkpoints.

**Rulings, not stalls.** Conflicts, ambiguities and plan defects are yours to decide. The spec is the binding authority, the plan is its argument. Record each decision as `Ruling: <what> / <why> / <cost if wrong>` and continue. Deviating from the plan without a ledgered ruling is a decision made in secret.

**Four things stop you:** an irreversible or destructive action; a security-sensitive action; an outward side effect norms say you ask about first (merge, push to a shared branch, publish); a plan so broken that every path forward is a guess.

**Keep your context lean.** Every tool output stays resident and is re-read on every later turn. Redirect long test output to a file in the plan workspace and read its tail. Read one brief, never the whole plan again.

## The Protocol

1. **Isolate.** Invoke `godmode:workspace-isolation`. Never implement on the trunk branch without the user's explicit consent.

2. **Open the plan workspace and ledger.** Same directory and format as `godmode:delegated-execution`: `.godmode/runs/<plan-slug>/progress.md`, with the commands and line formats in that skill's `references/ledger-and-workspace.md`. Write `Mode: inline` on the second line. If a ledger for this plan exists, resume at the first task without a `complete` line; tasks marked complete are never redone, because their commits exist even when your memory of them does not.

3. **Read the plan once, and the spec it names.** Note the global constraints. Create one task-tracker item per plan task.

4. **Load `godmode:test-first` now,** before Task 1. It governs every step below; a plan whose steps already say "write the failing test" does not exempt you from it.

5. **Pre-flight scan.** For every task that consumes what an earlier task produces, write one ledger row: the two tasks, what is produced against what is consumed, what you found. If no tasks share anything, write `Pre-flight: no shared interfaces`. Rule on every conflict before Task 1.

6. **Run the task loop** below for each task in order.

7. **Final review** (section below), then **finish**: report rulings and deferred minors, then invoke `godmode:merge-protocol`.

## The Task Loop

**a. Take the task.** Record `BASE` with `git rev-parse HEAD`. Extract the task's brief to `task-<N>-brief.md` and read it, even for a task you remember from setup: memory is a summary, the brief has the exact values. Mark the tracker item in progress.

**b. Work the steps in order.** The plan's steps are already in red-green order. Write the test, run it, and watch it fail for the reason the plan expects. A test that passes before the implementation exists is a finding about the test. Every step that runs a command has an expected result; compare the real output against it. Three outcomes:
- **Matches:** next step.
- **The code is wrong:** invoke `godmode:fault-diagnosis`. Find the cause; never patch the symptom so the output matches.
- **The plan is wrong** (a step contradicts the spec, an interface from an earlier task does not match, a command that cannot work): rule on the smallest change that satisfies the spec, ledger it as `Task <N>: Ruling: ...`, and continue. Later tasks read the ruling from the ledger.

**c. Commit** as the plan's commit steps say. Several commits per task are fine; the review range is cut from `BASE`, never `HEAD~1`.

**d. Completion contract.** All of these are true, with evidence from this session:
- Every test the brief names exists, ran in this task, and you read its output.
- The final test run for the task passed, and you ran it after the last edit.
- Every expected result in the brief was compared with real output.
- Every deviation from the brief has a `Ruling:` line.
Anything missing means the task is not done. `godmode:completion-gate` governs the claim.

**e. Record it.** In the same step as the last commit, append:
`Task <N>: complete (commits <base>..<head>, tests: <command> -> <result>)` and a `Cost:` line (test runs, fix attempts). Mark the tracker item done and take the next task.

## Final Review

Build a review package from `git merge-base <trunk> HEAD` to `HEAD` (commands in the shared reference).

**With subagents available:** dispatch one fresh reviewer on a top-tier model, naming model and effort, using `godmode:delegated-execution`'s reviewer prompt in whole-branch mode. Give it the package path, the plan and spec paths, the plan's review focus section if it has one, and a pointer to the ledger's `Ruling:` lines. This is the one fresh context the run buys. Do not skip it and do not substitute your own read of the diff.

**Without subagents:** perform that review yourself as a separate pass after the last task's ledger line, using the same prompt as a checklist. Ledger `Final: self-review (no subagents available)` and say so in the final message: the author reviewing their own work is weaker, and the user decides whether that is enough before merging. Offer `godmode:cross-model-review` as the stronger option.

**Act on the findings.** Re-grade each one by effect: what a reasonable user of this software gets if it ships, not whether the spec happened to name the triggering input. Then:
- **Critical and Important:** fix them yourself in ONE pass. Each fix starts with a test that reproduces the finding; watch it fail, make it pass, then run the whole suite. Ledger `Final: fixed <finding> / <test> red to green / suite <n>/<n>`. No re-review: the failing-then-passing test answers "addressed" and the green suite answers "broke nothing".
- **Minor:** ledger as `Final: minor (deferred): ...`. Minors never enter the fix pass.
- **A finding you will not fix** is a ruling with a cost, and it reaches the user.
There is no second fix pass.

## Finish

Your final message carries every `Ruling:` line in the order made, each with its cost if wrong, under "Rulings I made", and every deferred minor under "Deferred minors". Both lists are exhaustive. Then invoke `godmode:merge-protocol`. Delete the plan workspace only after the work lands or the user keeps the branch.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "I remember what Task N says" | You remember a summary. The brief has the exact values. Read it. |
| "The plan's code is right, skip watching the test fail" | A test you never saw fail proves nothing. It is one command. Run it. |
| "I'll write the ledger lines after a few tasks" | Compaction does not wait for a convenient moment. One line per task, with the commit. |
| "The plan is wrong here, I'll quietly do the right thing" | Do the right thing and ledger the ruling. |
| "I read my own diff carefully; the final reviewer is redundant" | Same author, same blind spots. The reviewer is the only fresh context this run buys. |
| "The fix is obvious, no failing test needed" | The failing test is the only proof the finding was real and is now gone. |
| "I'll fix the minors while I'm in there" | Each is a test, a fix and a suite run nobody asked for. Ledger them; the user decides. |
| "Let me check in before the next task" | Only if the user asked for checkpoints. Otherwise only the four stops stop you. |

## Guardrails

**Never:**
- Implement on the trunk branch without explicit consent.
- Redo a task the ledger marks complete.
- Mark a task done on a test run older than the last edit.
- Skip the final review, or replace a fresh reviewer with self-review when subagents are available.
- Run a second fix pass after the final review.

**Always:**
- Read the brief at the start of every task.
- Ledger every completion, ruling, deferred minor and checkpoint as it happens.
- Name model and effort when dispatching the final reviewer.
- Tell the user when the final review was a self-review.

## Connections

- `godmode:task-planning`: produces the plan.
- `godmode:workspace-isolation`: worktree and clean baseline before Task 1.
- `godmode:test-first`: the gate inside every task.
- `godmode:fault-diagnosis`: when a step's output shows the code is wrong.
- `godmode:completion-gate`: the evidence rule behind every "done".
- `godmode:delegated-execution`: the per-task-review mode; shares this workspace and ledger, so a run can switch modes mid-plan.
- `godmode:model-routing`: the tier for the final reviewer.
- `godmode:cross-model-review`: a second model family before landing, strongly advised after a self-review.
- `godmode:merge-protocol`: the hand-off at the end.
