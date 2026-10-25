# OpenCode tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-other-harnesses.md;
https://opencode.ai/docs/skills/ ; https://opencode.ai/docs/tools/ ; https://opencode.ai/docs/agents/ ;
https://opencode.ai/docs/plugins/ ; https://opencode.ai/docs/rules/ .
The tools page does not list `task`; the agents page ties subagent calls to the Task tool and the
`task` permission key. -->

GodMode skills speak in actions. On OpenCode they resolve to these tools.

## Action vocabulary

| Action in a skill | OpenCode |
|---|---|
| Invoke a skill | `skill` (loads a `SKILL.md` into the conversation) |
| Dispatch a subagent | the task tool (permission key `task`) with a subagent: `general` (full tools except `todowrite`) or `explore` (fast, read-only) |
| Force a specific subagent | `@general ...` or `@explore ...` in the message |
| Dispatch several in parallel | several task calls; the docs suggest `general` for parallel units of work |
| Message a teammate | not available; route through the primary agent |
| Form a team | no team primitive; use parallel subagents |
| Create and track tasks | `todowrite` |
| Create a worktree | `git worktree add` through `bash` |
| Search the web | `websearch` (built in on the OpenCode providers; other providers need `OPENCODE_ENABLE_EXA` or `OPENCODE_ENABLE_PARALLEL`) |
| Fetch a page or library docs | `webfetch`; the Context7 MCP server if configured |
| Ask the user a question | `question` |

## Invoking GodMode skills

- Install: follow `.opencode/INSTALL.md` in the repository; local plugins in `.opencode/plugins/` or `~/.config/opencode/plugins/` load automatically.
- Skills are found in `.opencode/skills/`, `.agents/skills/`, `.claude/skills/` and the matching global folders.
- User: ask for the skill by name; the model calls `skill`.
- Bootstrap: the GodMode plugin injects `using-godmode` through a system-prompt transform. That hook is experimental and rests on the plugin types, not the docs page; if skills never trigger, ask the user to add a line to `AGENTS.md` pointing at `using-godmode`.

## Models and effort (for `godmode:model-routing`)

- Per agent: `model: provider/model-id` in `opencode.json` or the agent's frontmatter, for example `anthropic/claude-sonnet-5-5`.
- Subagents without a `model` use the model of the primary agent that called them.
- Effort: pass-through provider options on the agent, for example `"reasoningEffort": "high"` for OpenAI models. `opencode models` lists what is available.

## Memory (for `godmode:knowledge-capture`)

- Project `AGENTS.md`, global `~/.config/opencode/AGENTS.md`; `CLAUDE.md` is read as a fallback.

## Reaching another model family (for `godmode:cross-model-review`)

- Define a review subagent whose `model` is from another provider than the author's, and send it the brief.
- Or run `codex exec -s read-only ...`, `claude -p ...` or `agy -p ...` through `bash` when installed.
