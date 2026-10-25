# Cursor tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-other-harnesses.md;
https://cursor.com/docs/skills ; https://cursor.com/docs/subagents ; https://cursor.com/docs/reference/plugins ;
https://cursor.com/docs/rules ; https://cursor.com/docs/hooks ;
docs/plans/2026-10-25-godmode-2-design.md section 5 (install line and bootstrap). -->

GodMode skills speak in actions. In Cursor's agent they resolve as below. Cursor's docs do not name every internal tool; where a row says "not documented", use the fallback in that row.

## Action vocabulary

| Action in a skill | Cursor |
|---|---|
| Invoke a skill | the user types `/<skill>`; the agent also picks a skill by its description |
| Dispatch a subagent | the agent's Task tool, with a built-in subagent (`Explore` for read-only search, `Browser` for MCP browser control) or a custom one |
| Custom subagents | Markdown files in `.cursor/agents/`, `.claude/agents/`, `.codex/agents/` (or the same under `~/`); frontmatter `name`, `description`, `model`, `readonly`, `is_background` |
| Dispatch several in parallel | several Task calls in one message; they share the parent's checkout unless isolation is requested |
| Dispatch into its own worktree | ask for isolation: each subagent gets its own branch in a git worktree or a cloud VM; the parent merges |
| Message a teammate | not documented; route everything through the parent agent |
| Form a team | no team primitive; use parallel subagents |
| Create and track tasks | not documented in the pages above; keep a checklist in the plan file |
| Create a worktree | subagent isolation, or `git worktree add` in the terminal |
| Search the web | not documented in the pages above; use an MCP search server if configured, or ask the user for the page |
| Fetch library docs | the Context7 MCP server if configured (`mcp.json`); otherwise fetch the official page |
| Ask the user a question | end the turn with one plain question |

## Invoking GodMode skills

- Install: `/add-plugin` from the Cursor marketplace or from the repository (`.cursor-plugin/plugin.json`).
- User: `/<skill>`, for example `/task-planning`.
- Bootstrap: the plugin's `sessionStart` hook (`hooks/hooks-cursor.json`) prints `additional_context` with `using-godmode`.
- Fallback: read `skills/<skill>/SKILL.md` in the plugin directory.

## Models and effort (for `godmode:model-routing`)

- The model picker (including Auto) sets the parent agent's model.
- Custom subagents default to `model: inherit`; set a model ID such as `composer-2`, with bracketed options for effort, for example `claude-opus-5[effort=high]`.
- The parent can name a model when it launches a subagent. Built-in subagents choose their own (Explore uses a faster model).
- Cursor may fall back to another model when an admin blocks one or the plan lacks it; check the subagent's reported model.

## Memory (for `godmode:knowledge-capture`)

- Rules: `.cursor/rules/*.mdc` with `description`, `globs`, `alwaysApply`; plain `.md` there is ignored.
- `AGENTS.md` at the project root and in subdirectories.
- Propose rule changes to the user; do not add always-apply rules unasked.

## Reaching another model family (for `godmode:cross-model-review`)

- Launch a subagent with a model from another family than the author (for example a GPT model when a Claude model wrote the code), with the review brief as its prompt and `readonly: true`.
- Or run `codex exec -s read-only ...`, `claude -p ...` or `agy -p ...` in the terminal when installed (see the other reference files for the exact lines).
