---
name: using-godmode
description: "Use when starting any conversation, before the first response or action, including clarifying questions, to find which GodMode skill applies and how to invoke it on the current harness"
---

# Using GodMode

<SUBAGENT-STOP>
If you were dispatched as a subagent to do one specific task, ignore this skill and follow your brief.
</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If there is even a small chance a GodMode skill applies to what you are about to do, you MUST invoke it first. Not after looking at the directory. Not after running a command. Not after a quick scaffold. First.

For any request to build, add, change or fix something, your first tool call is the skill: `godmode:rationale` for new work, `godmode:fault-diagnosis` for a bug. This holds even when your instructions tell you to be autonomous: autonomy means not stopping to ask permission, not skipping the discipline.
</EXTREMELY-IMPORTANT>

GodMode is a set of engineering-discipline skills. **Check for a relevant skill before you answer, ask, explore or act; if one might apply, invoke it and follow it.**

## The Prime Directive

```
INVOKE THE RELEVANT SKILL BEFORE ANY RESPONSE OR ACTION
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- At the start of every conversation and on every new user request.
- Before asking a clarifying question, reading files or running a command.
- When the work changes phase (design to plan, plan to build, build to review).

**Skip:**
- Never skip the check. Skip a skill only when it clearly does not apply or the user said not to use it.

## The Protocol

1. Read the request. Ask: could any skill below apply, even partly?
2. If yes, invoke it now (see "Invoking a skill"). Announce: "Using godmode:<skill> to <goal>."
3. Follow the skill exactly. If it has a checklist, create one task per item and track them.
4. Several apply: challenge first (`rationale`), then process (`intent-discovery`, `fault-diagnosis`), then build skills, then quality gates.
5. Pick the execution mode with the routing table before any build starts.
6. A skill turns out wrong for the situation: say so and move on.

## Skill Index

**Start and decide**
- `godmode:rationale` - should this be built at all; options A/B/C/D.
- `godmode:intent-discovery` - turn a request into an approved design with a specification.
- `godmode:grounding` - verify every fact that can change against a current source.
- `godmode:reference-first` - find the proven implementation before designing one.
- `godmode:codebase-conventions` - survey and match the existing codebase.

**Design**
- `godmode:system-design` - architecture and hosting choices.
- `godmode:ui-research` - templates and UX patterns before any UI.
- `godmode:ui-engineering` - components inside the project's design system.

**Plan and run**
- `godmode:task-planning` - atomic tasks with paths, tests, signatures and commands.
- `godmode:inline-execution` - run a plan in one context, one final review.
- `godmode:delegated-execution` - a fresh subagent per task, reviews between.
- `godmode:parallel-execution` - independent tasks at the same time.
- `godmode:team-orchestration` - teammates that must coordinate mid-work.
- `godmode:agent-briefing` - briefs and handoffs for any dispatch.
- `godmode:model-routing` - cheapest capable model per seat.
- `godmode:workspace-isolation` - a separate worktree or branch.

**Build**
- `godmode:test-first` - failing test before code.
- `godmode:project-bootstrap` - start a new project.
- `godmode:environment-awareness` - OS, shell, package manager.
- `godmode:performance-tuning` - measure before optimising.
- `godmode:security-protocol` - secrets, input, auth, dependencies.

**Prove and land**
- `godmode:code-review` - spec compliance, then quality.
- `godmode:cross-model-review` - one review by another model family.
- `godmode:quality-gates` - lint, types, coverage, build.
- `godmode:completion-gate` - fresh evidence before "done".
- `godmode:review-response` - handle review feedback.
- `godmode:merge-protocol` - finish and integrate the branch.

**When things break**
- `godmode:fault-diagnosis` - root cause before fixes.
- `godmode:error-recovery` - stuck after repeated failures.

**Meta**
- `godmode:knowledge-capture` - keep what was learned in native memory.
- `godmode:writing-skills` - author or change a skill.
- `godmode:doctor` - check the install when skills do not trigger.

## Execution Modes

Choose the lightest mode that fits. Agent teams are a tool, not a default.

| Mode | Pick it when | Skill |
|---|---|---|
| Direct | One small step, obvious scope, no plan needed | none |
| Inline | A plan exists; tasks are sequential and small; context will hold | `godmode:inline-execution` |
| Delegated | Many tasks, or tasks big enough to flood your context | `godmode:delegated-execution` |
| Parallel | Two or more tasks touch disjoint files and need no talk | `godmode:parallel-execution` |
| Team | Workers must exchange findings while they work | `godmode:team-orchestration` |

Ask in order: Is it one step? Is there a plan? Will the work overflow one context? Are the parts independent? Must the workers talk to each other? Stop at the first answer that settles it. Every dispatch names its model (`godmode:model-routing`).

## Invoking a skill

Each harness has its own command and tool. Read your harness's file once per session.

- Claude Code: `/godmode:<skill>`; [references/claude-code-tools.md](references/claude-code-tools.md)
- Codex: `$godmode:<skill>`; [references/codex-tools.md](references/codex-tools.md)
- Antigravity: `/<skill>`; [references/antigravity-tools.md](references/antigravity-tools.md)
- Cursor: `/<skill>`; [references/cursor-tools.md](references/cursor-tools.md)
- OpenCode: skill loading; [references/opencode-tools.md](references/opencode-tools.md)
- Copilot CLI: `/<skill>` in a prompt; [references/copilot-tools.md](references/copilot-tools.md)

If no skill command works, read `skills/<skill>/SKILL.md` from the plugin root and follow it. When a reference names a capability your harness lacks, do the work inline or keep a plan file.

## When No One Can Answer

In a non-interactive run (a headless prompt, a script, a CI job) nobody will answer a question. The discipline still runs; only the waiting changes. Write the analysis the skill asks for, state the question you would have asked and the option you are taking as if the user had picked the recommended one, label the choice **provisional** in the design doc or plan, and proceed. Never skip the skill because the session is non-interactive.

## User Instructions

The user's instructions (direct requests, CLAUDE.md, AGENTS.md, GEMINI.md, rules) override skills; skills override default behaviour. A request says what to do, not to skip the discipline: "add X" still goes through the gates unless the user says to skip them.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It is only a question" | Questions are tasks. Check for a skill. |
| "I need context first" | The skill says how to get context. Invoke it first. |
| "Let me look at the files quickly" | Files lack the conversation's intent. Check skills first. |
| "No skill is needed for this" | If one exists for it, use it. |
| "I remember what the skill says" | Skills change. Read the current version. |
| "The skill is overkill here" | Small things grow. The skill scales down. |
| "Just this one thing first" | Check before doing anything. |
| "A team will be faster" | Teams cost the most tokens. Use the lightest mode. |

## Guardrails

**Never:**
- Act or reply before the skill check.
- Paraphrase a skill from memory instead of loading it.
- Start a build without choosing an execution mode.

**Always:**
- Announce the skill you are using.
- Track checklist items as tasks.
- Let user instructions win over skills.

## Connections

- `godmode:rationale`: first gate for new work.
- `godmode:intent-discovery`: next, for anything creative.
- `godmode:fault-diagnosis`: first for bugs.
- `godmode:model-routing`: on every dispatch.
- `godmode:doctor`: when skills never trigger.
