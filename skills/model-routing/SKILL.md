---
name: model-routing
description: "Use when dispatching any subagent, teammate or reviewer, choosing a model or effort level for a piece of delegated work, escalating after an agent fails, or when a run's token or quota budget matters."
---

# Model Routing

Every seat in a run (implementer, reviewer, investigator, lead) needs a model and an effort level. Left unnamed, a dispatch inherits the session's model, which is usually the most capable and most expensive one, and the cost discipline of the whole run silently disappears.

**Core principle: give each seat the cheapest model that can do the job in few turns, name it and the effort on every dispatch, and escalate on evidence rather than by default.** Cheap is measured per finished task, not per token: a cheap model that needs three times the turns, or a second attempt, costs more than a mid-tier model that finishes once.

<!-- Model order facts: https://code.claude.com/docs/en/sub-agents and https://code.claude.com/docs/en/agent-teams (fetched 2026-10-25): an omitted per-dispatch model falls back to the agent definition, then a configured default, then the main session's model; teammates fall back to the lead's model, and teammates use significantly more tokens than subagents. Concrete model names, effort flags and how to pass them per harness: skills/using-godmode/references/<harness>-tools.md. -->

## The Prime Directive

```
NO DISPATCH WITHOUT A NAMED MODEL AND EFFORT
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Every subagent, teammate, reviewer or cross-model dispatch.
- Choosing the escalation step after an agent reports BLOCKED or a fix loop stalls.
- Planning a run whose cost or quota the user cares about.

**Skip:**
- Work you do yourself in the current session: the lead stays on the session model.

## The Tiers

This skill speaks in three tiers. Each harness reference maps them to that harness's current model names and effort settings; never hard-code a model name in a plan or brief from memory.

| Tier | Good at | Weak at |
|---|---|---|
| **Cheap** | Transcribing fully specified code, single-file mechanical edits, searches, summaries, classification, extracting text | Multi-step work from prose, judgment calls; tends to take many more turns |
| **Mid** | Implementing from a prose task, multi-file integration, per-task review, debugging with a clear reproduction | Architecture, subtle concurrency, very large diffs |
| **Top** | Architecture, design trade-offs, the final whole-branch review, escalations after mid-tier failure, adversarial review | Nothing on quality; spending it on bulk work wastes budget |

**Effort.** Where the harness has an effort or reasoning setting, set it per seat too: low for transcription and searches, medium for routine implementation and task review, high for architecture, final review and escalations. The highest settings are for problems that have already failed at high.

## Seat Defaults

| Seat | Default | Move up when | Move down when |
|---|---|---|---|
| Implementer, plan contains the complete code | Cheap, low | the task touches several files or tests are non-trivial | (already lowest) |
| Implementer, task described in prose | Mid, medium | it needs design judgment or broad codebase understanding | it is one file with an exact spec |
| Batched same-shape edits | Cheap, low | the edits are not truly identical in shape | |
| Task reviewer | Mid, medium (the floor for reviewers) | the diff is subtle: concurrency, security, data migration | never below mid |
| Scoped re-review of a small fix | Mid, low effort (the reviewer floor holds; only the effort drops) | the fix is larger than the finding implied | never below mid |
| Final whole-branch review | Top, high | | never; this is the one fresh context the run buys |
| Fix rounds 4-5 implementer | One tier above the stuck implementer | | |
| Bulk reading, searching, summarising for the lead | Cheap, low | the summary needs judgment | |
| Investigator in a diagnosis | Mid, medium | the hypothesis space is large or adversarial | |
| Cross-model reviewer | The other family's strongest affordable model | | |
| Lead / controller | The session model | | |

## The Protocol

1. **Classify the seat** using the table above. Read the task's complexity signals: number of files, whether the exact code is given, whether design judgment is needed, the risk of the change.

2. **Pick tier and effort.** Start from the seat default and apply the move-up and move-down columns. When torn between two tiers for implementation, choose the higher one: a failed cheap attempt plus a retry costs more than one mid-tier success.

3. **Name both on the dispatch.** Use the harness reference to translate the tier into the model name and effort setting that harness accepts. If the harness cannot set a model per dispatch, say so in the ledger once and note that every seat runs on the session model.

4. **Keep the lead on the session model, and keep it light.** The lead coordinates, rules and reads short replies. It does not read whole directories or long logs: send bulk reading to a cheap-tier agent that returns a summary or writes a file.

5. **Escalate on evidence, one step at a time.** The ladder:
   1. Same model, more context (the agent said NEEDS_CONTEXT, or the brief was missing a fact).
   2. Same model, smaller task (the task was too large to hold).
   3. One tier up, fresh agent, carrying the report file of what was tried.
   4. Top tier at high effort.
   5. A different model family (`godmode:cross-model-review`), or a ruling by the lead, or the user when it is one of the four stop conditions.
   Never retry the same model with the same brief unchanged.

6. **Choose the cheapest execution mode first.** Direct work, then `godmode:inline-execution`, then `godmode:delegated-execution` or `godmode:parallel-execution`, and `godmode:team-orchestration` last. Every teammate is a separate full instance and token use grows with each one; form a team only when teammates must coordinate mid-work.

7. **Record cost in the ledger.** One `Cost:` line per task naming each seat's tier, effort and dispatch count (format in `godmode:delegated-execution`'s ledger reference). Add token or cost figures when the harness reports them. At the end, sum the lines per seat in the final message so the user sees where the run spent, and note any seat that should change tier next time.

8. **Respect quotas.** If the user runs on subscription limits (rolling windows, weekly caps), check the remaining allowance where the harness exposes it before a large fan-out, and prefer fewer, better-briefed agents over many.

## Signals That a Tier Is Wrong

- **Too low:** many turns spent reading without progress; BLOCKED on a task that a stronger model would find routine; review findings about misunderstood requirements; fix loops reaching round 3.
- **Too high:** a top-tier model transcribing provided code; a top-tier reviewer on a ten-line rename; the lead reading every file itself.

Record either signal as a ledger note so the next plan starts from better defaults.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "The default model is fine, skip naming it" | The default is usually the session's most expensive model. Name it. |
| "Cheapest model everywhere saves the most" | Cheap models take more turns and fail more often on prose tasks. Cost per finished task is what counts. |
| "Use the top model for everything to be safe" | Most implementation from a good plan is transcription. Spend the top tier where judgment is needed. |
| "The reviewer can be cheap, the implementer was careful" | Reviewers are the gate. Mid tier is the floor. |
| "It failed, run it again" | Retrying unchanged buys the same failure. Change context, size or tier. |
| "A team will be faster" | It will be more expensive. Faster only matters if teammates must talk mid-work. |
| "I'll read the codebase myself, it's quicker" | The lead's context is the run's scarcest resource. Delegate bulk reading to a cheap tier. |

## Guardrails

**Never:**
- Dispatch without a model and effort.
- Hard-code a model name from memory; use the harness reference.
- Put the final whole-branch review below the top tier.
- Escalate more than one rung at a time without a recorded reason.
- Form a team when subagents would do.

**Always:**
- Write one `Cost:` line per task in the ledger.
- Keep the lead on the session model and off bulk reading.
- Carry the previous attempt's report file into every escalation.

## Connections

- `godmode:using-godmode`: chooses the execution mode; its harness references translate tiers into model names and effort settings.
- `godmode:delegated-execution`, `godmode:inline-execution`, `godmode:parallel-execution`, `godmode:team-orchestration`: every dispatch they make applies this skill.
- `godmode:agent-briefing`: the brief that travels with the named model.
- `godmode:cross-model-review`: the last rung of the escalation ladder and the pre-landing second opinion.
