---
name: merge-protocol
description: Use when implementation is finished, tests are green, and you need to decide how to land the work - presents structured integration paths for local merge, pull request, deferral, or abandonment
---

# Merge Protocol

## Overview

Coordinate the final step of development: moving finished work into the mainline or disposing of it cleanly.

**Core principle:** Validate first, present choices, execute the selected path, then tidy up.

**Announce at start:** "I'm using the merge-protocol skill to finalize this work."

## Prime Directive

> **NO INTEGRATION WITHOUT PASSING TESTS**

No exceptions. No workarounds. No shortcuts.

## When to Use

- All planned implementation work is done and committed
- The test suite runs green on the current branch
- Review feedback (if solicited) has been resolved
- You are ready to land, shelve, or abandon the branch
- Following delegated-execution or task-runner completion
- When a workspace-isolation branch needs teardown

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "Tests were green an hour ago, no need to re-run" | Any commit since then invalidates stale results. Re-verify now. |
| "Merging is mechanical — nothing breaks" | Conflicts and integration regressions are real. Test the merged state. |
| "I'll remove the worktree tomorrow" | Orphaned worktrees pile up and create confusion. Remove them immediately. |
| "Let me just merge — skip the menu" | Always present all four paths. The human picks the workflow. |
| "Abandonment is obvious — no confirmation needed" | Destroying work permanently demands explicit typed confirmation. Always. |

## The Workflow

### Phase 1: Validate the Suite

**Run the full test suite before anything else:**

```bash
# Execute the project's test runner
npm test / cargo test / pytest / go test ./...
```

**On failure:**
```
Suite failures detected (<N> failing). Resolution required before proceeding:

[Display failing tests]

Integration cannot continue until the suite is green.
```

Halt here. Do not advance to Phase 2.

**On success:** Proceed to Phase 2.

### Phase 2: Identify the Trunk Branch

```bash
# Determine the ancestor branch
git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null
```

Or confirm: "This branch diverged from main — correct?"

### Phase 3: Offer Integration Paths

Present exactly these four choices:

```
Work is complete and verified. Select an integration path:

1. Merge into <trunk> locally
2. Push and open a Pull Request
3. Leave the branch untouched (I'll handle it myself)
4. Abandon this work entirely

Which path?
```

**Keep it terse** — no extra commentary.

### Phase 4: Execute the Selected Path

#### Path 1: Local Merge

```bash
# Switch to trunk
git checkout <trunk>

# Sync with remote
git pull

# Integrate the feature branch
git merge <feature-branch>

# Validate the merged state
<test command>

# Remove the merged branch
git branch -d <feature-branch>
```

Then: Proceed to Phase 5 (Worktree Teardown)

#### Path 2: Pull Request

```bash
# Push the branch upstream
git push -u origin <feature-branch>

# Open the PR
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
<2-3 bullets describing the changes>

## Verification Steps
- [ ] <checklist items>
EOF
)"
```

Then: Proceed to Phase 5 (Worktree Teardown)

#### Path 3: Defer

Report: "Branch <name> preserved. Worktree remains at <path>."

**Do not tear down the worktree.**

#### Path 4: Abandon

**Require explicit confirmation:**
```
Permanent deletion warning:
- Branch <name>
- All commits: <commit-list>
- Worktree at <path>

Type 'abandon' to proceed.
```

Wait for the exact word.

After confirmation:
```bash
git checkout <trunk>
git branch -D <feature-branch>
```

Then: Proceed to Phase 5 (Worktree Teardown)

### Phase 5: Worktree Teardown

**Applies to Paths 1, 2, and 4:**

Detect if the current branch lives in a worktree:
```bash
git worktree list | grep $(git branch --show-current)
```

If so:
```bash
git worktree remove <worktree-path>
```

**Path 3:** Worktree stays intact.

## Decision Matrix

| Path | Merges | Pushes | Keeps Worktree | Removes Branch |
|------|--------|--------|----------------|----------------|
| 1. Local merge | Yes | No | No | Yes |
| 2. Pull request | No | Yes | Yes | No |
| 3. Defer | No | No | Yes | No |
| 4. Abandon | No | No | No | Yes (force) |

## Frequent Errors

**Skipping validation**
- **Consequence:** Broken code lands on trunk, failing PR created
- **Correction:** Always verify the suite before presenting paths

**Open-ended prompting**
- **Consequence:** "What now?" leads to ambiguity and stalling
- **Correction:** Present exactly four structured paths

**Premature worktree removal**
- **Consequence:** Destroys workspace needed for PR or deferred work
- **Correction:** Only tear down worktrees for Paths 1 and 4

**Silent abandonment**
- **Consequence:** Work deleted without the human's awareness
- **Correction:** Require typed "abandon" before any destructive action

## Guardrails

**Prohibited:**
- Proceeding when tests fail
- Merging without validating the integrated result
- Deleting branches without explicit confirmation
- Force-pushing unless the human specifically asks

**Mandatory:**
- Run suite before presenting paths
- Present exactly four options
- Obtain typed confirmation for Path 4
- Tear down worktree only for Paths 1 and 4

## Integration

**Invoked by:**
- **godmode:delegated-execution** (final step) — After all delegated tasks finish
- **godmode:task-runner** (final step) — After all execution batches complete

**Complements:**
- **godmode:workspace-isolation** — Tears down the worktree created by that skill
