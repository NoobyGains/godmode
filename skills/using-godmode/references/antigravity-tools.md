# Antigravity tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-antigravity-plugins.md;
https://antigravity.google/docs/skills ; https://antigravity.google/docs/subagents?tab=cli ;
https://antigravity.google/docs/rules ; https://antigravity.google/docs/plugins?app=cli ;
superpowers references/antigravity-tools.md (task artifact pattern, manage_task is not a todo tool);
flags from `agy --help` and model names from `agy models` (agy 1.4.7, 2026-10-25);
tool names as listed by agy 1.4.7 itself in a headless session on 2026-10-25 (model self-report). -->

GodMode skills speak in actions. On the Antigravity CLI (`agy`) and app they resolve to these tools.

## Action vocabulary

| Action in a skill | Antigravity |
|---|---|
| Invoke a skill | the user types `/<skill>` (every skill becomes a slash command); the model reads `SKILL.md` when the description matches |
| Dispatch a subagent | `invoke_subagent` with built-in `self` (full capability) or `research` (read-only); `browser` only through `/browser` |
| Define a one-off subagent | `define_subagent` |
| Dispatch several in parallel | several `invoke_subagent` calls; a parent can run subagents concurrently |
| Dispatch into its own worktree | subagent workspace `branch` (a git worktree); `inherit` uses the parent's workspace, `share` shares directory storage |
| Manage running subagents | `manage_subagents` |
| Message a teammate | `send_message` |
| Form a team | no team primitive; run parallel subagents and coordinate through the lead |
| Create and track tasks | a markdown checklist kept as a task artifact (artifact type "task" in the app) or a plan file edited as steps finish; `manage_task` controls background processes and is not a todo list |
| Create a worktree | subagent workspace `branch`, or `git worktree add` through the shell tool (`run_command`) |
| Search the web | `search_web` |
| Fetch library docs | the Context7 MCP server if configured (through `call_mcp_tool`); otherwise `search_web` to the official page |
| Ask the user a question | `ask_question`; headless `agy -p` decides instead of asking |

## Invoking GodMode skills

- Install: `agy plugin install https://github.com/NoobyGains/godmode`; confirm with `agy plugin list`.
- User: `/<skill>`, for example `/intent-discovery`.
- No session-start hook runs GodMode here. The model sees every skill's name and description at start, and `using-godmode` triggers on "Use when starting any conversation". A plugin rule with `trigger: always_on` can add standing context.
- Fallback: read `~/.gemini/antigravity-cli/plugins/godmode/skills/<skill>/SKILL.md`.

## Models and effort (for `godmode:model-routing`)

- Session: `agy --model <name> --effort <low|medium|high|xhigh|max>`; `agy models` lists the names.
- Names at the time of writing: `gemini-3.8-flash-low|medium|high` (cheap; bulk and mechanical), `gemini-4-argon-low|medium|high` (reasoning and review), `claude-sonnet-5-5-*` and `claude-opus-5-5-*` (a separate quota pool), `gpt-oss-120b-medium`.
- Subagent files (`agents/<name>.md`) take `model: inherit | flash | pro`. Use `flash` for searches and transcription, `pro` for design and review.

## Memory (for `godmode:knowledge-capture`)

- Project: `AGENTS.md` or `GEMINI.md` at the workspace root, and `.agents/rules/*.md`.
- Global: `~/.gemini/AGENTS.md`, `~/.gemini/config/rules/*.md`; CLI-only rules in `~/.gemini/antigravity-cli/rules/`.
- Rule files need frontmatter `trigger: always_on | model_decision | glob | manual` or they are silently dropped. Limits: 24,000 bytes per file and 20,000 tokens across always-on rules.

## Reaching another model family (for `godmode:cross-model-review`)

```bash
codex exec --skip-git-repo-check -s read-only -m gpt-6.1-sol -o review.md "$(cat review-brief.md)"
claude -p "$(cat review-brief.md)" --model sonnet --effort high > review.md
```

- Inside agy, a Claude model (`--model claude-sonnet-5-5-high`) is already a different family from Gemini.
- Nothing else reachable: a `research` subagent on a different tier, recorded as a same-family review.
