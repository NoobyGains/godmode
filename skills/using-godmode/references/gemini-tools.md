# Gemini CLI tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-other-harnesses.md;
https://geminicli.com/docs/cli/skills/ ; https://geminicli.com/docs/core/subagents/ ;
https://geminicli.com/docs/extensions/reference/ ;
https://github.com/google-gemini/gemini-cli/tree/main/docs/tools (web-search.md: google_web_search;
todos.md: write_todos; ask-user.md: ask_user; memory.md: memory edits GEMINI.md with write_file/replace);
superpowers 7.0.0 references/gemini-tools.md (read_file, run_shell_command, web_fetch, enter_plan_mode).
Note: superpowers names a single `invoke_agent` tool; the current subagents page says each subagent
is exposed as a tool with its own name. The table follows the official page. -->

GodMode skills speak in actions. On Gemini CLI they resolve to these tools.

## Action vocabulary

| Action in a skill | Gemini CLI |
|---|---|
| Invoke a skill | `activate_skill` (the user confirms); `/skills list` shows what is installed |
| Dispatch a subagent | call the subagent's own tool: each subagent is exposed as a tool of the same name (`generalist`, `codebase_investigator`, `cli_help`; `browser_agent` is off by default) |
| Force a specific subagent | start the prompt with `@<name>`, for example `@generalist` |
| Custom subagents | `.gemini/agents/*.md` or `~/.gemini/agents/*.md`, frontmatter `name` (the tool name) and optional `model` (default `inherit`) |
| Dispatch several in parallel | several subagent calls in one response; keep dependent tasks sequential |
| Message a teammate | not available; route through the main agent |
| Form a team | no team primitive; use parallel subagents |
| Create and track tasks | `write_todos` (statuses `pending`, `in_progress`, `completed`, `cancelled`, `blocked`) |
| Create a worktree | `git worktree add` through `run_shell_command` |
| Search the web | `google_web_search` |
| Fetch a page or library docs | `web_fetch`; the Context7 MCP server if configured |
| Ask the user a question | `ask_user` |
| Plan before building | `enter_plan_mode` / `exit_plan_mode` |

Subagents are on by default; `experimental.enableAgents: false` in `settings.json` turns them off.

## Invoking GodMode skills

- Install: `gemini extensions install https://github.com/NoobyGains/godmode`.
- The extension's context file (`GEMINI.md`, set by `contextFileName`) carries the `using-godmode` bootstrap.
- User: ask for the skill by name ("use the task-planning skill"); the model calls `activate_skill`.
- Fallback: read `skills/<skill>/SKILL.md` in the extension directory with `read_file`.

## Models and effort (for `godmode:model-routing`)

- Session model: the CLI's model setting (`/model` in a session); check the current names there rather than copying them from a skill.
- Subagent model: the `model` field in the agent file, for example a Flash model for searches and a Pro model for review. The docs give no per-dispatch effort setting.

## Memory (for `godmode:knowledge-capture`)

- Shared project instructions: repository `GEMINI.md` files.
- Personal preferences across projects: `~/.gemini/GEMINI.md`.
- The memory feature edits these Markdown files with `write_file` or `replace`; private per-project notes go to a private memory folder managed by the CLI.

## Reaching another model family (for `godmode:cross-model-review`)

- Run `claude -p ...` or `codex exec -s read-only ...` through `run_shell_command` when installed (exact lines in `claude-code-tools.md` and `codex-tools.md`).
- Otherwise call `generalist` with the review brief, and record that the review stayed in one family.
