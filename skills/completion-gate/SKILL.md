---
name: completion-gate
description: "Use when about to say that work is done, fixed, passing, working, deployed or ready, before committing, opening or merging a pull request, closing a task, moving to the next task, or reporting a subagent's result as finished."
---

# Completion Gate

A claim about the state of the work is a statement of fact, and a fact needs evidence. The evidence is output you produced and read in this message: a test run, a build, a request and its response, a screenshot. **If you did not run it just now, you do not know it.**

## The Prime Directive

```
NO CLAIM OF DONE, FIXED OR PASSING WITHOUT FRESH VERIFICATION OUTPUT IN THIS MESSAGE
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required, before any of these:**
- Saying or implying that something works, passes, is fixed, is complete or is ready, in any wording.
- Committing, pushing, opening a pull request, merging, tagging, deploying.
- Marking a task complete, moving to the next task, or ending your turn with a summary.
- Passing on a subagent's or another model's "done" as your own statement.
- Expressing satisfaction about the result ("that did it", "all good").

**Skip:**
- Statements that are explicitly about what you have not verified ("I have not run the tests yet"). Those are honest and need no gate.

## The Protocol

1. **Name the claim.** Write down exactly what you are about to assert: "the login bug is fixed", "all tests pass", "the deploy uses the new database".

2. **Name the proof.** Decide which command or observation would prove that claim, and what output would disprove it. Use the table below. A claim about behaviour needs a check of behaviour; a check that something ran is not a check that it did the right thing.

3. **Run it now, in full.** The full test suite, not the one file you touched. The real build, not the linter. The real request against the running service, not the unit test that mocks it. Earlier runs, other sessions and a subagent's report do not count.

4. **Read the output.** The exit code, the counts (passed, failed, skipped, warnings), the error lines and the end of the log. Skipped tests and new warnings are findings, not noise.

5. **Compare output to claim.**
   - The output supports the claim: state the claim with the evidence next to it.
   - The output contradicts it: state the actual state with the evidence, and go back to work.
   - The output is partial or ambiguous: say exactly what is verified and what is not.

6. **Fill in the evidence table** for any non-trivial completion and include it in the message:

   | Claim | Command or check | Result (from this message) |
   |---|---|---|
   | Tests pass | `npm test` | 214 passed, 0 failed, 0 skipped, exit 0 |
   | Build succeeds | `npm run build` | exit 0, no warnings |
   | Bug fixed | reproduction from the report | returns 200 with the expected body; the test fails with the fix reverted |
   | Requirements met | checklist against the plan, task 4 | 6 of 6 items checked, see below |

7. **Only now make the claim**, in plain words, with no hedging and no inflation.

## What Counts as Proof

| Claim | Proof | Not proof |
|---|---|---|
| Tests pass | The full suite run now, zero failures, skips explained | An earlier run; "they should pass"; one file passing |
| Lint or types clean | The tool's output now, zero errors and warnings | Your editor shows no red lines |
| Build succeeds | The build command now, exit 0 | Lint passing; the dev server starting |
| Bug fixed | The original symptom reproduced and now absent | The code changed in the place you suspected |
| Regression test works | Red with the fix reverted, green with it restored | One green run |
| Requirements met | Each requirement checked off against the written spec | The tests pass |
| Subagent finished | The diff it produced, read by you, plus your own run of the checks | Its report saying "done" |
| Deployed | The live endpoint or the deployed version string observed | The deploy command exited 0 |

## Configuration Changes

A configuration change can "succeed" because some valid configuration exists, while yours is ignored. This is the silent fallback: the request returns 200, but from the old provider; the app starts, but with the default flag; the job runs, but against staging.

So verify the difference, not the absence of errors:

1. **What should be different** after the change? Name the observable value (a model name in the response, a hostname in the log, a feature visible on the page, an identity in the auth response).
2. **Where can you observe it?** A response body, a log line, a header, a version endpoint, a query result.
3. **Run the command that exposes it** and read the value.
4. **Confirm the value is the new one.** If you only saw a status code, you have not verified the change.

| Change | Not enough | Enough |
|---|---|---|
| Switch an API provider or model | HTTP 200 | The response names the new provider or model |
| Turn a feature flag on | No errors | The feature's behaviour observed |
| Point at a new environment or database | The deploy succeeded | Logs or a query show the new host |
| Rotate credentials | Authentication succeeds | The authenticated identity is the new one; the old credential is rejected |

## UI Changes

Code that compiles is not a screen that works. For any change a user can see:

- **Look at it.** Open the page in a real browser (or a headless one you control) and capture a screenshot of the changed state. Read the screenshot; do not just save it.
- **Exercise it.** Click, type and submit through the changed flow, including the error and empty states.
- **Check the sizes that matter.** At least a phone width and a desktop width, or the breakpoints the project defines.
- **Check access.** Keyboard navigation reaches and operates the control; focus is visible; contrast and labels pass the project's accessibility check.
- **Check the console.** No new errors or warnings in the browser console.

If you cannot run a browser in this environment, say so and list what the user should look at; do not claim the UI works.

## Reporting Honestly

- Report failures with their output. "3 of 214 tests fail; here are the three" is a useful message. "Mostly working" is not.
- Report what you skipped and why. "I did not run the end-to-end suite because it needs the staging database" lets the user decide.
- Report what you could not verify first, before what you could.
- Do not soften a failure into a success or inflate a partial result into a complete one.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It should work now." | "Should" is a prediction. Run it and turn it into a fact. |
| "I ran the tests a few minutes ago." | You have changed things since. Fresh means this message. |
| "The subagent said all tests pass." | Reports drift from reality. Read the diff and run the checks yourself. |
| "The linter passed, so it builds." | Linters do not compile, link or bundle. Run the build. |
| "It returned 200, so the config change works." | It returned 200 from something. Check that it was the new something. |
| "I am confident in this change." | Confidence is not evidence; it is the feeling that precedes most false claims. |
| "Running the full suite again is wasteful." | A false "done" costs the user a redirect, a rework and their trust. The suite is cheaper. |
| "My wording does not technically claim success." | If the user would read it as done, it is a claim. The rule follows the meaning, not the words. |

## Guardrails

**Never:**
- Use "should", "probably", "seems to" or "looks good" about the state of the work in place of evidence.
- Commit, push, open a pull request, merge or deploy without fresh verification.
- Pass on another agent's success report without checking its diff and running the checks.
- Claim a configuration change works from a status code alone.
- Claim UI work is done without having seen it rendered.
- Hide a failing, skipped or unverified item.

**Always:**
- Name the claim and the proof before running anything.
- Run the full command now and read every count in its output.
- Put the evidence next to the claim, in a table when there is more than one.
- Lead with what could not be verified.
- Say plainly when something is done and verified, without hedging.

## Connections

- `godmode:test-first`: supplies the red and green evidence for features and regression tests.
- `godmode:quality-gates`: supplies the lint, type, coverage, build, size and audit evidence.
- `godmode:code-review` and `godmode:cross-model-review`: run before the final verification; their fixes are re-verified here.
- `godmode:fault-diagnosis`: when the verification fails and the cause is not obvious.
- `godmode:delegated-execution`: every subagent's "done" passes through this gate before it is accepted.
- `godmode:merge-protocol`: landing happens only after this gate passes.
