# Changelog

All notable changes to GodMode. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [Semantic Versioning](https://semver.org/).

## [2.1.0] - 2026-10-25

Seven months of Claude Code changes and a pass over nine peer projects, read from their source (research in `docs/research/2026-10-25-claude-code-and-peers-2-1.md`). The theme: rules that must hold every time move from prose into mechanisms the harness enforces, and plans and designs lean on what superpowers 7.0.1 learned the hard way.

### Added
- `completion-gate` arms a one-shot stop check on Claude Code: a prompt-type `Stop` hook declared in the skill's frontmatter (`once: true`) re-reads the final message and sends an unsupported done/fixed/passing claim back for evidence, then removes itself. Verified end to end on Claude Code 2.1.310 (`tests/acceptance/claude-code-stop-check.sh`, `docs/verification/claude-code-stop-check-2026-10-25.md`). Other harnesses ignore the field.
- `bin/godmode`: a plan-workspace helper (`workspace`, `brief`, `review-package`, `ledger`, `status`) on the shell PATH where the harness adds a plugin's `bin/` (Claude Code, Antigravity); `delegated-execution` and `inline-execution` prefer it and keep the plain-shell commands as the fallback. Tested by `tests/test-bin.sh`.
- `task-planning`: every task carries an Interfaces block (what it consumes from earlier tasks, what later tasks rely on, exact signatures); the plan header gains a Review Focus section (the five input classes the design implies but no task tests); the self-review checks both.
- `intent-discovery`: a builder-check prompt as a reference file, dispatched for projects only; the first message echoes a detailed request back with what the project survey found and asks the one open question; the offer to skip the questions appears only when the skill started on its own.
- `test-first`: for a bug fix the reproducing test is its own commit before the fix, so the red evidence survives in history.
- `fault-diagnosis` hands a verified non-obvious root cause to `knowledge-capture`.
- Validator: a 20,000-byte cap per skill and a rule that `## The Protocol` sits within the first 8,000 bytes, because Claude Code re-attaches only the first 5,000 tokens of each invoked skill after compaction; `writing-skills` records both.
- Plugin manifest fields `displayName`, `documentationUrl` and `supportUrl`; marketplace `tags`.

### Changed
- `task-planning` writes decisions, not transcripts: a test step carries the test as code with the design's values; a code step carries the exact signature, file and pinned values, and the builder writes the body unless the signature and tests do not determine it. A plan several times longer than its design is flagged by the self-review.
- `code-review`: a finding that cannot quote the line it is about is at most Minor, and reviewer agreement does not raise a severity. The shipped `code-reviewer` agent is read-only by its tool list.
- Codex manifest (`.codex-plugin/plugin.json`) keeps its metadata under `extensions.com.openai` as the Codex plugin docs specify, names `doctor` as the onboarding skill, and drops the empty `hooks` key (plugins with lifecycle hooks are not eligible for the public directory). Reinstall verified on Codex CLI 0.163.
- `model-routing`: a scoped re-review runs on a mid-tier model at low effort, not the cheapest tier.
- Acceptance scripts pre-allow the Skill tool: a skill that declares hooks asks for permission in the default permission mode, which a headless run auto-denies. Interactive users answer the prompt once.

### Fixed
- `tests/test-bin.sh` no longer fails under `pipefail` when `grep -q` closes the pipe early.

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

[2.1.0]: https://github.com/NoobyGains/godmode/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/NoobyGains/godmode/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/NoobyGains/godmode/releases/tag/v1.0.0
