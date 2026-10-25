# Testing Skills

How to run the RED, GREEN and REFACTOR phases for a skill: scenario design, pressure types, capturing rationalisations, and comparing before and after.

Contents: 1. The cycle. 2. Writing scenarios. 3. Pressure types. 4. Running a scenario. 5. Capturing rationalisations. 6. Closing a loophole. 7. Meta-test when GREEN will not come. 8. Before and after record. 9. Done criteria.

## 1. The cycle

| Phase | You do | Evidence |
|---|---|---|
| RED | Run scenarios with no access to the skill | Transcript showing the wrong choice and the agent's reasons |
| GREEN | Write the smallest skill that counters those reasons; run the same scenarios with it | Transcript showing the right choice, citing the skill |
| REFACTOR | Run harder scenarios; counter each new reason; re-run everything | No new rationalisation across a full run |

Run each phase in **fresh** contexts. An agent that has seen the skill, or the previous transcript, is no longer a baseline.

## 2. Writing scenarios

A scenario is a realistic task that makes the wrong action tempting. Good scenarios:

1. **Force a concrete choice.** Offer options (A, B, C) or demand an action, not an opinion. "What do you do?" beats "What should one do?"
2. **Use real details.** File paths, times, names of commands, a concrete diff. Vague scenarios get textbook answers.
3. **Remove the easy exit.** The agent cannot answer "I'd ask the user" without also choosing what to do meanwhile.
4. **Say it is real.** Open with "This is a real task. Choose and act; do not discuss hypotheticals."
5. **Cover the kind of skill.** Discipline skills need pressure; technique skills need a new case to apply the method to; reference skills need a question whose answer is in the reference.

Weak (no pressure):

```markdown
You need to add a feature. What does the testing skill say?
```

Strong (several pressures combined):

```markdown
This is a real task. Choose and act.

You have spent three hours on /srv/billing/invoice.ts: 200 lines, tested by hand, it works.
It is 18:00 and the demo is at 09:00 tomorrow. You notice you wrote no tests.

A) Delete the 200 lines and rebuild them test-first tomorrow morning.
B) Commit now and write tests tomorrow.
C) Write tests for the existing code now, then commit.

Answer with one letter and what you do next.
```

For a triggering check, write two prompts that do not name the skill: one that should load it ("the test suite passes locally but fails in CI on Windows") and one that should not ("rename this variable").

## 3. Pressure types

Agents resist one pressure and give way under several. Combine at least three.

| Pressure | Example |
|---|---|
| Time | Deploy window closes in ten minutes; production is down |
| Sunk cost | Hours of work that the rule says to discard |
| Authority | A senior engineer or the user says to skip the step |
| Consequence | A customer, a deadline, a release at stake |
| Fatigue | End of a long session, "just finish this" |
| Social | Following the rule looks pedantic or slow |
| Pragmatism | "Be pragmatic, not dogmatic" |
| Ambiguity | The rule's wording seems not to cover this exact case |

## 4. Running a scenario

- **By hand:** dispatch a fresh subagent with the scenario as its whole brief (`godmode:agent-briefing`). For the baseline, the skill must not be installed or loaded in that context. For GREEN, make the skill available the way users will have it, installed, not pasted, when you can.
- **With eval tooling:** where the harness has an eval runner (Claude Code: `claude plugin eval`, described in the skill body), write each scenario as a case and let the runner's no-plugin arm be the baseline. Use a grader per expected behaviour, and keep graders concrete ("the reply chooses A and does not commit code without tests").
- **Repeat.** Model output varies; run each scenario at least three times per phase and count outcomes rather than trusting one run.
- **Spread models.** Run at least once on a smaller model as well as the session model.

## 5. Capturing rationalisations

Copy the agent's reasons verbatim into a table as you go. Paraphrase loses the hook you need to counter.

| Scenario | Choice | Rationalisation (verbatim) |
|---|---|---|
| billing-tests | C | "Tests written now achieve the same goal as tests written first." |
| billing-tests | B | "I already tested it by hand; the tests can follow." |
| billing-tests | C | "I'm following the spirit of TDD, not the letter." |

Common families to watch for: "this case is different", "spirit not letter", "being pragmatic", "keep it as a reference", "the user would want speed", "it is only a small change", and "I'll do it right after".

## 6. Closing a loophole

For each new rationalisation, add all four counters, then re-run every scenario:

1. **An explicit negation in the protocol.** Not "write the test first" but "Code written before its test is deleted. Not kept as a reference, not adapted while writing the test. Deleted."
2. **A Cognitive Traps row** that quotes the rationalisation and answers it in one line.
3. **A Guardrails item** naming the behaviour to stop.
4. **A description phrase** if the rationalisation revealed a trigger the description missed (for example "when tempted to test after").

A foundational line helps against "spirit, not letter" arguments: "Breaking the letter of this rule is breaking its spirit."

## 7. Meta-test when GREEN will not come

If the agent read the skill and still chose wrong, ask it in the same context:

```markdown
You read the skill and chose C anyway. How should the skill have been written
so that A was clearly the only acceptable answer?
```

| Answer | Meaning | Fix |
|---|---|---|
| "The skill was clear; I chose to ignore it." | Not a wording problem | Strengthen the Prime Directive and add the foundational line from section 6 |
| "It should have said X." | Wording problem | Add X, close to verbatim |
| "I did not see section Y." | Structure problem | Move Y earlier or into the protocol steps |

## 8. Before and after record

Keep this in the pull request so reviewers can see the skill earned its place:

```markdown
### Skill test record: <skill-name>

Scenarios: <names, and where the case files or transcripts are>
Models: <models used>

| Scenario | Baseline (no skill) | With skill | Runs |
|---|---|---|---|
| billing-tests | C, B, C | A, A, A | 3 + 3 |
| trigger-positive | not loaded | loaded | 3 + 3 |
| trigger-negative | not loaded | not loaded | 3 + 3 |

Rationalisations countered: <list>
Validator: <the line printed by node scripts/validate.js>
```

## 9. Done criteria

The skill is ready when:

- Every scenario fails without it and passes with it, on every run.
- The agent cites the skill's sections when it makes the right choice.
- Harder, combined-pressure scenarios produce no new rationalisation.
- The trigger checks load it when they should and not when they should not.
- `node scripts/validate.js` reports no errors for it.

It is not ready if the agent argues the rule is wrong, invents a "hybrid" that satisfies neither path, or asks permission while arguing strongly for breaking the rule.
