# Scoped re-review prompt

Used by `godmode:delegated-execution` after every fix round, and once after the final fix wave. It verifies that each finding was addressed and that the fix broke nothing. It is not a fresh full review.

Dispatch settings:
- **Model and effort:** REQUIRED, per `godmode:model-routing`. Small fix diffs take a cheap-to-mid tier; the re-review after the final fix wave takes a mid tier or above.
- **Access:** read-only on the checkout. A fresh subagent each time.

```
You are re-reviewing fix round [R] of [Task N: name | the final fix wave]. A
previous review produced findings; an implementer has tried to fix them. Your job
is to give a verdict on each finding and inspect the fix diff. Nothing else.

## The task

Requirements: [BRIEF_FILE | PLAN_FILE]

## Findings under verification

[FINDINGS: the Critical and Important findings and spec gaps from the previous
review, verbatim, one per bullet]

## The fix

Report (fix reports are appended at the end): [REPORT_FILE]
Fix base: [FIX_BASE_SHA] (the head the previous review saw)   Head: [HEAD_SHA]
Review package: [DIFF_FILE]

Read the package once; do not re-derive it with git. If it is missing, run
`git diff FIX_BASE..HEAD`. Do not modify the working tree, the index, HEAD or any
branch. Do not dispatch subagents.

## Scope

Verdict every finding. Inspect the fix diff for problems the fix itself
introduced. Do not re-review code the fix did not touch: an issue entirely outside
the fix diff goes under Out-of-scope observations, does not block, and does not
extend the loop.

## Tests

Confirm the fix report names the covering tests, the command and the output, and
check those claims against the diff. Do not re-run the suite. Run one focused test
only for a specific doubt no recorded run answers.

## Output

Start directly with the first verdict. No preamble.

### Finding verdicts
- [finding one-liner]: ADDRESSED | NOT ADDRESSED, with file:line evidence.
  "Attempted" is not addressed; the defect must be gone.

### New breakage in the fix diff
[Severity, file:line, what. Or "none".]

### Out-of-scope observations
[Non-blocking; the controller records them as deferred minors. Or "none".]

### Round verdict
ALL ADDRESSED, no new Critical or Important breakage | OPEN: [list]
```

The controller copies NOT ADDRESSED findings and any new Critical or Important breakage into the next round's findings list, and every out-of-scope observation into the ledger as a deferred minor.
