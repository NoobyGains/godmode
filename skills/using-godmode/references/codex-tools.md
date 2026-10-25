# Codex tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-other-harnesses.md;
https://learn.chatgpt.com/docs/build-skills ; https://learn.chatgpt.com/docs/agent-configuration/subagents ;
https://learn.chatgpt.com/docs/agent-configuration/agents-md.md ; https://learn.chatgpt.com/docs/customization/memories ;
superpowers 7.0.0 skills/using-superpowers/references/codex-tools.md (MIT; fork_turns, wait stretches, effort reset);
tool names from the live tool list of codex-cli 0.163.0 in `codex exec` on 2026-10-25 (model self-report);
flags from `codex exec --help`. -->

GodMode skills speak in actions. On Codex CLI and the Codex app they resolve to these tools.

## Action vocabulary

| Action in a skill | Codex |
|---|---|
| Invoke a skill | the user types `$godmode:<skill>` or picks it from `/skills`; the model also loads a skill when its description matches |
| Dispatch a subagent | `spawn_agent`; give the child a clean context with `fork_turns: "none"` (the default copies your whole transcript) |
| Send a follow-up to a subagent | `followup_task` (it also reloads a child the harness evicted) |
| Wait for subagents | `wait_agent` in stretches of 5-10 minutes; short polls cost a call each and wake no sooner |
| List or stop subagents | `list_agents`, `interrupt_agent` |
| Dispatch several in parallel | several `spawn_agent` calls; capped by `agents.max_concurrent_threads_per_session` |
| Message a teammate | `send_message` between agent threads |
| Form a team | no team primitive; spawn named workers and route messages through the lead (`godmode:parallel-execution`) |
| Create and track tasks | a checklist in the plan file (`- [ ]` to `- [x]`); the 0.163 tool list showed no todo tool |
| Create a worktree | `git worktree add` in the shell; `codex exec --worktree` for a headless run |
| Search the web | the web tool (`web.run`) when web access is on |
| Fetch library docs | the Context7 MCP server if configured; otherwise the web tool on the official docs |
| Ask the user a question | `request_user_input` |

## Setup

- Subagents are on by default in current releases (`[agents] enabled = true`; older configs used `[features] multi_agent = true`).
- Built-in agent types: `default`, `worker`, `explorer`. Custom agents are TOML files in `~/.codex/agents/` or `.codex/agents/` with `name`, `description`, `developer_instructions`, and optional `model` and `model_reasoning_effort`.
- Subagents inherit the parent's sandbox, approvals, provider and MCP servers.

## Invoking GodMode skills

- Install: `codex plugin marketplace add https://github.com/NoobyGains/godmode`, then `codex plugin add godmode@godmode`.
- User: `$godmode:<skill>`; `/skills` lists them.
- Manifest: `.codex-plugin/plugin.json` keeps Codex metadata under `extensions.com.openai` (`interface`, and `onboardingSkill` pointing at `godmode:doctor`, which Codex runs when the user opens the plugin's setup). A plugin that declares lifecycle hooks is not eligible for the public plugin directory, so GodMode ships none for Codex. Codex copies an installed plugin into `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`; a new version needs `codex plugin add` again.
- Skill listing budget: 2% of the context window (8,000 characters when unknown; `skills.max_context_tokens` raises it to 10,000 tokens); descriptions are shortened first, then skills dropped with a warning.
- Fallback: read `skills/<skill>/SKILL.md` from the plugin directory.
- No GodMode session-start hook runs on Codex; the `using-godmode` description and AGENTS.md carry the bootstrap.

## Models and effort (for `godmode:model-routing`)

- Session: `codex -m <model>` or `codex exec -m <model>`; effort with `-c model_reasoning_effort="<level>"`.
- Effort values: `low`, `medium`, `high`, `xhigh`, `max`, `ultra`; support depends on the model.
- Every `spawn_agent` sets `model` AND `reasoning_effort`. Setting only the model resets effort to that model's default, not yours.
- Backstop defaults in `~/.codex/config.toml`: `[agents] default_subagent_model` and `default_subagent_reasoning_effort`.
- Model names at the time of writing: `gpt-6.1-sol` (daily coding and review), `gpt-6-luna` (bulk and mechanical), `gpt-6-astra` (strongest, smallest allowance). Check the current spawn allowlist before copying any name; unknown names hard-error.

## Memory (for `godmode:knowledge-capture`)

- Project notes: `AGENTS.md` at the repository root and per directory; global `~/.codex/AGENTS.md` or `AGENTS.override.md`. Size cap `project_doc_max_bytes`, default 32 KiB.
- Codex memories (`[features] memories = true`, files in `~/.codex/memories/`) are generated in the background from past chats and are not edited by hand. Write durable project facts to AGENTS.md or the project's docs instead. `/memories` controls use per chat.

## Reaching another model family (for `godmode:cross-model-review`)

```bash
claude -p "$(cat review-brief.md)" --model sonnet --effort high > review.md
agy -p "$(cat review-brief.md)" --model gemini-4-argon-high --print-timeout 10m > review.md
```

- `claude -p` prints one response and exits.
- `agy -p` runs one headless prompt; `agy models` lists model names.
- Neither installed: `spawn_agent` a fresh reviewer on a different model tier, and record that the review stayed in one family.
