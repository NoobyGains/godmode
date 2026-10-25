---
name: writing-skills
description: "Use when creating a new skill, editing or renaming an existing skill, reviewing a skill someone else wrote, or when a skill is not triggering, is being ignored, or is being rationalised away by agents."
---

# Writing Skills

A skill is code that runs on a model. Like code, it is written against a failing test: you first watch an agent get the task wrong without the skill, then write the smallest skill that fixes what you saw, then attack it until the agent stops finding ways around it. **If you never watched an agent fail without the skill, you do not know what the skill has to prevent.**

## The Prime Directive

```
NO SKILL SHIPS WITHOUT A BASELINE FAILURE AND A VERIFIED PASS
```

No exceptions. No workarounds. No shortcuts.

This applies to edits too. A "small wording fix" to a discipline skill can open a loophole; re-run its scenarios.

## When to Use

**Required:**
- Writing a new skill for GodMode or for a project.
- Changing a skill's description, Prime Directive, protocol steps or guardrails.
- A skill that should have triggered did not, or an agent loaded it and did something else.
- Reviewing a skill contribution.

**Skip:**
- One-off instructions for a single project: put them in the project's agent instructions file instead.
- Rules a machine can enforce (a lint rule, a validator check, a hook): automate them and keep the skill for judgement.
- Fixing a typo or a dead link that changes no instruction. Run the validator and move on.

## What Makes a Skill Worth Writing

Write a skill when the technique is not obvious to a capable model, applies across projects, and agents get it wrong without help. Three kinds:

| Kind | Example | How to test it |
|---|---|---|
| Discipline (a rule agents are tempted to break) | test-first, completion-gate | Pressure scenarios: does the agent comply when it wants not to? |
| Technique (a method with steps) | fault-diagnosis, performance-tuning | Application scenarios: does the agent apply it correctly to a new case? |
| Reference (facts to look up) | platform command tables | Retrieval scenarios: does the agent find and use the right entry? |

## The Protocol

1. **RED: capture the baseline failure.** Write three or more realistic scenarios for the behaviour the skill should produce (method and templates in [references/testing-skills.md](references/testing-skills.md)). Dispatch a fresh subagent per scenario with no access to the skill, or run the harness's eval tooling with a no-skill baseline. Record what each agent did and its rationalisations word for word. If the agents already behave correctly, stop: the skill is not needed.

2. **Write the description** from the triggers you observed (rules below), not from what the skill does.

3. **GREEN: write the smallest skill that fixes the observed failures**, using the GodMode template below. Address each recorded rationalisation explicitly; do not add rules for failures you did not see.

4. **Run the validator** from the repository root and fix every error for your skill:

   ```bash
   node scripts/validate.js
   ```

   The validator is the acceptance test for form: frontmatter, quoting, section order, length, cross-references, links and tool coupling. A skill with validator errors is not finished, whatever the scenarios say.

5. **Verify GREEN.** Run the same scenarios with the skill available. The agent must choose the right action and cite the skill's sections as its reason. Save the transcripts or the eval report.

6. **REFACTOR: close loopholes.** Run harder scenarios (three or more combined pressures). For every new rationalisation, add an explicit counter: a sentence in the protocol, a row in Cognitive Traps, an item in Guardrails, and, if it reveals a new trigger, a phrase in the description. Re-run until no new rationalisation appears.

7. **Check triggering separately.** Give a fresh agent a task that should trigger the skill without naming it, and one that should not. The skill must load for the first and stay out of the second.

8. **Record the evidence** in the pull request: the baseline failures, the passing runs, the rationalisations you countered, and the validator line.

## The GodMode Template

Every SKILL.md follows this shape. The description is wrapped in double quotes so YAML never misreads a colon in it.

````markdown
---
name: <directory-name>
description: "Use when <triggering situations only; no workflow summary; third person; under 400 characters>"
---

# <Title>

<Overview: 2-4 sentences. What this skill is for and the **core principle** in bold.>

## The Prime Directive

```
<ONE LINE, CAPITALS, THE RULE THAT CANNOT BE BROKEN>
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:** <bullets>
**Skip:** <bullets>

## The Protocol

<Numbered steps the agent follows. Add a dot digraph only where the flow genuinely branches. Each step says what to do and what evidence it leaves behind.>

<Optional H2 sections specific to the skill: templates, checklists, decision tables.>

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| <at least five rows> | |

## Guardrails

**Never:** <bullets>
**Always:** <bullets>

## Connections

- `godmode:<skill>`: <when this skill hands off to it or depends on it>
````

Form rules the validator enforces:

- `name` equals the directory name: lowercase letters, digits and single hyphens.
- The four sections The Prime Directive, When to Use, Cognitive Traps and Guardrails exist and appear in that order.
- 120 to 350 lines. Move tables, long examples and per-platform detail into `references/*.md` in the skill directory, linked with a relative link; every linked file must exist. Reference files over about 100 lines start with a short contents line, and references stay one level deep.
- Under 20,000 bytes, with The Prime Directive and The Protocol inside the first 8,000. After a compaction the harness keeps only the start of each invoked skill (Claude Code: the first 5,000 tokens per skill, 25,000 across all skills, newest first), so a rule that must survive the session sits near the top and reference material goes in `references/`.
- Frontmatter beyond `name` and `description` is harness-specific and must be harmless where it is ignored. `hooks` (a stop check armed when the skill is invoked, as in `godmode:completion-gate`) is honoured by Claude Code and ignored elsewhere; any other field needs a validator allowlist entry and a line in the harness reference. A rule the agent keeps skipping belongs in a hook, not in stronger wording.
- Cross-references are written `godmode:<name>` and must name an existing skill.

Voice: second person to the agent, "the user" for the human, plain words, no emoji, no marketing.

## Description Rules

The description is the only part of a skill every harness reads before deciding to load it. It is a trigger, not a summary.

1. **Starts with "Use when"** and lists the situations, symptoms and phrases that mean the skill applies.
2. **Triggers only, never the workflow.** Do not describe the steps. Tested failure mode: when a description summarised the process ("dispatches a subagent per task with a review between tasks"), agents followed the one-line summary and skipped the body, doing one review where the body required two. With a trigger-only description they read the body and followed it.
3. **Third person.** The description is injected into the system prompt; "I can help you" reads as the wrong speaker. The validator rejects first-person pronouns.
4. **Under 400 characters** (GodMode's limit; the open standard allows 1,024). Short descriptions keep the skill index cheap on every session start.
5. **Wrapped in double quotes**, so a colon or a leading special character never breaks the YAML.
6. **Concrete words an agent would match on:** symptoms ("flaky", "hangs", "not recognized"), situations ("before the first commit"), and user phrasings ("make it faster"). Name a technology only if the skill is specific to it.

<!-- Open-standard limits (name 64, description 1,024, body under 500 lines): https://agentskills.io/specification ; Anthropic best practices: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices (via docs/research/2026-10-25-claude-code-plugin-spec.md section 9) -->

## Actions, Not Tools

GodMode runs the same skill files on several harnesses, and each harness names its tools differently. A skill body therefore names **actions**: "dispatch a subagent", "create a task", "invoke `godmode:test-first`", "read the file", "search the web", "ask the user one question". It never names a harness's tool, a harness environment variable, a phrase of the form "the <product> tool", or harness-specific JSON.

The mapping from each action to each harness's real tool lives only in `skills/using-godmode/references/<harness>-tools.md`. If your skill needs a harness detail that is not there, add it to that reference (or ask its owner) instead of putting it in your skill. The validator's tool-coupling check fails the build on violations; the list of names it checks is in `scripts/validate.js`.

Shell commands (`git`, `npm test`, `pytest`) are fine: they are the same on every harness. OS environment variables such as `PATH` are fine where the skill is about the OS.

## Facts That Can Change

Any tool name, flag, version, URL, limit, price or "X supports Y" claim in a skill comes from a source you checked while writing it, not from memory. Put the URL and the date in an HTML comment beside the fact or in the reference file's sources section (`godmode:grounding` has the method). Prefer wording that stays true ("set `strict` explicitly") over wording that depends on a version default.

## Running Evals

Scenarios run by hand are the minimum. Where the harness has eval tooling, use it so results are repeatable and include a no-skill baseline.

<!-- Verified 2026-10-25 with `claude plugin eval --help` on Claude Code 2.1.310 -->

- **Claude Code** has a plugin eval runner: `claude plugin eval <plugin-path>`. Cases live in the plugin's `evals/` directory, one folder per case with a `prompt.md` (frontmatter such as `max_turns`, then the task) and `graders/*.md` (each with a `type`, for example `llm`, and the criteria), or a `case.yaml`. `claude plugin eval init --bare <name>` scaffolds a blank case. It runs each case several times (default 3, `--runs` to change), adds a no-plugin baseline arm and reports the score difference, writes an HTML report (published to claude.ai by default when the account supports it; `--no-publish` keeps it local), and exits non-zero below `--threshold`. Useful flags: `--case <glob>`, `--model`, `--judge-model`, `--max-cost-usd`. Each run is a full agent session on the user's own account, so it costs real usage; ask before running a large suite.
- **Other harnesses:** GodMode has not verified an equivalent eval runner. Run the scenarios as fresh headless sessions or subagents, once without the skill and once with it, and save the transcripts.
- **Model spread:** Anthropic's guidance is to test a skill on more than one model size. A skill that only works on the largest model will fail where `godmode:model-routing` puts cheaper models.
- **Form check for the open standard:** the agentskills.io reference validator (`skills-ref validate ./<skill>`) checks the standard's own frontmatter rules; GodMode's validator is stricter and remains the gate.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "The skill is obviously clear." | Clear to the author. Only an agent that did not write it can show you what it misreads. |
| "It's just a reference skill, no need to test." | Reference skills fail by not being found or by the wrong entry being used. Test retrieval. |
| "Testing is overkill for a small edit." | Small edits to discipline skills open loopholes. Re-run the scenarios. |
| "I'll describe the workflow in the description so it's easy to find." | Agents follow the summary and skip the body. Describe triggers only. |
| "The agent will know which tool I mean." | On another harness that tool does not exist. Name the action. |
| "I remember the flag." | Flags and limits change. Check the source and cite it. |
| "The scenarios passed once, it's done." | One pass under mild pressure proves little. Combine pressures and re-run after every refactor. |
| "Validator warnings don't matter." | Errors block; warnings usually point at a real trigger or tone problem. Read them. |

## Guardrails

**Never:**
- Write or edit a skill before running baseline scenarios without it.
- Put workflow steps, first-person wording or an unquoted value in the description.
- Name harness tools or harness environment variables in a skill body.
- State a changeable fact without a source.
- Ship with validator errors for the skill.
- Batch several new skills and test them together at the end.

**Always:**
- Record baseline rationalisations verbatim and counter each one explicitly.
- Follow the GodMode template and its section order.
- Run `node scripts/validate.js` and the scenarios again after every change.
- Test that the skill triggers when it should and stays out when it should not.
- Put the evidence in the pull request.

## Connections

- `godmode:test-first`: the RED, GREEN, REFACTOR cycle this skill applies to documentation.
- `godmode:grounding`: how to verify and cite every changeable fact in a skill.
- `godmode:using-godmode`: owns the per-harness tool references that skill bodies must not duplicate.
- `godmode:agent-briefing`: brief the subagents that run baseline and pressure scenarios.
- `godmode:model-routing`: choose which models the scenarios run on.
- `godmode:completion-gate`: a skill is done only with validator output and passing scenario evidence in hand.
