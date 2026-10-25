# GitHub Copilot CLI tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-other-harnesses.md;
https://docs.github.com/en/copilot/concepts/agents/about-agent-skills ;
https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/create-skills ;
https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents ;
https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/invoke-custom-agents ;
https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference ;
docs/plans/2026-10-25-godmode-2-design.md section 5 (install and hook).
GitHub's pages describe commands, not the agent's internal tool names; rows marked "not documented"
were not confirmed. -->

GodMode skills speak in actions. On GitHub Copilot CLI they resolve as below.

## Action vocabulary

| Action in a skill | Copilot CLI |
|---|---|
| Invoke a skill | name it with a slash in the prompt ("Use the /task-planning skill ..."); Copilot also picks skills by description. `/skills list`, `/skills info`, `/skills reload` |
| Dispatch a subagent | the model delegates to a built-in subagent: `explore` (fast, read-only search), `task` (runs tests, builds, linters), `general-purpose` (full capability), or a custom agent |
| Custom agents | `.github/agents/` in the repository or `~/.copilot/agents/`; pick with `/agent` or `copilot --agent=<name>` |
| Dispatch several in parallel | `/fleet <prompt>` runs parts of a task as parallel subagents |
| Hand off to a remote agent | `/delegate <prompt>` opens a pull request through the Copilot coding agent; it commits unstaged changes to a new branch first |
| Message a teammate | not documented; route through the main agent |
| Form a team | no team primitive; use `/fleet` or parallel subagents |
| Create and track tasks | not documented as a tool; keep a checklist in the plan file. `/tasks` lists running subagents and shells |
| Plan before building | `/plan <prompt>` |
| Create a worktree | `git worktree add` in the shell |
| Search the web or fetch docs | not documented in the pages above; use an MCP server (for example Context7) if configured, or ask the user for the page |
| Ask the user a question | end the turn with one plain question |

## Invoking GodMode skills

- Install: `copilot plugin marketplace add NoobyGains/godmode`, then `copilot plugin install godmode@godmode`.
- Skills are also read from `.github/skills`, `.agents/skills`, `.claude/skills`, `~/.copilot/skills`, `~/.agents/skills`.
- Bootstrap: Copilot CLI reuses the Claude Code plugin's SessionStart hook, which prints `additionalContext` at the top level.
- Fallback: read `skills/<skill>/SKILL.md` in the plugin directory.

## Models and effort (for `godmode:model-routing`)

- `/model [--session|--global|--repo|--local] [MODEL|auto TIER]` selects the model or Auto; `/models` lists them.
- Per-dispatch model and effort settings for subagents are not documented; route by choosing which custom agent runs a task, and state the intended tier in the brief.

## Memory (for `godmode:knowledge-capture`)

- Not documented in the pages above. Keep durable project facts in the repository's own docs or `AGENTS.md`, and propose them to the user.

## Reaching another model family (for `godmode:cross-model-review`)

- Run `codex exec -s read-only ...`, `claude -p ...` or `agy -p ...` in the shell when installed (exact lines in the other reference files).
- Or switch `/model` to another family for one read-only review turn, then switch back.
