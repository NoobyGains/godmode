---
name: merge-protocol
description: "Use when implementation on a branch is finished and reviewed and the work needs to land, be proposed as a pull request, be parked for later, or be thrown away."
---

# Merge Protocol

The last step of a run decides what happens to the branch: merge it locally, open a pull request, keep it as it is, or abandon it. Each path is easy to get slightly wrong (merging into the wrong base, deleting a worktree that held the only copy of a file, force-pushing over someone's commits), and most of those mistakes are expensive to undo.

**Core principle: prove the suite is green on the exact tree you are about to land, let the user choose the path, execute it exactly, and tear down only what this run created.** Integration is the user's decision; your job is to make each option safe.

## The Prime Directive

```
NO LANDING ON A RED SUITE, NO ABANDONING WITHOUT THE TYPED WORD
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- `godmode:delegated-execution` or `godmode:inline-execution` finished and the final review is clean.
- `godmode:parallel-execution` or `godmode:team-orchestration` integrated their results.
- The user says "merge it", "ship it", "open a PR", "drop this branch".

**Skip:**
- Work is unfinished or the final review has open Critical or Important findings: go back to the executing skill.
- A deploy or release: that is the project's own release process, after the merge.

## The Protocol

### 1. Validate the suite

Run the project's full test command in the worktree, plus its other machine checks if it has them (lint, type check, build). Read the output.
- **Red:** stop. Report the failures with their output. The menu comes after a green suite.
- **Green:** record the command and counts.

Also check `git status --porcelain`. Uncommitted changes are either committed now (they belong to the work) or reported to the user (they do not).

### 2. Capture the environment

```bash
git_dir=$(cd "$(git rev-parse --git-dir)" && pwd -P)
git_common=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
worktree_path=$(git rev-parse --show-toplevel)     # capture now; later steps change directory
branch=$(git branch --show-current)
```

| State | Paths offered | Teardown |
|---|---|---|
| Normal checkout (`git_dir` equals `git_common`) | all four | none needed |
| Linked worktree on a named branch | all four | only if this run created it |
| Linked worktree, detached HEAD | PR (push as a new branch), keep, abandon | the host manages it; leave it |

### 3. Identify the trunk

The trunk is the branch this work forked from: named in the plan, the ledger, the branch's upstream, or `git merge-base`. If it is not certain, ask one question: "This branch split from `<best guess>`, correct?" Merging into the wrong base is expensive to undo.

### 4. Present the paths

Present exactly this, with the real names filled in:

```
The work on <branch> is complete. Suite: <command> -> <counts>.

1. Merge into <trunk> locally
2. Push <branch> and open a pull request against <trunk>
3. Keep the branch as it is for later
4. Abandon the work (deletes the branch and its commits)

Which path?
```

Wait for the answer. If the run made rulings or left deferred minors, list them above the menu so the user decides with them in view.

### 5. Execute the chosen path

**Path 1: Merge locally**

```bash
main_root=$(git -C "$git_common/.." rev-parse --show-toplevel)
cd "$main_root"
git switch "$trunk"
git pull --ff-only            # if the trunk has a remote; stop if it cannot fast-forward
git merge --no-ff "$branch"
<full test command>
```

If the merged result is red, stop. The merge is local and nothing is pushed: leave the branch and worktree in place, report, and investigate. If green: tear down (step 6), then `git branch -d "$branch"`. Do not push the trunk unless the user asked for that too.

**Path 2: Pull request**

```bash
git push -u origin "$branch"
# detached HEAD: git push origin HEAD:refs/heads/<new-branch>
```

Open the pull request against the trunk with the forge's command-line tool if one is installed, or the creation link the push prints. Follow the repository's pull-request template. The body says what changed, how it was verified (commands and counts), the rulings made, and the deferred minors. Report the URL. Keep the worktree: review feedback gets fixed there.

**Path 3: Keep as it is**

Report: `Keeping <branch>. Worktree at <path>. Resume with the ledger at <ledger path>.` Change nothing.

**Path 4: Abandon**

Show exactly what will be lost and require the typed word:

```
This permanently deletes:
- branch <branch>
- commits: <git log --oneline trunk..branch>
- worktree at <path>, including uncommitted files: <list or "none">

Type "abandon" to confirm.
```

Only the exact word authorises it. "Yes", "sure" or "get rid of it" do not; ask again. On confirmation: change to the main root, tear down (step 6), then `git branch -D "$branch"`. If the branch was pushed, ask separately before deleting the remote branch.

### 6. Tear down

Runs after path 1 and confirmed abandonment only.
- Normal checkout: nothing to remove.
- Worktree under `.worktrees/` or `worktrees/` that this run created: `git worktree remove "$worktree_path"`, then `git worktree prune`.
- Harness-managed worktree: leave it to the harness; use its exit action if it has one.
- **Removal refused** because of modified or untracked files: those files exist nowhere else. Never force it on your own. Show `git -C "$worktree_path" status --porcelain -uall` and offer: commit them to the branch, move them to the main checkout, or delete them. Act on the user's choice.

Delete the run's plan workspace (`.godmode/runs/<plan-slug>/`) after the rulings have been reported.

### 7. Report

```
Path: <1-4>  Branch: <name>  Trunk: <name>
Suite: <command> -> <counts> (on the merged tree for path 1)
Result: <merge commit | PR URL | kept at path | deleted>
Teardown: <what was removed, what was left and why>
```

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "Tests passed earlier in the session" | A green run proves only the tree it ran on. Run it on this one. |
| "They obviously want it merged" | Integration is the user's call. Present the paths and wait. |
| "The trunk is obviously main" | Confirm the fork point. Wrong-base merges are costly to unwind. |
| "'Get rid of it' is confirmation enough" | Only the typed word authorises deletion. |
| "Removal refused, force it to finish cleanup" | Refusal means files exist only there. Forcing destroys them. Ask. |
| "Push rejected, force-push fixes it" | The remote moved. Investigate; force-push only when the user explicitly asks. |
| "The PR is open, the worktree is clutter" | Review fixes happen in that worktree. Keep it until the work lands. |

## Guardrails

**Never:**
- Present the paths before a green suite on the current tree.
- Merge into a trunk you have not confirmed.
- Abandon without the exact typed word.
- Force-push, force-delete or force-remove on your own initiative.
- Remove a worktree this run did not create.
- Push the trunk unless the user asked.

**Always:**
- Capture the worktree path before changing directory.
- Run the suite again on the merged result for path 1.
- Put verification evidence, rulings and deferred minors in the PR body.
- Report exactly what was removed and what was left.

## Connections

- `godmode:delegated-execution`, `godmode:inline-execution`: hand off here after their final review.
- `godmode:completion-gate`: the evidence rule behind "suite green".
- `godmode:cross-model-review`: run before this skill when the user wants a second model family to review first.
- `godmode:workspace-isolation`: created the worktree this skill tears down.
- `godmode:review-response`: handling pull-request feedback after path 2.
