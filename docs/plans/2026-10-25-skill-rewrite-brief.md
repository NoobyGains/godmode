# Skill rewrite brief (GodMode 2.0)

Read first: `docs/plans/2026-10-25-godmode-2-design.md` sections 2, 3 and 4. They are binding. This brief adds the mechanics.

## What you are producing

For each skill assigned to you: `skills/<name>/SKILL.md` (and `skills/<name>/references/*.md` or supporting files where the design says so), written fresh for 2.0. The 1.0 skills are in the same directory tree under their old names; read them for the ideas worth keeping, then write the 2.0 skill from scratch in your own words. Delete the 1.0 directories that your 2.0 skills replace (`git rm -r skills/<old>`), so that `ls skills/` ends up holding only 2.0 names.

Source material you may draw on (ideas, not copy): the 1.0 skill, the matching superpowers 7.0.0 skill installed at `C:\Users\David\.claude\plugins\cache\claude-plugins-official\superpowers\7.0.0\skills\` (MIT; take mechanisms such as the progress ledger, rulings, model selection, bounded fix loops, report files, and rewrite them in GodMode's voice), and the research reports in `docs/research/`.

## The template (every SKILL.md)

```markdown
---
name: <directory-name>
description: Use when <triggering situations only; no workflow summary; third person; under 400 characters>
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

<Numbered steps the agent follows. Add a ```dot digraph only where the flow genuinely branches. Each step says what to do and what evidence it leaves behind.>

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
```

## Hard rules (the validator enforces most of them)

1. `name` equals the directory name. `description` starts with "Use when", is third person, under 400 characters, and describes only when to trigger. Never summarise the process in the description: a tested failure mode is that the model follows the description instead of the body.
2. Body names **actions, not tools**. Write "dispatch a subagent", "create a task", "invoke `godmode:test-first`", "read the file", "search the web", "ask the user one question". Never write a harness tool name (`Agent`, `Task`, `TodoWrite`, `TeamCreate`, `SendMessage`, `TaskCreate`, `invoke_subagent`, `spawn_agent`, `write_to_file`), the phrases "Agent tool" / "Task tool" / "Skill tool", a harness environment variable, or harness-specific JSON. Those belong only in `skills/using-godmode/references/<harness>-tools.md`. Shell commands (`git`, `npm test`, `pytest`) are fine.
3. 120 to 350 lines. Reference material beyond that goes in `references/*.md` inside the skill directory and is linked with a relative link.
4. Cross-references use `godmode:<2.0-name>` only (see the mapping table in the design doc section 3). Every reference must resolve.
5. Facts that can change (tool names, flags, environment variables, URLs, limits, prices, library APIs, "X supports Y") must come from `docs/research/` or from a source you fetch yourself with web search during the rewrite. Put the URL in an HTML comment next to the fact or in the reference file. Nothing from memory.
6. Voice: plain and direct, second person to the agent, "the user" for the human, no emoji, no marketing. Keep the GodMode cadence (Prime Directive in capitals, "No exceptions. No workarounds. No shortcuts."), but do not pad with repetition.
7. Do not edit files outside your assigned skill directories (and the 1.0 directories they replace). The README, validator, manifests and other groups' skills are owned elsewhere.
8. When you finish, run `node scripts/validate.js` from the repository root and fix every error that names one of your skills. Warnings about other skills are not yours. Report: the list of files you wrote and deleted, the validator line for your skills, and any fact you could not verify (say so plainly rather than guessing).

## Groups

Each worker owns one group. The new 2.0 name is first; the 1.0 names it replaces follow in brackets.

**A. Core loop** — `using-godmode` [activation] with `references/` for claude-code, codex, antigravity, cursor, gemini, opencode, copilot (from the research reports; each file maps the action vocabulary to that harness's real tools and says how a skill is invoked there), `rationale`, `intent-discovery` [intent-discovery + specification-first], `grounding` (new), `task-planning`, `knowledge-capture` (rewritten to use native harness memory).

**B. Execution** — `delegated-execution` (upgraded, with `implementer-prompt.md`, `reviewer-prompt.md`, `re-review-prompt.md`), `inline-execution` [task-runner], `parallel-execution`, `team-orchestration` (actions only; the Claude Code team tool table moves to group A's `claude-code-tools.md`, so coordinate by writing what that reference must contain into your report), `agent-briefing` [agent-messaging], `workspace-isolation`, `model-routing` (new), `merge-protocol`.

**C. Quality** — `test-first`, `code-review` [quality-gate + comprehension-check; also refresh `agents/code-reviewer.md` frontmatter and move `skills/quality-gate/code-reviewer.md` here as `reviewer-template.md`], `cross-model-review` (new), `quality-gates` [quality-enforcement], `completion-gate`, `review-response`, `fault-diagnosis` (keep its supporting method files), `error-recovery`.

**D. Research and design** — `reference-first` [reference-engine + github-search; domain libraries and the search method become `references/`], `codebase-conventions` [codebase-research + pattern-matching], `ui-research` [design-research + ux-patterns; pattern libraries and token templates become `references/`], `ui-engineering` [ui-engineering + design-integration], `system-design` [system-design + deployment-advisor].

**E. Platform and meta** — `environment-awareness`, `project-bootstrap` (keep `templates.md`), `security-protocol`, `performance-tuning`, `writing-skills` [protocol-authoring; drop the Graphviz renderer, keep a short `testing-skills.md`].

## The new skills, in one paragraph each

- **grounding**: the agent treats anything it "remembers" about an API, CLI, library, platform rule, version, price or limit as a hypothesis. Before writing code or config against it, or stating it to the user, it verifies against a current primary source (official docs, the library's own repository or changelog, a documentation service such as Context7, or a web search that lands on an authoritative page), records the source and date in the plan or the message, and prefers the source over memory when they disagree. It defines the classes of facts that can change, a verification ladder from cheapest to most thorough, what to do when sources conflict or are missing, and how to budget the checking so it stays proportional.
- **model-routing**: every dispatch names its model and effort; the cheapest model that can do the job takes the seat (mechanical transcription and small fixes on the cheap tier, integration and review on the mid tier, architecture and the final whole-branch review on the top tier); turn count matters more than token price; the lead stays on the session model and never spends it on bulk reading; agent teams only when teammates must coordinate mid-work. Per-harness model names and effort flags live in group A's references, not here.
- **cross-model-review**: before landing, one narrow read-only review by a reviewer from a different model family than the author, driven by a brief file (exact files, exact questions, no sub-agents), one round; the author reconciles findings with evidence; falls back to a fresh same-family reviewer when no other family is reachable; records which family reviewed. How to reach another family on each harness is in group A's references.
