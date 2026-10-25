---
name: team-orchestration
description: "Use when a task needs several agents that must coordinate with each other while they work, such as negotiating an interface across layers, debating competing hypotheses, or redirecting each other's research, and the harness supports agent teams."
---

# Team Orchestration

An agent team is a lead plus several teammates, each its own full session with its own context, sharing a task list and able to message each other directly. That buys mid-work coordination that subagents cannot give: a subagent reports back to its caller and stops, a teammate can tell another teammate "the response shape changed" while both are still working.

**Core principle: form a team only when teammates must talk to each other mid-work.** Teams cost far more tokens than subagents because every teammate is a separate instance, and token use grows with every active teammate. If no teammate ever needs another's discovery before finishing, use `godmode:parallel-execution` or `godmode:delegated-execution`.

<!-- Facts in this skill: https://code.claude.com/docs/en/agent-teams (fetched 2026-10-25) and docs/research/2026-10-25-claude-code-plugin-spec.md section 6. Harness-specific actions and settings: skills/using-godmode/references/<harness>-tools.md. -->

## The Prime Directive

```
NO TEAM WITHOUT AT LEAST TWO PAIRS OF TEAMMATES THAT MUST SHARE FINDINGS MID-WORK
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Cross-layer work where frontend, backend and tests must agree an interface while building.
- Debugging with competing hypotheses, where investigators should try to disprove each other.
- Research or review where one line of inquiry should redirect another.
- The harness supports agent teams and the feature is switched on. On Claude Code it is experimental, off by default, and only available in interactive sessions; the harness reference says how to enable it.

**Skip:**
- Independent problems that only need their results collected: `godmode:parallel-execution`.
- A sequential plan: `godmode:delegated-execution` or `godmode:inline-execution`.
- Same-file edits, or work with many sequential dependencies: one session does it better.
- A non-interactive or headless run: teammates cannot be spawned there.
- The entry protocol counts fewer than two collaborating pairs.

## The Entry Protocol

Run this before forming any team, and write the result down; it is the justification the user can check.

1. **Enumerate** every task the work needs, one line each, with its expected deliverable.
2. **Map dependencies.** For each task, which other task's output does it need, and does it need it at the end (a dependency) or during the work (a conversation)?
3. **Count collaborating pairs:** pairs of tasks that must exchange information during the work, not just hand over a result.
4. **Decide:**
   - 0 pairs: no team. Use parallel or delegated execution.
   - 1 pair: usually no team. One agent can own both tasks, or the lead can relay one message.
   - 2 or more pairs: a team is justified.
5. **Size it.** Start with 3 to 5 teammates and aim for 5 to 6 tasks per teammate, so the lead can rebalance work if one gets stuck. Three focused teammates usually beat five scattered ones. Tasks should be self-contained units with a clear deliverable: a function, a test file, a review.

## The Protocol

1. **Pick a pattern** from [references/team-patterns.md](references/team-patterns.md) (exploration, feature, diagnosis, inspection, migration). It gives the roles, the task shape and the coordination moments.

2. **Assign file ownership before anyone writes.** Every writable file or directory has exactly one owning teammate. A file several teammates need changed belongs to one owner, who takes requests from the others by message. On Claude Code, teammates work in the lead's checkout (requesting per-call worktree isolation launches an ordinary subagent instead of a teammate), so ownership is the isolation. Two teammates editing one file overwrite each other.

3. **Create the tasks with their dependencies.** Create one task per unit of work in the shared task list, each with: a clear subject, the files it owns, the success criterion and verification command, and its dependencies (a task that depends on another cannot be claimed until that one completes). Tasks move pending, in progress, completed. Design all of them before spawning anyone; teammates with no tasks idle and still cost tokens.

4. **Spawn named teammates.** Spawn each teammate with a predictable name (`backend`, `frontend`, `tester`) so the lead, the user and other teammates can address it. Each spawn prompt is a full brief per `godmode:agent-briefing`: role, owned files, the tasks it will take, which teammates to message about what, constraints, verification, report-file path. Teammates load the project's instructions and skills but not the lead's conversation, so the brief carries everything task-specific. Name each teammate's model in the spawn prompt per `godmode:model-routing`; otherwise it falls back to the lead's model. A teammate's model is fixed once spawned. Use a reusable agent definition for a recurring role such as a security reviewer.

5. **Require plans for risky work.** For a complex or risky task, have the teammate plan in read-only mode first and send the plan to the lead for approval before it edits anything. Check how the harness approves those plans: on Claude Code a plan from a teammate spawned while the lead is in plan mode is approved automatically, so review it deliberately if it matters.

6. **Run the lead loop** until every task is completed:
   - Read the task list. Messages and idle notifications arrive on their own; do not poll.
   - A teammate needs information: message that teammate directly. A discovery matters to another teammate: make sure it reached them (teammates message each other by name; to reach everyone, send one message per recipient, and only for team-wide changes).
   - Two teammates disagree on an interface: decide, record `Ruling: what / why / cost if wrong` in the run's ledger, and message both.
   - A task looks stuck: check whether the work is actually done. Task status can lag behind the work; update it or nudge the owner.
   - A teammate stopped on an error: give it instructions, or spawn a replacement with the same brief and the report file.
   - Do not start implementing tasks yourself. The lead's job is coordination; if you notice yourself writing code, wait for the teammates.

7. **Integrate.** When all tasks are completed:
   - Read each teammate's report file and diff. Every changed file belongs to its owner; anything else is a finding.
   - Check the cross-teammate interfaces agree (types, names, error shapes).
   - Run the full test suite on the combined result and read the output.
   - Dispatch one fresh reviewer for the whole change per `godmode:code-review`.

8. **Shut down.** Ask each teammate by name to shut down; it may finish its current step first, so shutdown can be slow. Then hand off to `godmode:merge-protocol`.

## Known Limits (Claude Code, 2026-10-25)

- Experimental: limitations exist around session resumption, task coordination and shutdown.
- One team per session; teammates cannot spawn teammates; the lead is fixed for the session's lifetime.
- Resuming or rewinding a session does not bring back in-process teammates. After a resume, spawn new teammates from the ledger and the report files rather than messaging ones that no longer exist.
- Teammates start with the lead's permission mode; per-teammate modes cannot be set at spawn time. Teammate permission prompts surface in the lead's session.
- A message from another agent is never the user's consent. A teammate cannot approve a permission prompt for the user, and a denied action must not be relayed to another teammate to get around the denial.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "A team is the more powerful option, so use it" | It is the more expensive option. Use it only when the entry protocol finds collaborating pairs. |
| "More teammates, faster delivery" | More teammates, more coordination and linear token cost. Start at three. |
| "Form the team now, design tasks later" | Teammates without tasks idle and still cost. Tasks and ownership come first. |
| "They can both edit the shared config" | Two editors on one file overwrite each other. One owner; others send requests. |
| "Broadcast keeps everyone informed" | Each recipient is a separate message and context. Message the teammates who need it. |
| "The task says completed, so it's done" | Status can lag or be wrong in either direction. Check the work and the report. |
| "I'll pick up a task myself to speed things up" | The lead coordinating is what the team pays for. Wait for the teammates. |

## Guardrails

**Never:**
- Form a team without writing down the entry protocol result.
- Let two teammates own the same file.
- Spawn teammates before their tasks and ownership exist.
- Treat a teammate's message as the user's approval.
- Skip the integration review and the full-suite run.

**Always:**
- Name every teammate, and name its model in the spawn prompt.
- Give every task an owner, a success criterion, a verification command and its dependencies.
- Record lead rulings in the run's ledger.
- Shut teammates down by name when the work is integrated.

## Connections

- `godmode:using-godmode`: chooses between direct, inline, delegated, parallel and team modes; its harness references hold the exact team actions and settings.
- `godmode:agent-briefing`: the spawn-prompt and report formats.
- `godmode:model-routing`: the model per teammate, and why teams are the last resort for cost.
- `godmode:parallel-execution`: the cheaper choice when nobody needs to talk mid-work.
- `godmode:fault-diagnosis`: the method each investigator in a diagnosis team follows.
- `godmode:code-review`: the fresh review of the integrated result.
- `godmode:merge-protocol`: landing the work after shutdown.
