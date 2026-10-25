# Plan workspace and progress ledger

Shared by `godmode:delegated-execution` and `godmode:inline-execution`. Same directory, same format, so a run can change mode mid-plan and the new executor resumes from the same ledger. Everything here is plain shell (Git Bash, macOS, Linux); no script is required.

## Contents

1. Workspace location
2. Opening the workspace
3. Task brief
4. Review package
5. Ledger format
6. Cost lines
7. Resuming after compaction
8. Cleanup

## 1. Workspace location

```
<repo-root>/.godmode/runs/<plan-slug>/
  plan-path              the plan this directory belongs to
  progress.md            the ledger
  task-<N>-brief.md      one task's full text, extracted from the plan
  task-<N>-report.md     the implementer's full report (fix reports appended)
  review-<a>..<b>.diff   review packages, one per reviewed range
  final-review.md        the whole-branch reviewer's report
```

The directory lives in the working tree, not under `.git/`, because some harnesses refuse agent writes inside `.git/`, which would stop an implementer from writing its report. A self-ignoring `.gitignore` at `.godmode/` keeps it out of `git status` and out of commits without touching any tracked file. `git clean -fdx` deletes it; if that happens, recover progress from `git log`.

## 2. Opening the workspace

```bash
PLAN=docs/plans/2026-10-25-feature.md           # the plan file
root=$(git rev-parse --show-toplevel)
slug=$(basename "$PLAN" .md)
ws="$root/.godmode/runs/$slug"
mkdir -p "$ws"
[ -e "$root/.godmode/.gitignore" ] || printf '*\n' > "$root/.godmode/.gitignore"
if [ -e "$ws/plan-path" ] && [ "$(cat "$ws/plan-path")" != "$PLAN" ]; then
  ws="$ws-$(basename "$(dirname "$PLAN")")"       # same file name, different plan
  mkdir -p "$ws"
fi
[ -e "$ws/plan-path" ] || printf '%s\n' "$PLAN" > "$ws/plan-path"
echo "$ws"
```

Use the same spelling of `PLAN` (repository-relative) every time, so the ownership check compares like with like. Run inside a worktree, `git rev-parse --show-toplevel` is the worktree root, so each worktree has its own workspace.

## 3. Task brief

Extract one task's text (heading `Task <N>` at any level, ignoring headings inside code fences) into a file:

```bash
N=3
awk -v n="$N" '
  /^```/ { fence = !fence; if (keep) print; next }
  !fence && /^#+[ \t]/ {
    match($0, /^#+/); lvl = RLENGTH
    if ($0 ~ /^#+[ \t]+Task[ \t]+[0-9]+/) { keep = ($0 ~ ("^#+[ \t]+Task[ \t]+" n "([^0-9]|$)")); if (keep) tl = lvl }
    else if (keep && lvl <= tl) keep = 0
  }
  keep { print }
' "$PLAN" > "$ws/task-$N-brief.md"
test -s "$ws/task-$N-brief.md" || echo "Task $N not found in $PLAN"
```

The brief runs from the `Task <N>` heading to the next heading at the same or a higher level, so sub-steps (`#### Step 1`) stay in and a trailing `## Appendix` stays out. `Task 1` never matches `Task 12`, and headings inside code fences are ignored. Tested with Git Bash awk on 2026-10-25. Open the brief once and check it ends where the task ends.

For a batch of same-shape tasks, write the brief by hand: one heading, then one line per file with its exact change, then the test command that covers the batch.

## 4. Review package

```bash
BASE=abc1234                                     # recorded before the dispatch
HEAD_SHA=$(git rev-parse HEAD)
git merge-base --is-ancestor "$BASE" "$HEAD_SHA" || echo "HEAD is not built on BASE"
test "$(git rev-list --count "$BASE..$HEAD_SHA")" -gt 0 || echo "empty range"
out="$ws/review-$(git rev-parse --short "$BASE")..$(git rev-parse --short "$HEAD_SHA").diff"
{
  echo "# Review package $BASE..$HEAD_SHA"
  echo; echo "## Commits"; git log --oneline "$BASE..$HEAD_SHA"
  echo; echo "## Files changed"; git diff --stat "$BASE..$HEAD_SHA"
  echo; echo "## Diff"; git diff -U10 "$BASE..$HEAD_SHA"
} > "$out"
echo "$out"
```

The package never enters the controller's context: pass the printed path to the reviewer. For a fix round use `FIX_BASE` (the head the previous review saw) in place of `BASE`. For the final review use `git merge-base <trunk> HEAD`.

## 5. Ledger format

`progress.md` is append-only plain text. One fact per line. The first line is its identity.

```
# GodMode ledger: plan docs/plans/2026-10-25-feature.md
Mode: delegated | inline
Spec: docs/plans/2026-10-25-feature-design.md        (or: none; rulings are provisional)
Pre-flight: Task 2 x Task 4 | both edit src/config.ts | Task 4 consumes loadConfig() from Task 2 | consistent
Pre-flight: Task 3 self-check | test names parseRange, code names parse_range | Ruling: use parseRange / matches Task 2 exports / one rename
Task 1: started (base a1b2c3d, implementer impl-task-1, model cheap/low)
Task 1: complete (commits a1b2c3d..d4e5f6a, review clean)
Cost: Task 1 | implementer cheap/low 1 dispatch | reviewer mid/medium 1 dispatch
Task 2: started (base d4e5f6a, implementer impl-task-2, model mid/medium)
Task 2: minor (deferred): retry count is a magic number in src/fetch.ts:41
Task 2: fix round 1/5 (2 addressed, 0 open; commits d4e5f6a..b7c8d9e)
Task 2: complete (commits d4e5f6a..b7c8d9e, review clean)
Task 5: parked: reviewer wants a cache layer | Ruling: out of plan scope / spec lists no latency target / one later task
Final: review top/high | 1 Important, 2 Minor | fix wave commits e1f2..a3b4 | re-review clean
```

Rules:
- Every decision the plan did not make for you is a `Ruling:` with three parts: what, why, cost if wrong.
- Append the ledger line in the same step as the commit or the review it records, never "later".
- A task is done only when a `Task <N>: complete` line exists.

## 6. Cost lines

One `Cost:` line per task, naming each seat's tier and effort and the number of dispatches (or, for inline execution, the number of test runs and fix attempts). The point is not accounting precision; it is a record the user can read to see where the run spent, and the evidence `godmode:model-routing` needs to adjust tiers next time. If the harness reports tokens or cost per subagent, add the figure; otherwise counts are enough.

## 7. Resuming after compaction

1. Re-open the workspace with the commands in section 2.
2. Read `progress.md`. The first task with no `complete` line is where you resume.
3. If that task's last line is a fix round, resume the loop at the next round with the findings named there.
4. Check `git log --oneline` against the commits the ledger names. Commits exist even when your context no longer remembers making them.
5. Never re-dispatch or redo a task marked complete.

## 8. Cleanup

Before deleting anything, copy every `Ruling:` line (in order) and every `minor (deferred)` line into the final message to the user. Delete the plan's directory (`rm -rf "$ws"`) only after the work has landed or the user chose to keep the branch as it is. Other directories under `.godmode/runs/` belong to other plans and are never yours to touch.
