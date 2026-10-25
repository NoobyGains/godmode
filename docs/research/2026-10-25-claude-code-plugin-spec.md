# Claude Code plugin spec (fetched 2026-10-25)

Research agent report. Docs pages are undated, so dates are fetch dates. B = https://code.claude.com/docs/en

## 1. plugin.json
- Location `.claude-plugin/plugin.json`. The manifest is optional; only `name` is required inside it. Without one, components load from default dirs and the name comes from the marketplace entry. [B/plugins-reference]
- Fields: `$schema`, `name` (kebab-case, no spaces/@/:), `displayName`, `version` (not checked against semver; setting it pins users to that version until you change it), `description`, `author {name (required), email, url}`, `homepage` (must parse as URL or the plugin fails to load), `repository`, `license` (SPDX), `keywords[]`, `metadata{}`, `icon`/`documentationUrl`/`supportUrl`/`privacyPolicyUrl`/`termsOfServiceUrl` (directory listing only), `defaultEnabled` (default true), `dependencies[]`, `settings{}` (only `agent` and `subagentStatusLine` take effect), `userConfig{}`, `channels[]`, `types`, `skills`, `commands`, `agents`, `hooks`, `mcpServers`, `lspServers`, `outputStyles`, `workflows`, `experimental{themes,monitors,evals}`. [B/plugins-reference]
- Path overrides: every path must start `./` and stay inside the plugin root. `skills` adds to the default `skills/`. `commands`, `agents`, `outputStyles`, `workflows` replace the default dir scan. `hooks`, `mcpServers`, `lspServers` merge with `hooks/hooks.json`, `.mcp.json`, `.lsp.json`. `agents` entries must be `.md` files.
- Unknown top-level keys are stripped with a validate warning. Unknown keys inside `userConfig`/`channels`/`lspServers`/`monitors` are errors.
- `commands/` is not removed: "Flat Markdown command files. Prefer skills/ for new plugins". Commands and skills "now work the same way". [B/plugins-reference, B/skills]
- Reserved names: validate errors on names starting `claude-`, `anthropic-`, `anthropics-`, `cc-plugin-`, or equal to `claude`, `anthropic`, `claude-code`. "godmode" is fine.
- `claude plugin validate <path>` exists (plugin dir or marketplace root). `--strict` makes warnings fail. Exit 0 ok, 1 fail, 2 unexpected error. Warns on missing version/description/author and on a CLAUDE.md at plugin root. [B/plugins-reference, B/plugins/cli-reference.md]
- Other CLI: `claude plugin init`, `tag`, `test`, `eval`, `details`, `list`, `prune`, `configure`.
- Env vars: `${CLAUDE_PLUGIN_ROOT}` (install dir, changes on update), `${CLAUDE_PLUGIN_DATA}` (persists across updates), `${CLAUDE_PROJECT_DIR}`. Not set in Bash-tool commands. In skill/agent/command markdown bodies `${...}` is substituted inline.
- Layout: `skills/`, `commands/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `output-styles/`, `workflows/`, `themes/`, `monitors/monitors.json`, `bin/` (put on Bash PATH), `settings.json`.

## 2. marketplace.json
- Path `.claude-plugin/marketplace.json`. Required: `name`, `owner{name required, email, url optional}`, `plugins[]`. Also `description` (validate warns if missing), `version`, `metadata.description/version`, `metadata.pluginRoot`, `$schema`, `forceRemoveDeletedPlugins`, `allowCrossMarketplaceDependenciesOn`, `renames`. [B/plugins/marketplace-reference.md]
- Entry: `name` + `source` required. Optional `description`, `version`, `category`, `tags[]`, `strict` (default true), `relevance`, `dependencies`, `defaultEnabled`, `displayName`, `metadata`, `headers`, `headersHelper`, plus any plugin.json field. If entry and plugin.json both set version, plugin.json wins. Entry name must equal plugin.json name.
- Source types: relative string `"./plugins/x"` (must start `./`, no `..`; `"."` = root); `{"source":"github","repo":"o/r","ref","sha"}`; `{"source":"url","url":"https://...git","ref","sha"}`; `{"source":"git-subdir","url","path","ref","sha"}`; npm `{package,version,registry}`; archive `{url,sha256}`; command `{command,timeout,mode}`.
- A single-plugin repo can be its own marketplace with entry `"source": "./"` (inferred from the `.` rule; not shown as a worked example).
- Marketplace name charset: letters, digits `. _ -`. Reserved: `claude-plugins-official`, `anthropic-*`. "godmode" OK.
- `strict: true` = plugin.json is authority, entry components appended. `false` + plugin.json + entry component fields = load failure.
- CLI: `claude plugin marketplace add <source>` (owner/repo shorthand, owner/repo#ref or @ref; `--scope user|project|local`, `--sparse`); `marketplace list|update [name]|remove <name>`. `claude plugin install <plugin>@<marketplace> [-s scope]`. One-step: `claude plugin install godmode --marketplace owner/repo` (v2.1.292+). In session: `/plugin marketplace add owner/repo`, `/plugin install godmode@godmode`, `/reload-plugins`. [B/plugins/cli-reference.md, B/plugins/install.md]
- Update: `claude plugin update godmode@godmode` (bare name from v2.1.246). `claude plugin marketplace update` refreshes listings only. Auto-update is off by default for third-party marketplaces. New version loads next session or after `/reload-plugins`. Because `version` pins users, bump it every release or omit it. [B/plugins/install.md]

## 3. Hooks
- `hooks/hooks.json` shape: `{"description": "...", "hooks": {"EventName": [{"matcher": "...", "hooks": [{"type":"command","command":"...","args":[],"timeout":N}]}]}}`. The top-level `hooks` wrapper is required in a file. [B/hooks, B/plugins-reference]
- 33 events: SessionStart, Setup, UserPromptSubmit, UserPromptExpansion, PreToolUse, PermissionRequest, PermissionDenied, PostToolUse, PostToolUseFailure, PostToolBatch, Notification, MessageDisplay, SubagentStart, SubagentStop, TaskCreated, TaskCompleted, Stop, StopFailure, TeammateIdle, InstructionsLoaded, ConfigChange, CwdChanged, DirectoryAdded, FileChanged, WorktreeCreate, WorktreeRemove, PreCompact, PostCompact, PreModelSwitch, PostModelSwitch, Elicitation, ElicitationResult, SessionEnd. [B/hooks]
- Types: command, http, mcp_tool, prompt, agent (experimental). SessionStart supports only command and mcp_tool.
- Fields: `if`, `timeout` (default 600 s for command), `statusMessage`, `once` (skill frontmatter only). Command-only: `command`, `args`, `async`, `asyncRewake`, `shell` ("bash"|"powershell"), `onFailure` ("continue"|"block", v2.1.295+).
- SessionStart matcher values: `startup`, `resume`, `clear`, `compact`, `fork`. Hooks run in the background but the first response waits for them.
- Output: plain stdout is added to context. JSON: `{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"...","sessionTitle":"..."}}`. Other SessionStart fields: `initialUserMessage` (-p only), `watchPaths`, `reloadSkills`. Can write `export` lines to `$CLAUDE_ENV_FILE`.
- **Size limit: `additionalContext`, `systemMessage`, `initialUserMessage` and plain stdout are each capped at 10,000 characters.** Overflow is saved to a file in the session dir and replaced by the file path plus a preview of the first 2,000 characters. Claude is not told to read it. [B/hooks]
- Quoting `${CLAUDE_PLUGIN_ROOT}`: exec form (with `args`) needs no quoting; shell form (no `args`) wraps it in escaped double quotes: `"command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/process.sh"`. validate warns on unquoted shell-form use. Single quotes are not a documented pattern.
- Windows: shell form runs in Git Bash if installed, else PowerShell. Exec form requires a real executable (`.exe`); `.cmd`/`.bat` shims cannot be spawned directly, so a polyglot `run-hook.cmd` only works in shell form. Set `CLAUDE_CODE_GIT_BASH_PATH` if Git Bash is not found.
- Executable bit preservation on install: not documented (UNVERIFIED). Issue #4 on this repo shows installs do preserve git modes (a 100644 script failed with exit 126), so committing 100755 is the fix.

## 4. SKILL.md frontmatter
- All optional in Claude Code; `description` recommended; unknown fields ignored. Fields: `name` (defaults to dir name), `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort` (low|medium|high|xhigh|max), `context` (fork), `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`, `compatibility` (<=500). [B/skills]
- description + when_to_use truncated at 1,536 chars in the listing. Reserved: `anthropic-skills*`, folder `synced`.
- Plugin skills are invoked as `/plugin-name:skill-name`. Use `${CLAUDE_SKILL_DIR}` for bundled files.
- Keep SKILL.md under 500 lines. Open standard (https://agentskills.io/specification): `name` 1-64 chars lowercase a-z 0-9 hyphen, must match the directory; `description` 1-1024 chars; optional `license`, `compatibility`, `metadata`, `allowed-tools`. Validator `skills-ref validate ./my-skill`.

## 5. Agents (`agents/*.md`) [B/sub-agents]
- Required: `name` (<=256, no `:`), `description`. Optional: `tools`, `disallowedTools`, `model`, `permissionMode`, `maxTurns`, `autoCompactWindow`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `omitClaudeMd`, `effort`, `isolation` ("worktree"), `color`, `initialPrompt`, `experimental{cacheTtl}`.
- `model`: sonnet | opus | haiku | fable | full model ID | inherit.
- Plugin agents ignore `hooks`, `mcpServers`, `permissionMode`, `initialPrompt`.
- Built-ins: Explore, Plan, general-purpose; also statusline-setup, claude-code-guide, `claude`.

## 6. Agent Teams and Workflows
- Agent teams are experimental and disabled by default. Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Interactive sessions only (not `-p`). [B/agent-teams]
- When on, a subagent Claude names via the Agent tool launches as a teammate. Tools: `SendMessage`, `TaskCreate`/`TaskGet`/`TaskList`/`TaskUpdate`. Mailbox `~/.claude/teams/{team}/inboxes/{agent}.json`; task list `~/.claude/tasks/{team}/`.
- Display: `teammateMode` "in-process" (default) | "auto" | "tmux" | "iterm2"; `--teammate-mode`. Split panes unsupported in VS Code terminal, Windows Terminal, Ghostty.
- Limits: no hard cap (guidance 3-5 teammates, 5-6 tasks each); one team per session; no nested teams; no `/resume` of in-process teammates; lead fixed; permissions inherited at spawn. Hooks: TeammateIdle, TaskCreated, TaskCompleted (exit 2 = feedback).
- Teams cost more tokens: subagents for focused tasks that report back; teams for discussion, competing hypotheses, cross-layer work. Teammate model order: spawn prompt, definition model, `CLAUDE_CODE_SUBAGENT_MODEL`, lead model.
- Workflows (dynamic) GA on paid plans: JS scripts with `agent()`, `pipeline()`, `parallel()`, `phase()`, `log()`. `ultracode` keyword triggers a one-off workflow. Plugins ship `workflows/`. Limits: 16 concurrent agents default, 1,000 per run. [B/workflows.md]

## 7. Settings
- `subagentPromptCacheTtl`: "5m" | "1h" (v2.1.242+). [B/settings-reference]
- `workflowSizeGuideline`: unrestricted | small (<5) | medium (<10, default) | large (<50). [B/workflows.md]
- `permissions.defaultMode`: default | acceptEdits | plan | auto | dontAsk | bypassPermissions; `auto` and `bypassPermissions` in project settings are ignored. [B/permission-modes.md]
- `enabledPlugins` keyed `"plugin@marketplace"`; `extraKnownMarketplaces`.

## 8. Official repos
- https://github.com/anthropics/claude-code/tree/main/plugins: 13 plugins; README asks for standard layout, comprehensive README, `.claude-plugin/plugin.json`, documented components, usage examples.
- Official marketplace `claude-plugins-official` auto-added on first start. Submission: https://clau.de/plugin-directory-submission.

## 9. Skill authoring best practices (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- `name` <=64, lowercase/digits/hyphens; `description` <=1,024, third person, says what and when ("Use when ..."), key terms. Avoid vague names.
- Body under 500 lines; references one level deep; reference files over 100 lines get a table of contents; forward slashes; no time-sensitive info; one default, not many options; scripts are run, not read.
- Build evaluations first (3+ scenarios), test with Haiku, Sonnet and Opus. Metadata ~100 tokens at startup; body under 5,000 tokens recommended.

## Gotchas relevant to the rebuild
1. Hook commands: shell form with escaped double quotes (the polyglot wrapper cannot use exec form on Windows).
2. SessionStart: `fork` source added; 10,000-char cap; the bootstrap must stay under it.
3. Plugin agents silently ignore hooks, mcpServers, permissionMode.
4. `version` pins users; bump each release.
5. Third-party marketplaces do not auto-update by default.
6. Prefer `skills/` over `commands/`.
7. Agent Teams: still experimental, same env var; teams form by naming agents.
8. Reserved plugin-name prefixes are validate errors.
