---
name: activation
description: Use when starting any conversation - establishes how to locate and invoke skills, mandating Skill tool usage before ANY response including clarifying questions
---

<CRITICAL-OVERRIDE>
When there is even a remote possibility that a skill is relevant to the current task, you MUST invoke it immediately.

YOU DO NOT HAVE THE OPTION TO SKIP A RELEVANT SKILL. IT IS MANDATORY.

This requirement is absolute. It cannot be reasoned away or deferred.
</CRITICAL-OVERRIDE>

## Accessing Skills

**Plugin installation (standard setup):** Invoke skills directly through the `Skill` tool. All protocols are auto-registered.
Example: `Skill("godmode:intent-discovery")`

**When the Skill tool cannot locate a protocol:** Fall back to reading the file directly with the Read tool:
1. Protocols live at: `[plugin-root]/skills/`
2. Each protocol has a definition: `[plugin-root]/skills/[protocol-name]/SKILL.md`
3. Read the SKILL.md and execute its instructions

**Locating the plugin root:**
- Running from the repository: the working directory is the plugin root
- Installed as a plugin: the `CLAUDE_PLUGIN_ROOT` environment variable contains the path

**Other platforms:** Consult platform-specific documentation for skill loading mechanisms.

# Working With Skills

## The Mandate

**Invoke applicable skills BEFORE generating any response or taking any action.** Even a marginal chance of relevance is sufficient reason to invoke. If an invoked skill turns out to be inapplicable, you can simply move on.

```dot
digraph protocol_flow {
    "Message arrives" [shape=doublecircle];
    "About to enter planning?" [shape=doublecircle];
    "Intent discovery done?" [shape=diamond];
    "Run intent-discovery" [shape=box];
    "Could any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Skill tool errored?" [shape=diamond];
    "Read SKILL.md fallback" [shape=box];
    "Announce: 'Applying [skill] for [goal]'" [shape=box];
    "Contains checklist?" [shape=diamond];
    "Track each checklist item" [shape=box];
    "Execute skill instructions" [shape=box];
    "Generate response" [shape=doublecircle];

    "About to enter planning?" -> "Intent discovery done?";
    "Intent discovery done?" -> "Run intent-discovery" [label="no"];
    "Intent discovery done?" -> "Could any skill apply?" [label="yes"];
    "Run intent-discovery" -> "Could any skill apply?";

    "Message arrives" -> "Could any skill apply?";
    "Could any skill apply?" -> "Invoke Skill tool" [label="yes, any chance"];
    "Could any skill apply?" -> "Generate response" [label="clearly not"];
    "Invoke Skill tool" -> "Skill tool errored?";
    "Skill tool errored?" -> "Read SKILL.md fallback" [label="yes"];
    "Skill tool errored?" -> "Announce: 'Applying [skill] for [goal]'" [label="no"];
    "Read SKILL.md fallback" -> "Announce: 'Applying [skill] for [goal]'";
    "Announce: 'Applying [skill] for [goal]'" -> "Contains checklist?";
    "Contains checklist?" -> "Track each checklist item" [label="yes"];
    "Contains checklist?" -> "Execute skill instructions" [label="no"];
    "Track each checklist item" -> "Execute skill instructions";
}
```

## Guardrails

These internal thoughts are warning signs that you are rationalizing:

| Thought | Truth |
|---------|-------|
| "This is a straightforward question" | Questions are tasks. Look for applicable skills. |
| "I should gather more context first" | Skill invocation precedes clarification. |
| "Let me scan the codebase first" | Skills define HOW to scan. Invoke first. |
| "I can check files and history quickly" | Files lack conversational context. Invoke skills. |
| "Let me collect some data first" | Skills prescribe data collection methods. |
| "This doesn't warrant a formal skill" | If a matching skill exists, it must be used. |
| "I recall what this skill says" | Skills get updated. Read the current version. |
| "This isn't really a task" | Any action is a task. Look for skills. |
| "The skill is too heavy for this" | Seemingly simple tasks often have hidden complexity. Use it. |
| "I'll do this one thing first" | Invoke BEFORE doing anything. |
| "I'm making good progress" | Undirected effort creates waste. Skills prevent this. |
| "I understand that concept already" | Understanding a concept is not the same as following a skill. Invoke it. |

## Skill Ordering

When several skills might be relevant, follow this sequence:

1. **Challenge skills first** (rationale) - question whether the work is worth doing before committing
2. **Process skills second** (intent-discovery, fault-diagnosis) - establish the approach
3. **Reference skills third** (reference-engine routes to: ux-patterns, design-research, github-search, codebase-research, system-design) - locate proven solutions before designing
4. **Design skills fourth** (ui-engineering, design-integration, specification-first) - apply references to guide decisions
5. **Implementation skills fifth** (test-first, project-bootstrap, pattern-matching, environment-awareness) - drive execution
6. **Quality skills sixth** (quality-enforcement, security-protocol, completion-gate, comprehension-check, error-recovery) - enforce standards
7. **Orchestration skills** (team-orchestration, delegated-execution) - leverage parallelism

"Let's build X" -> rationale -> intent-discovery -> reference-engine (routes to appropriate references) -> design skills -> implementation skills.
"Build a website" -> rationale -> intent-discovery -> reference-engine -> design-research + ux-patterns -> ui-engineering -> implementation.
"Fix this bug" -> fault-diagnosis first, then domain-appropriate skills. (rationale skipped for bugs)
"Big project" -> rationale -> intent-discovery -> reference-engine -> task-planning -> team-orchestration (when warranted).
"Agent is stuck" -> error-recovery activates proactively based on failure count detection.

## Execution Mode Guidance

When a user says "use godmode" for a task, evaluate the task and suggest the optimal execution strategy:

```dot
digraph execution_guidance {
    "Evaluate task" [shape=box];
    "Single atomic step?" [shape=diamond];
    "Handle directly" [shape=box];
    "Multiple independent parts?" [shape=diamond];
    "Requires peer coordination?" [shape=diamond];
    "Suggest Agent Teams" [shape=box style=filled fillcolor=lightgreen];
    "Suggest Parallel Delegation" [shape=box];
    "Multi-step sequence?" [shape=diamond];
    "Suggest Delegated Execution" [shape=box];
    "Suggest single-agent workflow" [shape=box];

    "Evaluate task" -> "Single atomic step?";
    "Single atomic step?" -> "Handle directly" [label="yes"];
    "Single atomic step?" -> "Multiple independent parts?" [label="no"];
    "Multiple independent parts?" -> "Requires peer coordination?" [label="yes"];
    "Multiple independent parts?" -> "Multi-step sequence?" [label="no"];
    "Requires peer coordination?" -> "Suggest Agent Teams" [label="yes"];
    "Requires peer coordination?" -> "Suggest Parallel Delegation" [label="no"];
    "Multi-step sequence?" -> "Suggest Delegated Execution" [label="yes"];
    "Multi-step sequence?" -> "Suggest single-agent workflow" [label="no"];
}
```

**Present the suggestion before acting:**

```
Based on my analysis, I suggest:

[Suggested strategy] because [reasoning]

- Agent Teams: [X] agents collaborating on [modules] concurrently
- OR Delegated Execution: [N] sequential tasks with review gates
- OR Parallel Delegation: [N] independent tasks running simultaneously
- OR Single agent: manageable enough to handle in one flow

Shall I proceed this way, or do you prefer a different approach?
```

## Skill Categories

**Rigid** (test-first, fault-diagnosis): Follow precisely. Do not deviate from the discipline.

**Flexible** (design patterns): Adapt the principles to fit the situation.

The skill definition itself indicates which category applies.

## User Directives

User directives specify WHAT needs to happen, not HOW. "Add X" or "Fix Y" does not mean bypass established workflows.
