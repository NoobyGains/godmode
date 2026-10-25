# Antigravity (agy 1.4.x) plugin spec (fetched 2026-10-25)

Research agent report plus local probes with agy 1.4.7. Items the official docs do not cover are marked UNVERIFIED.

## 1. Manifest, install, validate, marketplace
- Manifest `plugin.json` at the plugin root; `.antigravity-plugin/` or `.gemini-plugin/` folders also accepted (CHANGELOG 1.3.2). Names case-insensitive (1.3.6). https://github.com/google-antigravity/antigravity-cli/blob/main/CHANGELOG.md
- Layout: `plugin.json`, optional `mcp_config.json`, `hooks.json`, `skills/<n>/SKILL.md`, `agents/<n>.md`, `rules/<n>.md`. https://antigravity.google/docs/plugins?app=cli
- Official schema https://antigravity.google/schemas/v1/plugin.json: required `name` (`^[a-zA-Z0-9_-]+$`). Optional `$schema`, `displayName`, `description`, `version`, `disabled`, `logo` (relative png/svg/jpg/webp, or https on google.com, gstatic.com, googleusercontent.com), `suggestedPrompts` (max 3), `skills` (string or array), `author` (string or {name,email,url}), `homepage`, `repository`, `license`, `keywords`, `extensions`. Unknown keys are ignored but reported by validate (`category` is unknown: confirmed locally, `--strict` fails on it). Wrong type on a known key stops the plugin loading.
- `agy plugin validate` (1.4.0+): loader rules, file+line errors, `--strict`, `--json`; checks skills, subagents, rules (invalid frontmatter, reserved agent names, invalid rule triggers, AGENTS.md/GEMINI.md at root instead of `rules/`); hooks, sidecars; warns on unknown hook events, unused `hooks/hooks.json`, Claude-style top-level `hooks` key; warns on missing SKILL.md. Local run on this repo: warnings for root `GEMINI.md` ("plugins load rules only from rules/") and `hooks/hooks.json` ("plugin hooks are read only from hooks.json at the plugin root"), both expected for a multi-harness repo.
- Install: `agy plugin install` accepts `<name>@antigravity-plugins-official`, a bare name, a GitHub URL, or a local path; staged at `~/.gemini/antigravity-cli/plugins/<name>/`. Manual: `.agents/plugins/` or `~/.gemini/config/plugins/`.
- With no `plugin.json`, a GitHub install falls back to the Gemini-extension path (`gemini-extension.json`); a Claude-format `hooks/hooks.json` was then copied to the root as `hooks.json` and failed to parse every session (agy 1.3.1). Ship a native manifest. https://raw.githubusercontent.com/obra/superpowers/main/docs/superpowers/specs/2026-10-06-antigravity-marketplace-design.md
- Marketplace: `antigravity-plugins-official`; listing goes through an interest form https://forms.gle/2EX5RFYPoJe1UgxR9 (https://antigravity.google/docs/marketplace). Presentation fields used by superpowers: `displayName`, `description` (<=160 chars), `logo` (512x512 PNG), `suggestedPrompts` (1-3), `keywords`, `author`, `license`.

## 2. Skills (https://antigravity.google/docs/skills)
- Locations: workspace `.agents/skills/`; CLI global `~/.gemini/antigravity-cli/skills/`; app/IDE global `~/.gemini/config/skills/`; plugin `.../plugins/<name>/skills/`.
- Frontmatter: `name` optional (defaults to folder), `description` required. `allowed-tools` / `disable-model-invocation` not documented; treat as ignored.
- The model sees only name + description at start and reads SKILL.md when relevant. The CLI turns every skill into `/skill-name`.
- Quote `description:` values: an unquoted description containing a colon failed to load until 1.3.6.

## 3. Rules and hooks (https://antigravity.google/docs/rules, https://antigravity.google/docs/hooks?tab=cli)
- Rules: project `AGENTS.md`/`GEMINI.md`/`.agents/rules/*.md`; global `~/.gemini/AGENTS.md`, `~/.gemini/config/rules/*.md`; plugin rules `~/.gemini/antigravity-cli/plugins/<n>/rules/`.
- `rules/*.md` frontmatter is required: `trigger` (`always_on|model_decision|glob|manual`), `description` (required for `model_decision`), `globs`. Missing frontmatter or a bad trigger is silently discarded. `always_on` injects the full content every turn. Includes `@[label](path)` inline a file. Limits: 24,000 bytes per file; 20,000-token aggregate for always-on rules.
- A plugin rule with `trigger: always_on` acts as always-on context. Inside a plugin rule, relative `@` paths are rewritten to absolute install paths; `${PLUGIN_ROOT}` is not substituted.
- Plugin AGENTS.md/GEMINI.md must live in `rules/`, not the root.
- Hooks exist: `hooks.json` at `.agents/hooks.json`, `~/.gemini/config/hooks.json`, or a plugin's root `hooks.json`. Format: top-level hook names mapping event names to configs. Events `SessionStart`, `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`. Handler `{type:"command", command, timeout}` (default 30 s). `SessionStart`/`PreInvocation`/`PostInvocation` may output `injectSteps` (`systemMessage`, `userMessage`, `ephemeralMessage`, `toolCall`). Exit-code semantics and plugin-root variables: UNVERIFIED.

## 4. Agents (https://antigravity.google/docs/subagents?tab=cli)
- `agents/<name>.md`: `name`, `description` required; `tools`, `mainAgent`, `subagent`, `model` (`inherit|flash|pro`), `commandExecutionPolicy` (`off|auto|eager|sandbox`), `mcpServers`, `skills`, `plugins`. Body = system prompt. Built-ins `research`, `browser`, `self` are reserved.
- Invocation: `invoke_subagent`; `define_subagent` for transient ones; `@<subagent> <msg>`; `--agent <name>`. Workspace options `inherit`, `branch` (git worktree), `share`. Max nesting 10.
- No todo tool: superpowers' mapping uses a markdown task artifact (`write_to_file` with `IsArtifact: true`, `ArtifactType: "task"`). https://raw.githubusercontent.com/obra/superpowers/main/skills/using-superpowers/references/antigravity-tools.md
- `enableSubagentTeamwork` / `parallelExecutionPoolSize` (present in the local settings.json): UNVERIFIED in docs.

## 5. Instruction files
- `AGENTS.md` and `GEMINI.md` are read at project, subdirectory and global level, cumulative, nearest wins. Which wins at the same level: UNVERIFIED.

## 6. Headless
- `agy -p "..."` with `--output-format text|json|stream-json`, `--json-schema`, `--print-timeout` (default 5m), `--input-format`, `--disable-slash-commands`. Headless proceeds past plan approval automatically and decides instead of asking.
- Windows: `-p` hung with redirected output on 1.0.6 (https://github.com/google-antigravity/antigravity-cli/issues/318, #76). Fixed state in 1.4.x: UNVERIFIED; test locally.

## 7. One repo, many hosts (superpowers)
- Dotdirs per harness plus shared `skills/`; `.version-bump.json` keeps versions aligned; no root `plugin.json`, root `hooks.json` or root `rules/` in superpowers because Cursor loads any `rules/*.md` and a Claude-format root `hooks.json` breaks agy.

## Minimum Antigravity-installable plugin
1. `.antigravity-plugin/plugin.json` with `name` (kebab-case), `description`, `version`.
2. `skills/<name>/SKILL.md` with a quoted `description`.
3. Optional `rules/<x>.md` with `trigger: always_on`; `agents/<x>.md` avoiding reserved names.
4. No root `hooks.json` in Claude format; no root AGENTS.md/GEMINI.md expecting rule loading; no manifest keys outside the schema.
5. `agy plugin validate <path> --strict`, then `agy plugin install <path>`, `agy plugin list`.
