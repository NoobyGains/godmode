---
name: code-review
description: "Use when a task, feature or bug fix is implemented and before it is committed, merged or handed back to the user, and when the user asks for a review of a change, a branch or a pull request."
---

# Code Review

A change is reviewed by someone who did not write it, in two stages: first "does it do exactly what was asked", then "is it built well". The author then explains the change to the user in plain language and discloses everything that was not asked for. **The author's confidence is not evidence; a fresh reviewer reading the diff is.**

## The Prime Directive

```
NO CHANGE LANDS UNTIL A FRESH REVIEWER HAS PASSED IT AND THE USER HAS SEEN WHAT CHANGED
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- After every task in a plan, before the next task starts.
- After a feature or a bug fix, before it is committed to a shared branch or merged.
- Before a pull request is opened or marked ready.
- When the user asks for a review of a diff, a branch or a pull request.

**Skip:**
- A one-line typo or comment fix the user dictated verbatim; still disclose it.
- Exploratory spikes that will be deleted. The code that replaces them is reviewed.

## The Protocol

1. **Check entry conditions.** The suite passes on the branch, the work is committed, and you can say in two sentences what was built and why. If the suite is red, fix it first; a reviewer's time is wasted on a change that does not run.

2. **Fix the range and write the diff to a file.** Take the base commit (the merge base with the target branch, or the commit before the task) and the head commit:

   ```bash
   BASE=$(git merge-base origin/main HEAD)   # or the commit before this task
   HEAD_SHA=$(git rev-parse HEAD)
   git diff --stat "$BASE" "$HEAD_SHA" > review-stat.txt
   git diff "$BASE" "$HEAD_SHA" > review.diff
   ```

   Write these files to a scratch directory or a git-ignored path, never into tracked source. The reviewer reads the file instead of receiving a pasted diff, which keeps both contexts small.

3. **Dispatch a fresh reviewer.** Dispatch a subagent that has none of your session history, using [the reviewer template](reviewer-template.md). Fill in the summary, the requirements (plan file and task, or the user's words), the base and head commits, and the paths to the diff files. Name the reviewer's model and effort on the dispatch (see `godmode:model-routing`); the final review of a whole branch takes the top tier. The reviewer is read-only and does not dispatch helpers of its own. If your harness ships a code reviewer agent definition, you may dispatch that persona with the same filled-in template.

4. **Stage one: spec compliance.** The reviewer checks the diff against the requirements line by line:
   - every requirement is implemented and has a test;
   - nothing was built that was not asked for;
   - behaviour the spec is silent on matches what a reasonable user would expect.

   A stage-one failure goes back to the implementer before stage two is worth running. Small diffs may run both stages in one dispatch; the reviewer still reports them separately.

5. **Stage two: quality.** Correctness at the edges, error handling, security surface, tests that assert real behaviour, conventions of the surrounding code, simplicity, performance where it matters. The template carries the full checklist.

6. **Triage the findings.**

   | Severity | Meaning | What you do |
   |---|---|---|
   | Critical | Wrong behaviour, data loss, a security hole, a crash, a broken build | Fix now, then re-review the fix |
   | Important | Missing requirement, weak error handling, test gaps, structural problems | Fix before the next task or before landing |
   | Minor | Naming, style, small clean-ups | Fix if cheap, otherwise record it for the user |

   Evaluate every finding with `godmode:review-response`: verify it against the code before you act, and push back with evidence when the reviewer is wrong. Rule on every item the reviewer listed as "declined to judge"; nothing set aside is dropped silently.

7. **Bound the fix loop.** After fixes, re-review only the fixes against the findings they address, with a fresh reviewer or the same one. If the same Critical or Important finding survives two fix rounds, stop and hand over to `godmode:error-recovery`; a third identical round is not progress.

8. **Write the change walkthrough.** For the user, in plain language, before you commit or merge. One entry per changed file or per coherent group of files:

   ```markdown
   ### src/middleware/rate-limit.ts
   What: logins are now limited to five attempts per minute per IP address.
   Why: the login endpoint accepted unlimited password guesses.
   Context: runs before the auth routes; counters live in Redis.
   Risk: if Redis is down the limiter lets everything through. Decide whether it should block instead.
   ```

   Finish with structural consequences (new dependencies, new layers, changed data flow) and open questions for the user. If you cannot explain a change in plain words, you do not understand it well enough to ship it; go back and find out.

9. **Disclose unsolicited changes.** List every change the user did not ask for, separately and before the commit:

   ```
   Not requested: I also renamed parseDate to parseIsoDate in three files because the old name hid that it rejects other formats. Keep it or revert it?
   ```

   This includes reformatting, dependency bumps, renamed symbols, deleted dead code and "while I was there" fixes. The user decides; you do not commit an undisclosed change.

10. **Record the outcome.** In the progress ledger, the task notes or the pull request description: the range reviewed, the reviewer's model, the verdict, which findings were fixed and which were declined with the reason. Then hand on to `godmode:cross-model-review` before landing, or to `godmode:merge-protocol`.

## What the Reviewer Gets, and What It Does Not

| Give | Withhold |
|---|---|
| The requirements in full, or the path to the plan and the task number | Your session history and reasoning |
| The base and head commits and the diff file paths | Your opinion of the code ("it is solid, just check style") |
| What was built, in two sentences | Pre-written findings you want confirmed |
| Known limitations and decisions the user already made | Instructions to be lenient or quick |

A reviewer handed your conclusion tends to return it confirmed. Give it the work and the requirements, not your verdict.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It is a small change; review is overkill." | Small diffs cause large outages, and a small diff reviews in minutes. |
| "I tested it thoroughly." | Tests and review catch different kinds of defect. A test cannot tell you that you built the wrong thing. |
| "I will review my own diff; it is faster." | You will read what you meant, not what you wrote. A reviewer without your context reads the code. |
| "The reviewer needs my whole history to understand." | If the change cannot be understood from the requirements and the diff, the next maintainer cannot understand it either. |
| "The tests pass, so the user does not need the walkthrough." | Passing tests say the code does something. The walkthrough says what, so the user can own it. |
| "That extra rename was obviously helpful; no need to mention it." | Every undisclosed change is a surprise in someone's next debugging session. Disclose it. |
| "We will batch the review into the next pull request." | Defects compound across tasks. Review each task before the next one builds on it. |

## Guardrails

**Never:**
- Land, merge or open a ready pull request with an open Critical or Important finding.
- Review your own change and call it reviewed.
- Paste your session history or your verdict into the reviewer's brief.
- Let the reviewer edit the working tree, move HEAD or dispatch its own reviewers.
- Commit a change you have not disclosed to the user.
- Mark a finding "won't fix" without a technical reason recorded next to it.

**Always:**
- Review against the written requirements, not against your memory of them.
- Give the reviewer the base and head commits and the diff as a file.
- Name the reviewer's model on the dispatch.
- Write the plain-language walkthrough before committing a multi-file or behavioural change.
- Rule explicitly on everything the reviewer declined to judge.

## Connections

- `godmode:review-response`: how you evaluate and answer each finding the reviewer returns.
- `godmode:cross-model-review`: after this review passes, one narrow pass by a different model family before landing.
- `godmode:completion-gate`: re-run the verification after the last fix, before you say the work is done.
- `godmode:delegated-execution`: runs this review after every implementer task.
- `godmode:model-routing`: which model takes the reviewer seat.
- `godmode:error-recovery`: takes over when the same finding survives two fix rounds.
- `godmode:merge-protocol`: landing the reviewed branch.
