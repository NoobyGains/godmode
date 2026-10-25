# Changelog

All notable changes to GodMode. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-25

A ground-up rebuild. GodMode 1.0 was a 36-skill derivative of superpowers whose session-start hook never ran for anyone. 2.0 keeps the idea, the gated pipeline and the Prime Directive voice, and rebuilds everything around three commitments: facts are verified against current sources, not remembered; every dispatch is sized to the cheapest model that can do the job; nothing is called done without fresh evidence and a second model family's review.

### Fixed
- The SessionStart hook runs on every operating system. 1.0 single-quoted `${CLAUDE_PLUGIN_ROOT}` in `hooks/hooks.json` (bash never expands single-quoted variables) and shipped the hook scripts without the executable bit, so the bootstrap that makes skills trigger was never injected (#1, #2, #4; the fix in PR #3 by @ivnad95 is included). The hook now also runs with an empty PATH, emits one output shape per harness, and skips the Windows Subsystem for Linux `bash` stub.

### Added
- `grounding`: anything the model remembers about an API, CLI, library, version, price or platform rule is a hypothesis until a current source confirms it; sources are recorded.
- `model-routing`: the cheapest capable model per seat, named on every dispatch; turn count over token price; agent teams only when teammates must coordinate.
- `cross-model-review`: one narrow read-only review from a different model family before landing.
- `doctor`: an install self-check that runs the hook the way the harness does and reports what fails.
- Native manifests for Antigravity (`.antigravity-plugin/plugin.json` plus an always-on rule), Codex (`.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json`), Cursor (`.cursor-plugin/plugin.json` and marketplace file), Gemini CLI (`gemini-extension.json`), and a dual V1/V2 OpenCode plugin.
- Per-harness tool references under `skills/using-godmode/references/`, so skill bodies describe actions and never name one harness's tools.
- A zero-dependency validator (`scripts/validate.js`) that fails on tool-name coupling, oversize skills, bad descriptions, hook quoting, missing executable bits, version drift and README drift; hook and manifest tests; CI on Linux, macOS and Windows.
- Generated README pictures (`scripts/readme_assets.py`, SMIL SVG in dark and light) and a rendered brand (`scripts/make_hero.py`, `docs/brand.md`).
- `delegated-execution` gains a progress ledger that survives context compaction, rulings instead of stalls, task brief and report files, per-seat model selection and a bounded fix loop.

### Changed
- 36 skills became 33. Merged: `activation` → `using-godmode`; `intent-discovery` + `specification-first`; `reference-engine` + `github-search` → `reference-first`; `codebase-research` + `pattern-matching` → `codebase-conventions`; `design-research` + `ux-patterns` → `ui-research`; `ui-engineering` + `design-integration`; `system-design` + `deployment-advisor`; `quality-gate` + `comprehension-check` → `code-review`; `quality-enforcement` → `quality-gates`; `task-runner` → `inline-execution`; `agent-messaging` → `agent-briefing`; `protocol-authoring` → `writing-skills`.
- `team-orchestration` describes the current Agent Teams model (teammates are named agents; teams are experimental and opt-in) and keeps harness syntax in the references.
- `knowledge-capture` uses each harness's native memory instead of a bespoke store.
- Slash commands are skills (`/godmode:using-godmode`, `/godmode:doctor`); the `commands/` folder is gone.
- One version across every manifest (`node scripts/bump-version.js`).

### Removed
- The undeployed Vite landing site, the superpowers-era test scripts, the old `lib/` core, and the Codex symlink install.

## [1.0.0] - 2026-03-09

Initial release: 36 skills for Claude Code, Cursor, Codex and OpenCode.

[2.0.0]: https://github.com/NoobyGains/godmode/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/NoobyGains/godmode/releases/tag/v1.0.0
