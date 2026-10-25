# Claude Code tool mapping

<!-- Sources (fetched 2026-10-25): docs/research/2026-10-25-claude-code-plugin-spec.md;
https://code.claude.com/docs/en/plugins-reference ; https://code.claude.com/docs/en/skills ;
https://code.claude.com/docs/en/sub-agents ; https://code.claude.com/docs/en/agent-teams ;
https://code.claude.com/docs/en/hooks (skill hooks, Stop decision control, re-read 2026-10-25) ;
https://code.claude.com/docs/en/memory ; tool names and parameters checked against the live
tool list of Claude Code 2.1.310 on 2026-10-25 (`claude --version`, `claude --help`). -->

GodMode skills speak in actions. On Claude Code they resolve to these tools.

## Action vocabulary

| Action in a skill | Claude Code |
|---|---|
| Invoke a skill | `Skill` tool with `godmode:<skill>`; the user types `/godmode:<skill>` |
| Dispatch a subagent | `Agent` tool: `description`, `prompt`, `subagent_type` (`general-purpose`, `Explore`, `Plan`, or a plugin agent such as `code-reviewer`), `model`, `effort` |
| Dispatch in the background | `Agent` with `run_in_background: true`; a notification arrives when it finishes |
| Dispatch several in parallel | several `Agent` calls in one message |
| Dispatch into its own worktree | `Agent` with `isolation: "worktree"` |
| Create and track tasks | `TaskCreate`, `TaskGet`, `TaskList`, `TaskUpdate` (older builds: `TodoWrite`) |
| Message a teammate | `SendMessage` with `to: "<name>"` |
| Form a team | see "Agent teams" below |
| Create a worktree | `EnterWorktree` / `ExitWorktree`, or `git worktree add` in the shell |
| Search the web | `WebSearch` |
| Fetch a page | `WebFetch` |
| Fetch library docs | the Context7 MCP server when installed (`resolve-library-id`, then `query-docs`); otherwise `WebFetch` on the official docs |
| Ask the user a question | `AskUserQuestion` in the main session; a subagent cannot reach the user and reports the question back instead |
| Load a deferred tool | `ToolSearch` with `select:<name>` before the first call |
| Arm a stop check | a `Stop` hook in a skill's frontmatter (`hooks:`), armed when the skill is invoked; `/goal <condition>` arms a session-scoped one by hand |
| Run a skill in a fresh context | `context: fork` plus `agent:` in skill frontmatter; the subagent gets the skill body as its prompt and none of the conversation |

## Invoking GodMode skills

- Install: `/plugin install godmode --marketplace NoobyGains/godmode` (one step on recent builds), or `/plugin marketplace add NoobyGains/godmode` then `/plugin install godmode@godmode`.
- Model: the `Skill` tool. Plugin skills are namespaced `godmode:<skill>`.
- User: `/godmode:<skill>`.
- Fallback: read `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/SKILL.md`. The variable is substituted inside skill bodies but is not set in Bash-tool commands, so take the install path from `/plugin` if you need it in the shell.
- The SessionStart hook injects `using-godmode`. Injected text is capped at 10,000 characters; overflow is replaced by a file path the model is not told to read.

## Skill and agent frontmatter (for `godmode:writing-skills`)

- Skill fields Claude Code honours: `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork` with `agent` and `background`, `hooks`, `paths` (globs that limit automatic loading to matching files under the working directory), `shell` (`bash` or `powershell` for `!` blocks), `metadata`. Unknown fields are ignored without a message; malformed YAML loads the body with no fields.
- Skill hooks take the same shape as `hooks.json`. They register when the skill is invoked and stay for the rest of the session; `once: true` removes a hook after its first successful run (a run that blocks, fails or times out stays). A `Stop` hook receives `last_assistant_message` and `stop_hook_active`; a prompt-type hook answers `{"ok": true | false, "reason": "..."}` and `ok: false` sends the reason back as the next instruction; eight consecutive continuations end the turn regardless (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`). `godmode:completion-gate` ships one. Invoking a skill that declares hooks asks for permission in the default permission mode ("Execute skill: godmode:completion-gate"; answer once with "don't ask again", or add `Skill(godmode:completion-gate)` to the allow rules); a `-p` run auto-denies it unless `Skill` is in `--allowedTools`, and the eval cases pre-allow it.
- Compaction keeps the most recent invocation of each skill, the first 5,000 tokens of each, 25,000 tokens across all skills, newest first. The skill listing (names and descriptions) has a budget of 1% of the context window; the least-used descriptions drop first (`/doctor` shows the cost, `skillListingBudgetFraction` raises it) and each description is cut at 1,536 characters.
- Agent fields (`agents/*.md`): `name`, `description`, `tools`, `disallowedTools`, `model`, `effort`, `maxTurns`, `skills` (preloaded whole), `memory` (`user` | `project` | `local`; turns on the write tools), `isolation: worktree`, `omitClaudeMd`, `background`, `color`. Plugin agents ignore `hooks`, `mcpServers` and `permissionMode`. `godmode:code-reviewer` lists `Read, Grep, Glob, Bash` (Bash for `git diff`, `git show`, `git log`); its prose forbids writes, and the tool list keeps the editing tools out.

## Models and effort (for `godmode:model-routing`)

- `model` on a dispatch: `haiku`, `sonnet`, `opus`, `fable`, a full model ID, or `inherit`.
- `effort` on a dispatch: `low`, `medium`, `high`, `xhigh`, `max`.
- Session: `claude --model <alias>`, `claude --effort <level>`; `/model` inside a session.
- Agent files (`agents/*.md`) take `model` and `effort` in frontmatter. A dispatch that names a model overrides the file.
- Teammate model order: the spawn prompt, then the agent definition's `model`, then `CLAUDE_CODE_SUBAGENT_MODEL`, then the lead's model.
- Seat map: `haiku` for mechanical search and transcription; `sonnet` for scoped implementation and task review; `opus` at high effort for substantial builds and the whole-branch review; `fable` only when `opus` at high effort has clearly failed. Aliases always point at the newest model of each tier; check with `/model`.

## Agent teams

- Experimental and off by default. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in the environment or in `settings.json` under `env`. Interactive sessions only, not `claude -p`.
- A team forms by naming agents: with teams enabled, an `Agent` call that sets `name` launches a teammate. There is no separate create-team call in current builds. Two exceptions give an ordinary subagent instead: a fork, or a call that passes `isolation` itself. Teammates therefore share the lead's checkout, and file ownership is what isolates them.
- Teammates talk with `SendMessage` (`to` is a name or agent ID; one message per recipient, there is no broadcast) and share one task list (`TaskCreate`, `TaskGet`, `TaskList`, `TaskUpdate`; a task with unresolved dependencies cannot be claimed, dependents unblock automatically). Mailboxes live in `~/.claude/teams/{team}/inboxes/`, tasks in `~/.claude/tasks/{team}/`; the team name is `session-` plus the first 8 characters of the session ID.
- Limits: one team per session, no nested teams, the lead is fixed, permissions are inherited at spawn (per-teammate modes cannot be set), in-process teammates cannot be resumed with `/resume` and cannot run background subagents. Guidance is 3-5 teammates with 5-6 tasks each. Teams use significantly more tokens than subagents.
- Subagent limits: concurrency defaults to 20 (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`); nesting goes up to 3 levels (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`, 1 turns it off); `Explore` and `Plan` are one-shot and cannot be resumed; `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` makes the configured subagent model override per-call and definition models.
- Worktrees: `EnterWorktree` / `ExitWorktree` in session, or `claude --worktree <name>`; default location `.claude/worktrees/<name>/` on branch `worktree-<name>` (gitignore it); the base is the remote default branch unless the `worktree.baseRef` setting is `head`; `.worktreeinclude` copies gitignored files such as `.env`; a subagent with `isolation: "worktree"` gets a temporary worktree that is removed when it makes no changes.
- Display: `teammateMode` `in-process` (default), `auto`, `tmux`, `iterm2`, or `--teammate-mode`. Split panes do not work in the VS Code terminal, Windows Terminal or Ghostty.
- Hooks: `TeammateIdle`, `TaskCreated`, `TaskCompleted` (exit code 2 sends feedback).
- Flag not set: use `godmode:parallel-execution` or `godmode:delegated-execution` with subagents that report back.

## Memory (for `godmode:knowledge-capture`)

- Auto memory: `~/.claude/projects/<project>/memory/`, one fact per file with a `MEMORY.md` index. The first 200 lines or 25 KB of the index load every session. One directory per repository, shared across its worktrees. Toggle with `/memory` (`autoMemoryEnabled`).
- Instructions the user owns: `CLAUDE.md` (project, user, organisation) and `.claude/rules/`; a repository `AGENTS.md` can be read in place of CLAUDE.md. Propose edits to these; do not make them unasked.

## Reaching another model family (for `godmode:cross-model-review`)

Run the other family's CLI from the shell when it is installed (`command -v codex`, `command -v agy`):

```bash
codex exec --skip-git-repo-check -s read-only -m <model> -o review.md "$(cat review-brief.md)"
agy -p "$(cat review-brief.md)" --model <model> --output-format text --print-timeout 10m > review.md
```

- Codex: `codex exec` runs non-interactively; `-s read-only` stops it editing; `-o` writes its last message to a file; `codex exec review` runs Codex's own review. Model names at the time of writing: `gpt-6.1-sol`, `gpt-6-luna`, `gpt-6-astra`.
- Antigravity: `agy -p` runs one headless prompt and decides instead of asking; `agy models` lists names (for example `gemini-4-argon-high`).
- Neither installed: dispatch a fresh `Agent` on a different tier from the author with the same brief, and record that the review stayed in one family.
