# Reviewer prompt

Used by `godmode:delegated-execution` for the review of each task (task mode) and for the final review of the whole branch (whole-branch mode). Always a fresh subagent: never the implementer, never a reviewer that has seen this code before.

Dispatch settings:
- **Model and effort:** REQUIRED, per `godmode:model-routing`. Task mode: a mid tier floor, scaled up for subtle or risky diffs. Whole-branch mode: the top tier.
- **Access:** read-only on the checkout.

```
You are reviewing [Task N: name | the whole branch for plan PLAN_FILE]. Give two
verdicts in this order: first whether the change matches its requirements, then
whether it is well built. [Task mode: This is a task-scoped gate; a broad review
of the whole branch happens separately at the end.]

## What was requested

Read: [BRIEF_FILE | PLAN_FILE and SPEC_FILE]

Binding constraints from the plan or spec, verbatim:
[GLOBAL_CONSTRAINTS]

## What the implementer claims

Read: [REPORT_FILE | the ledger at LEDGER_FILE: its Ruling, parked and
"minor (deferred)" lines]

## The change

Base: [BASE_SHA]   Head: [HEAD_SHA]
Review package: [DIFF_FILE]

Read the package once. It holds the commit list, a stat summary and the full diff
with ten lines of context. Do not re-derive it with git. Open a changed file
separately only when a hunk you must judge is cut off; say so if you do. If the
package is missing, run `git diff --stat BASE..HEAD` and `git diff BASE..HEAD`.

Look outside the diff only to check a concrete risk you can name (a changed
function contract, lock order, shared state): one focused check per named risk,
and report both the risk and what you checked.

Do not modify the working tree, the index, HEAD or any branch.

## You do not dispatch subagents

Do this review yourself. If the diff is large, review it in passes and say so.

## Do not trust the report

The report is a set of claims. Verify each against the diff. Rationales such as
"kept simple on purpose" are the implementer grading their own work; they never
lower a finding's severity.

## Tests

The implementer ran the tests and recorded the output in the report. Do not
re-run the suite to confirm it. Run one focused test only when the code raises a
specific doubt no recorded run answers. Warnings or noise in the recorded output
are findings. If the evidence looks truncated, re-read the file; if it is truly
missing, report that as a gap.

## Part 1: Spec compliance

- Missing: requirements skipped, or claimed but not implemented.
- Extra: features nobody asked for, over-engineering.
- Misunderstood: the right feature built the wrong way, or the wrong problem solved.
For a batched brief, check every listed file has its hunk; a listed file the diff
never touches is a Missing finding.
A requirement you cannot verify from this diff alone (it lives in unchanged code
or spans tasks) is a "Cannot verify" item, not a reason to crawl the codebase.

## Part 2: Quality

- Correctness: error paths, edge cases, races, resource cleanup.
- Tests: real behaviour asserted? The task's edge cases covered?
- Structure: one responsibility per file, clear interfaces, follows the plan's
  file layout and the codebase's conventions.
- Size: did this change create large files or grow existing ones sharply?
[Whole-branch mode: also check that the tasks fit together: names, interfaces
and error handling consistent across the branch; triage each deferred minor as
"fix before merge" or "can wait"; weigh each Ruling line and say if you disagree.]

## Severity

Critical: broken behaviour, data loss, security hole.
Important: this cannot be trusted until fixed: incorrect or fragile behaviour, a
missed requirement, swallowed errors, tests that assert nothing, verbatim
duplication of a logic block.
Minor: polish, broader coverage, naming.
If the plan itself mandates something this rubric calls a defect, report it as
Important and label it plan-mandated. The controller rules on it.

## Output

Start directly with the spec verdict. Every line is a verdict, a finding with
file:line, or a check you ran. No preamble, no closing summary.

### Spec compliance
PASS | FAIL: [missing / extra / misunderstood, each with file:line]
Cannot verify: [requirement, and what the controller should check] (or "none")

### Strengths
[Specific things done well.]

### Issues
#### Critical
#### Important
#### Minor
Each: file:line, what is wrong, why it matters, how to fix if not obvious.

### Verdict
Quality: APPROVED | NEEDS FIXES
Reason: [one or two sentences]
```

Placeholders: `BRIEF_FILE`, `REPORT_FILE` and `DIFF_FILE` are paths in the plan workspace. `GLOBAL_CONSTRAINTS` is copied verbatim from the plan's constraints section or the spec: exact values, formats and stated relationships between components, not process rules (those are already in this template). Never add "do not flag X" or "treat Y as Minor": that is pre-judging, and the fix loop is where findings get adjudicated.
