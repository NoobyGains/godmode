# Cross-tool skills install (fetched 2026-10-25)

Research agent report. Every tool below reads SKILL.md folders natively. The most portable project path is `.agents/skills/`.

## 1. OpenAI Codex CLI
- Latest stable 0.164.0 (2026-10-23). https://github.com/openai/codex/releases
- Skill paths: repo `.agents/skills` scanned from cwd up to repo root; user `$HOME/.agents/skills`; admin `/etc/codex/skills`. Symlinked folders are followed. https://learn.chatgpt.com/docs/build-skills
- Frontmatter: `name` and `description` required. Extra metadata goes in `agents/openai.yaml` (`interface`, `policy.allow_implicit_invocation`, `dependencies.tools`).
- Invoke: `/skills` or `$skill-name`, plus implicit match on description.
- Config: `[[skills.config]]` with `path` and `enabled = false` in `~/.codex/config.toml`; `skills.max_context_tokens`.
- Plugins: manifest `plugin.json` at plugin root, with `.codex-plugin/plugin.json` as compatibility overlay. Fields listed as required: `$schema`, `name`, `version`, `description`. OpenAI-specific settings under `extensions.com.openai`. Skills in `skills/<name>/SKILL.md`; optional `mcp.json`, `hooks/hooks.json`. https://developers.openai.com/codex/plugins/build.md
- Marketplace file: `$REPO_ROOT/.agents/plugins/marketplace.json` or `~/.agents/plugins/marketplace.json`; legacy-compatible `.claude-plugin/marketplace.json`. Entries need `policy.installation`, `policy.authentication`, `category`; source types local, url, git-subdir, npm.
- CLI: `codex plugin marketplace add|list|upgrade|remove owner/repo` (`--ref`, `--sparse`). The docs list no `codex plugin install`; the locally installed Codex CLI 0.163 has `codex plugin add <plugin@marketplace>` (verified with `codex plugin --help` on this machine).
- AGENTS.md: global `~/.codex/AGENTS.override.md` else `AGENTS.md`; then per directory from project root down; `project_doc_fallback_filenames`; `project_doc_max_bytes` default 32 KiB. https://learn.chatgpt.com/docs/agent-configuration/agents-md.md

## 2. Cursor
- Skills: project `.agents/skills/` and `.cursor/skills/`; user `~/.agents/skills/` and `~/.cursor/skills/`; also reads `.claude/skills/`, `.codex/skills/`. https://cursor.com/docs/skills
- Frontmatter: `name`, `description` required; optional `paths`, `disable-model-invocation`, `icon`, `color`, `metadata`. Invoke `/skill-name`.
- Skills are not imported from GitHub on their own; they must be packaged as a plugin. "From GitHub Repository" needs `.cursor-plugin/marketplace.json`.
- `.cursor-plugin/plugin.json` is official. Only `name` required. Optional: `description`, `version`, `author` (object `name`, optional `email`), `homepage`, `repository`, `license`, `keywords`, `logo`, `rules`, `agents`, `skills`, `commands`, `hooks`, `mcpServers`, `variables`. No `displayName`. https://cursor.com/docs/reference/plugins
- Default component dirs: `skills/`, `rules/`, `agents/`, `commands/`, `hooks/hooks.json`, root `mcp.json`. A manifest field replaces folder discovery for that component.
- Marketplace and local dev (`~/.cursor/plugins/local/<name>`): https://cursor.com/docs/plugins ; publish at cursor.com/marketplace/publish.
- Rules: `.cursor/rules/*.mdc` with `description`, `globs`, `alwaysApply`; plain `.md` there is ignored. https://cursor.com/docs/rules
- Hooks: `.cursor/hooks.json` or `~/.cursor/hooks.json`, `"version": 1` required; events include `sessionStart`, `preToolUse`, `postToolUse`, `beforeShellExecution`, `afterFileEdit`, `beforeSubmitPrompt`, `stop`. https://cursor.com/docs/hooks
- AGENTS.md supported in project root and subdirectories.

## 3. OpenCode
- Skills: project `.opencode/skills/`, `.claude/skills/`, `.agents/skills/`; global `~/.config/opencode/skills/`, `~/.claude/skills/`, `~/.agents/skills/`. https://opencode.ai/docs/skills/
- Frontmatter: `name`, `description` required; `license`, `compatibility`, `metadata` optional. Permissions via `permission.skill` in opencode.json.
- Plugins: local files in `.opencode/plugins/` or `~/.config/opencode/plugins/` auto-load; npm packages in the `plugin` array of opencode.json. https://opencode.ai/docs/plugins/
- Documented hooks: `tool.execute.before/after`, `shell.env`, `experimental.session.compacting`, `tool`, `event`.
- `experimental.chat.system.transform` is not on the plugins page; a maintainer comment says it is in `@opencode-ai/plugin` types at 1.3.13 and 1.16.2. Still experimental. https://github.com/vectorize-io/hindsight/issues/2656
- AGENTS.md: project `AGENTS.md`, global `~/.config/opencode/AGENTS.md`, `CLAUDE.md` fallback. https://opencode.ai/docs/rules/

## 4. Gemini CLI and Antigravity
- Gemini CLI skills: user `~/.gemini/skills/` or `~/.agents/skills/`; workspace `.gemini/skills/` or `.agents/skills/`. https://geminicli.com/docs/cli/skills/
- Commands: `gemini skills list|install <git-url|path>|uninstall` (`--scope user|workspace`). In session: `/skills list|link|enable|disable|reload`. The model calls `activate_skill` and the user confirms.
- Extensions: `gemini extensions install <github-url> [--ref] [--auto-update]`. Manifest `gemini-extension.json`: `name`, `version`, `description`, `mcpServers`, `contextFileName`, `excludeTools`, `settings`, `themes`, `migratedTo`, `plan.directory`. Layout dirs `skills/`, `commands/*.toml`, `hooks/hooks.json`, `agents/`, `policies/`, `GEMINI.md` are auto-found. https://geminicli.com/docs/extensions/reference/
- Antigravity CLI replaced Gemini CLI for unpaid and Google One users on 2026-06-18 (same page).
- Antigravity skills: workspace `.agents/skills/`; global app `~/.gemini/config/skills/`; global CLI `~/.gemini/antigravity-cli/skills/`; CLI plugin `~/.gemini/antigravity-cli/plugins/<name>/skills/`. `name` optional, `description` required. Invoke `/skill-name`. https://antigravity.google/docs/skills
- Antigravity rules: workspace `AGENTS.md`/`GEMINI.md`, `.agents/rules/*.md`; global `~/.gemini/AGENTS.md`, `~/.gemini/config/rules/*.md`; CLI `~/.gemini/antigravity-cli/rules/*.md`. https://antigravity.google/docs/rules

## 5. Agent Skills standard and the Vercel CLI
- Spec https://agentskills.io/specification: `name` (max 64, lowercase/digits/single hyphens, must match folder), `description` (max 1024), optional `license`, `compatibility`, `metadata`, `allowed-tools`. Optional dirs `scripts/`, `references/`, `assets/`. SKILL.md under 500 lines. `skills-ref validate`.
- Vercel `skills` CLI https://github.com/vercel-labs/skills: `npx skills add owner/repo` (interactive choice of skills and agents), `-a/--agent`, `-g` global, Node 22.20+. Agent table https://raw.githubusercontent.com/vercel-labs/skills/main/docs/agents.md:

| Agent | Project | Global |
|---|---|---|
| Codex | .agents/skills/ | ~/.agents/skills/ |
| Cursor | .agents/skills/ | ~/.cursor/skills/ |
| OpenCode | .agents/skills/ | ~/.config/opencode/skills/ |
| Gemini CLI | .agents/skills/ | ~/.gemini/skills/ |
| Antigravity | .agents/skills/ | ~/.gemini/antigravity/skills/ (older IDE path) |
| GitHub Copilot | .agents/skills/ | ~/.copilot/skills/ |
| Windsurf | .windsurf/skills/ | ~/.codeium/windsurf/skills/ |
| Claude Code | .claude/skills/ | ~/.claude/skills/ |
| Universal | .agents/skills/ | ~/.config/agents/skills/ |

## 6. GitHub Copilot and Windsurf
- Copilot: project `.github/skills`, `.claude/skills`, `.agents/skills`; personal `~/.copilot/skills`, `~/.agents/skills`. Works in Copilot CLI, cloud agent, app, VS Code agent mode. https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- Windsurf (now Devin Desktop docs): workspace `.devin/skills/` (`.windsurf/skills/` still read); global `~/.codeium/windsurf/skills/`; also `.agents/skills/`; invoke `@skill-name`. https://docs.devin.ai/desktop/cascade/skills

## Summary table

| Tool | Skills (global) | Skills (project) | Invoke | Plugin manifest | AGENTS.md |
|---|---|---|---|---|---|
| Codex | ~/.agents/skills | .agents/skills | `$name`, `/skills` | plugin.json or .codex-plugin/plugin.json + .agents/plugins/marketplace.json | yes |
| Cursor | ~/.agents/skills, ~/.cursor/skills | .agents/skills, .cursor/skills | `/name` | .cursor-plugin/plugin.json + marketplace.json | yes |
| OpenCode | ~/.config/opencode/skills, ~/.agents/skills | .opencode/skills, .agents/skills | skill tool | JS plugin in .opencode/plugins/ or npm | yes |
| Gemini CLI | ~/.gemini/skills, ~/.agents/skills | .gemini/skills, .agents/skills | `activate_skill` | gemini-extension.json | GEMINI.md |
| Antigravity | ~/.gemini/config/skills (app); ~/.gemini/antigravity-cli/skills (CLI) | .agents/skills | `/name` | plugin.json (see Antigravity report) | yes |
| Copilot | ~/.copilot/skills, ~/.agents/skills | .github/skills, .agents/skills | unverified | none found | not stated |

## Unverified
- Vercel CLI symlink-versus-copy behaviour.
- OpenCode `experimental.chat.system.transform` rests on a maintainer comment.
- Gemini CLI AGENTS.md support; Antigravity workflows path.
