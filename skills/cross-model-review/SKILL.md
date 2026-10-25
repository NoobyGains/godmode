---
name: cross-model-review
description: "Use when a reviewed change is about to land on a shared branch, be released or be deployed, and when the user asks for a second opinion on a change from a different model or a different AI vendor."
---

# Cross-Model Review

Models from one family share blind spots: the same training habits, the same favourite mistakes, the same things they never question. Before a change lands, one reviewer from a **different model family** than the author reads it once, narrowly, from a brief file. **One focused outside read catches what a whole team of same-family reviewers will agree to miss.**

## The Prime Directive

```
NOTHING LANDS WITHOUT ONE READ-ONLY REVIEW FROM A DIFFERENT MODEL FAMILY, OR A RECORDED REASON WHY NOT
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Before merging a feature branch into the main branch.
- Before a release, a tag or a deployment.
- Before landing changes to security-sensitive code, data migrations, public APIs, build or release tooling.
- When the user asks for a second opinion, an outside review or a review by another vendor's model.

**Skip:**
- Work that has not passed `godmode:code-review` yet. This review comes after, not instead.
- Throwaway spikes and local experiments that will not land.
- Changes where the user has said explicitly that they do not want an outside review; record that they said so.

## The Protocol

1. **Confirm the entry state.** `godmode:code-review` has passed with no open Critical or Important findings, the suite is green, and the work is committed. Note the base and head commits.

2. **Identify the author's family.** The family is the vendor's model line (for example Claude, GPT, Gemini), not the size or tier. A different tier of the same family does not count as a second family.

3. **Pick the reviewer.** Choose a reachable model from a different family. How to reach a second model family on your harness (which command, which window, which plugin, which flags keep it read-only) is in the harness reference of `godmode:using-godmode`; see the harness reference for how to reach a second model family. Pick the cheapest model of that family that is good at code review at a medium effort setting; do not pick a premium tier or a fast mode that burns the user's allowance for one review (see `godmode:model-routing`).

4. **Write the brief file.** Copy [the review brief template](review-brief-template.md) to a scratch or git-ignored path and fill it in:
   - the exact commit range and the exact files to read, each with a one-line reason;
   - three to seven exact questions, each one checkable from the code ("Can `parseConfig` return a partially populated object when the file is truncated?", not "Is the config code good?");
   - the requirements the change must meet, or the path to them;
   - the constraints: read-only, no sub-agents, no web browsing unless a question needs it, one round, the report format, and where to write the report.

   Narrow beats broad. A reviewer given the whole repository and "review everything" returns a long list of style opinions; a reviewer given six files and five questions returns the bug.

5. **Send it once.** Hand the reviewer the path to the brief, not a pasted copy of your session. Ask for the report as a file at the path the brief names. Do not chat with the reviewer during the round and do not send follow-up rounds; if the report raises a question only the reviewer can answer, that is a new review with a new brief, and it needs the user's agreement.

6. **Wait for the report and read all of it.** If the reviewer fails (it times out, it is out of quota, it edits files), record the failure, discard any edits it made after looking at them, and go to step 9.

7. **Reconcile with evidence.** For every finding, before changing anything:
   - reproduce it: run the input, read the code path, write the failing test;
   - classify it as confirmed, rejected (with the evidence that refutes it) or needs the user's decision;
   - fix confirmed findings test-first, with `godmode:test-first`, and re-run the verification yourself.

   The outside reviewer's verdict is an input, not proof, in both directions. "Looks good" from another family does not replace your own verification, and an alarming finding is not real until you have reproduced it. Use `godmode:review-response` for the evaluation.

8. **Check the fixes yourself.** Do not send a second round to the outside reviewer for the fixes. Run targeted tests for each fix and the full suite, and record the output.

9. **Fallback when no other family is reachable.** If no other family is installed, reachable or within quota, dispatch a fresh reviewer from the same family with no session history, using the same brief file, and record "fallback: same family, because ..." in the outcome. Say this plainly to the user; a same-family review is weaker, not equivalent.

10. **Record the outcome.** In the pull request description, the progress ledger or the release notes:

    ```
    Cross-model review: <family and model> via <how it was reached>, <date>
    Range: <base>..<head>   Brief: <path>   Report: <path>
    Findings: <n> confirmed and fixed, <n> rejected with evidence, <n> for the user
    ```

    If the review was skipped, record who decided and why. Then hand on to `godmode:merge-protocol`.

## Writing Good Questions

| Weak question | Strong question |
|---|---|
| "Is this secure?" | "Can a user without the admin role reach `DELETE /projects/:id` through the batch endpoint in `routes/batch.ts`?" |
| "Any bugs?" | "What does `retryWithBackoff` do when the callback throws synchronously on the first call?" |
| "Is the migration safe?" | "Does migration 0042 lock the `orders` table for longer than a single statement on PostgreSQL, and is it reversible?" |
| "Check the tests." | "Which branch of `applyDiscount` has no test that would fail if it were deleted?" |

Aim questions at the places a same-family reviewer is least likely to look: assumptions the author made without stating them, error paths, concurrency, input from outside the trust boundary, and behaviour the requirements are silent on.

## Keeping It Cheap

The outside reviewer often runs on a separate subscription or quota that the user also needs for other work. Keep one review to one bounded cost:

- One reviewer, one round, one report. No helpers, no follow-up chat.
- Only the servers, plugins and tools the questions need; a read-only review needs no write access and rarely needs the web.
- A medium effort setting on a capable mid-tier model; escalate the tier only when a medium review has demonstrably missed something, and only with the user's agreement.
- Batch: when several small changes land together, write one brief covering the combined range instead of one review per commit.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "Our own reviewer already passed it." | That reviewer shares the author's blind spots. This step exists for the defects both of them miss. |
| "I will just send the whole diff and ask for a general review." | A broad brief gets broad opinions. Exact files and exact questions get findings. |
| "The other model said it is fine, so it is verified." | Another model's approval is not evidence. You still run the verification. |
| "The other model flagged a bug, so I will fix it straight away." | Unreproduced findings are hypotheses. Some are wrong, and a wrong fix adds a bug. |
| "One more round with the outside reviewer will settle it." | Rounds multiply cost and drift into negotiation. One round, then you verify the fixes yourself. |
| "Letting it spin up helpers will make the review more thorough." | Helpers multiply cost and dilute accountability. One reviewer, one report. |
| "No other family is set up, so I will skip it quietly." | Use the same-family fallback and say so. Silence makes a weaker review look like a full one. |

## Guardrails

**Never:**
- Let the outside reviewer edit files, commit, push or run anything that changes state.
- Paste your session history or your opinion of the code into the brief.
- Run more than one round per change, or let the reviewer dispatch sub-agents.
- Apply a finding without reproducing it, or reject one without evidence.
- Pick a premium tier or fast mode for the reviewer without the user's agreement.
- Record a same-family fallback as a cross-model review.

**Always:**
- Run `godmode:code-review` first.
- Put exact files and exact questions in a brief file and send its path.
- Reconcile every finding as confirmed, rejected with evidence, or for the user.
- Verify fixes yourself with fresh test output.
- Record which family reviewed, how it was reached, and the outcome.

## Connections

- `godmode:code-review`: the same-family review this one follows.
- `godmode:review-response`: how each finding is evaluated and answered.
- `godmode:using-godmode`: its harness references say how to reach a second model family on each harness.
- `godmode:model-routing`: which model of the other family takes the seat, at which effort.
- `godmode:completion-gate`: fresh verification after the fixes, before you say the work is ready.
- `godmode:merge-protocol`: landing the branch once the review is reconciled.
