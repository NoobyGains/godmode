---
name: workspace-isolation
description: "Use when starting feature work that should not touch the current checkout, before executing an implementation plan, or when several agents or sessions will edit the same repository at the same time."
---

# Workspace Isolation

A git worktree is a second working directory on its own branch that shares the repository's history. Work in one cannot disturb the files in another, so a plan can run without risking the user's checkout, and parallel agents cannot overwrite each other.

**Core principle: detect existing isolation first, prefer the harness's own worktree mechanism, fall back to plain git, and never start work on a baseline you have not tested.** A worktree created behind the harness's back is state it cannot see or clean up; a worktree started on a red baseline makes every later failure ambiguous.

<!-- Claude Code worktree facts: https://code.claude.com/docs/en/worktrees and https://code.claude.com/docs/en/sub-agents (fetched 2026-10-25). Per-harness actions: skills/using-godmode/references/<harness>-tools.md. -->

## The Prime Directive

```
NO IMPLEMENTATION WITHOUT AN ISOLATED WORKSPACE AND A KNOWN BASELINE
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Before `godmode:delegated-execution` or `godmode:inline-execution` starts Task 1.
- Before parallel agents that write files (`godmode:parallel-execution`).
- When the user's checkout has uncommitted work you must not disturb.

**Skip:**
- Read-only investigation or review.
- The user has said to work in place; record that in the ledger and still run the baseline tests.
- Not a git repository: say so, and ask the user whether to `git init` or work in place.

## The Protocol

### 1. Detect existing isolation

```bash
git_dir=$(cd "$(git rev-parse --git-dir)" && pwd -P)
git_common=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
super=$(git rev-parse --show-superproject-working-tree 2>/dev/null)
branch=$(git branch --show-current)
```

- `git_dir` differs from `git_common` and `super` is empty: you are already in a linked worktree. Do not create another. Go to step 4.
- `super` is not empty: you are in a submodule, not a worktree. Treat it as a normal checkout.
- Detached HEAD in a linked worktree: the host manages it. Note that a branch must be created at finish time.

### 2. Get consent and a name

If the user's instructions already state a worktree preference, follow it. Otherwise say in one line that you will create a worktree to protect their checkout, and proceed unless they have said to work in place. Choose a short branch name from the work (`feature/csv-export`, `fix/login-race`).

### 3. Create the worktree

**3a. The harness's own mechanism first.** If the harness can create a worktree itself (a built-in action, a command-line flag, or a per-subagent isolation option), use it: it owns placement, branch creation, cleanup and its own isolation checks. The harness reference names the action. Facts to know on Claude Code:
- Session worktrees go under `.claude/worktrees/<name>/` on a branch `worktree-<name>`; add `.claude/worktrees/` to `.gitignore`.
- New worktrees branch from the repository's default branch, not from your current `HEAD`, unless the project's worktree base setting says otherwise. If the work must build on unpushed commits or a feature branch, check the base before relying on it.
- Gitignored files such as `.env` are not copied unless the project has a `.worktreeinclude` file listing them.
- A subagent run with worktree isolation gets a temporary worktree that is removed automatically if it made no changes.

**3b. Plain git otherwise.** Pick the directory in this order; an explicit preference always beats what you find on disk:
1. A worktree directory the user's instructions declare.
2. An existing `.worktrees/` at the repository root.
3. An existing `worktrees/` at the repository root (if both exist, `.worktrees/` wins).
4. Default: create `.worktrees/`.

Verify a project-local directory is ignored before creating anything inside it:

```bash
git check-ignore -q .worktrees || echo "NOT IGNORED"
```

If it is not ignored, add the directory to `.gitignore`, commit that one-line change on the current branch, and say so. An unignored worktree directory gets committed into the repository wholesale.

```bash
base=$(git rev-parse HEAD)           # or the branch the plan says to start from
git worktree add ".worktrees/$name" -b "$branch" "$base"
cd ".worktrees/$name"
```

If creation fails with a permission or sandbox error, tell the user, and work in the current checkout on a new branch instead.

### 4. Set up the project

Detect and run the project's own setup, preferring what its README or contributing guide says over guesses:

| Marker | Setup |
|---|---|
| `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` | `npm ci` / `pnpm install --frozen-lockfile` / `yarn install --frozen-lockfile` |
| `pyproject.toml` / `requirements.txt` | the project's tool (`uv sync`, `poetry install`, `pip install -r requirements.txt`) in a virtual environment |
| `Cargo.toml` | `cargo build` |
| `go.mod` | `go mod download` |

Copy any local configuration the tests need (for example `.env.example` to `.env`) only when the project documents it. Never copy secrets into a tracked file. `godmode:environment-awareness` covers shell and package-manager differences.

### 5. Run the baseline tests

Run the project's full test command and read the output.
- **Green:** record the count.
- **Red:** report the failures and ask the user whether to proceed or investigate first. If they say proceed, ledger `Baseline: <n> failing before any change: <names>` so later failures can be told apart.

### 6. Report

```
Worktree: <absolute path>  (branch <name>, from <base sha>, created by <harness | git>)
Setup: <command> ok
Baseline: <command> -> <n> passed, <m> failed
```

This block goes in the plan ledger as well as the message.

## Cleanup

Cleanup belongs to `godmode:merge-protocol`. The rule for this skill: remove only worktrees this run created under `.worktrees/` or `worktrees/`; leave harness-managed worktrees to the harness; never force-remove a worktree that holds uncommitted or untracked files without asking the user.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "I'm obviously not in a worktree" | Harness-created isolation and submodules both fool a glance. Run the detection commands. |
| "`git worktree add` is quicker than the harness's way" | The harness cannot see or clean up a worktree it did not make, and its isolation checks do not cover it. |
| "The directory is surely ignored" | Run `git check-ignore`. One miss commits a whole tree. |
| "The new worktree has my branch's commits" | Some harnesses branch from the default branch. Check `git log -1` in the worktree. |
| "Baseline tests can wait, it's a fresh checkout" | A red baseline makes every later failure ambiguous. Run them now. |
| "Dependencies are the same as the main checkout" | A worktree is a fresh checkout. Install them. |

## Guardrails

**Never:**
- Create a worktree inside an existing linked worktree.
- Create a project-local worktree directory that git does not ignore.
- Start implementation on a baseline you have not run.
- Copy secrets into tracked files.
- Remove worktrees you did not create.

**Always:**
- Prefer the harness's own worktree mechanism when it has one.
- Confirm the worktree's base commit is the one the work needs.
- Report path, branch, base, setup and baseline counts.

## Connections

- `godmode:delegated-execution`, `godmode:inline-execution`: call this before Task 1.
- `godmode:parallel-execution`: one worktree per writing agent.
- `godmode:environment-awareness`: shells, package managers and Windows paths during setup.
- `godmode:merge-protocol`: lands the branch and tears the worktree down.
