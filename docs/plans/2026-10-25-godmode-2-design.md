# GodMode 2.0 design

Date: 2026-10-25. Status: approved for build. Research inputs: `docs/research/2026-10-25-*.md`.

## 1. Why a rebuild

GodMode 1.0 (March 2026) is a derivative of obra/superpowers with 36 skills. Seven months on:

- The SessionStart bootstrap never ran for anyone. `hooks/hooks.json` single-quoted `${CLAUDE_PLUGIN_ROOT}` and the hook scripts were committed without the executable bit (issues #1, #2, #4; PR #3 closed unmerged). Skills loaded, but nothing told the model to use them.
- Skill bodies hard-code one harness's tool names (`TeamCreate`, `TodoWrite`, `Agent`, JSON parameter tables), so the same files cannot drive Codex, Antigravity, Gemini CLI or Cursor. The "Codex" and "OpenCode" support was a symlink and an unverified plugin stub.
- Several skills overlap (three quality skills, three research skills, four UI skills, two execution skills that differ only by who reviews), which dilutes triggering: the model reads six descriptions where two would do.
- The facts inside skills (tool names, environment variables, coverage tool names, marketplace commands) were written from model memory and have drifted.
- The README's "how this README was built" story and the four static SVGs were fine for a launch; the project has 114 stars and 31 forks and no activity since.

Of the 31 forks, two added anything: `urbabby/godmode` (an `orchestrator-core` loop: comprehension, plan, route, execute, verify, memorise or replan, report) and `nicolelung20-cmyk/godmode` (an `AGENTS.md` operating contract and a shared-memory handoff packet). The unmerged `origin/dev/memory-system` branch (a JSON memory store with TF-IDF search) is superseded by Claude Code's native auto-memory and stays unmerged.

## 2. Positioning

**GodMode is the engineering discipline layer for AI coding agents.** The agent questions the request before building, checks current documentation instead of its memory, plans, builds test-first on the cheapest model that can do the job, gets a second opinion from a different model family, and proves the result before it says done. One repository installs into Claude Code, Codex, Antigravity, Cursor, Gemini CLI, OpenCode and Copilot CLI.

Three things nobody in this niche owns yet (gap analysis in research report 3):

1. **Grounded, not remembered.** A `grounding` skill makes every fact that can change (an API, a flag, a version, a price, a platform rule) a thing to verify against a current source and cite, never to recall. Model memory is treated as a hypothesis.
2. **Cost-disciplined orchestration.** `model-routing` sizes every seat (implementer, reviewer, lead) to the cheapest capable model and names it on every dispatch; `using-godmode` routes each task to the lightest execution mode (direct, inline, delegated, parallel, team) that fits. Agent teams are a tool, not a default.
3. **Evidence gates with a second model family.** `completion-gate` demands fresh output for every claim; `cross-model-review` sends the diff to a reviewer from another model family (Codex, Gemini, or a Claude subagent as fallback) before landing.

Inherited strengths that stay: `rationale` (should we build it at all?), `reference-first` (find the proven implementation before designing), `environment-awareness` (Windows, shells, package managers), and the gated define → plan → execute → review → ship pipeline.

Honesty rules for all copy: no unverifiable superlatives, no invented metrics; demo pictures are labelled as illustrations of a session, not transcripts.

## 3. Skill set: 36 → 32

Legend: **keep** (rewrite in place), **merge** (into the named skill), **new**.

| 2.0 skill | From 1.0 | Decision and reason |
|---|---|---|
| `using-godmode` | `activation` | keep, rename. The bootstrap. Trigger-only description ("Use when starting any conversation"), because Antigravity has no session-start hook and relies on the description. Per-harness tool mappings move to `references/<harness>-tools.md`. Execution-mode routing table lives here. |
| `rationale` | `rationale` | keep. The "should we build this" gate. |
| `intent-discovery` | `intent-discovery` + `specification-first` | merge. The design document gains a short specification section (inputs, outputs, edge cases, acceptance criteria) scaled to the work; a separate spec skill never triggered distinctly. |
| `grounding` | new | Facts that can change are verified against current sources (official docs, Context7, web search) and cited in the plan; model memory is a hypothesis. Defines what counts as "a fact that can change", the verification ladder, how to record sources, and what to do when sources disagree. |
| `reference-first` | `reference-engine` + `github-search` | merge. One router with the domain libraries (API, schema, testing, CI/CD, architecture) and the GitHub/package-registry search method as reference files. |
| `codebase-conventions` | `codebase-research` + `pattern-matching` | merge. Survey precedents, replicate conventions, check conformity before commit: one skill, one trigger ("before adding code to an existing codebase"). |
| `ui-research` | `design-research` + `ux-patterns` | merge. Template and pattern research before any UI; pattern libraries and token templates become reference files. |
| `ui-engineering` | `ui-engineering` + `design-integration` | merge. Build components inside the project's design system with structure, states and accessibility defined first. |
| `system-design` | `system-design` + `deployment-advisor` | merge. Architecture and hosting decisions driven by current requirements and what the user already runs. |
| `task-planning` | `task-planning` | keep. |
| `delegated-execution` | `delegated-execution` | keep, upgrade: progress ledger on disk (survives compaction), rulings instead of stalls, per-seat model selection, bounded fix loop with escalation, batching of same-shape tasks, report files instead of pasted output. |
| `inline-execution` | `task-runner` | keep, rename. Same plan, one context, one final review: the cheap mode. |
| `parallel-execution` | `parallel-execution` | keep. |
| `team-orchestration` | `team-orchestration` | keep, rewrite: actions not tools; the harness tool tables move to references; verified against current Agent Teams documentation. |
| `agent-briefing` | `agent-messaging` | keep, rename. Brief and handoff templates used by every dispatching skill. |
| `workspace-isolation` | `workspace-isolation` | keep. |
| `model-routing` | new | Cheapest capable model per role, named on every dispatch; turn count beats token price; effort levels; per-harness model names in references; token budget awareness. |
| `test-first` | `test-first` | keep. |
| `code-review` | `quality-gate` + `comprehension-check` | merge. Two-stage review (spec compliance, then quality) by a fresh reviewer, plus the plain-language change walkthrough and disclosure of unsolicited changes. |
| `cross-model-review` | new | One narrow read-only review by a different model family before landing; brief file, exact checks, no sub-agents; how to run it on each harness (Codex, Gemini via `agy`, Claude subagent). |
| `quality-gates` | `quality-enforcement` | keep, rename. Machine-enforced checks: lint, types, coverage ratchet, build, size, audit, complexity. |
| `completion-gate` | `completion-gate` | keep. |
| `review-response` | `review-response` | keep. |
| `fault-diagnosis` | `fault-diagnosis` | keep (with its supporting method files). |
| `error-recovery` | `error-recovery` | keep. |
| `merge-protocol` | `merge-protocol` | keep. |
| `project-bootstrap` | `project-bootstrap` | keep. |
| `environment-awareness` | `environment-awareness` | keep. |
| `performance-tuning` | `performance-tuning` | keep. |
| `security-protocol` | `security-protocol` | keep. |
| `writing-skills` | `protocol-authoring` | keep, rename. Test-driven skill authoring; the GodMode skill template and validator rules. |
| `knowledge-capture` | `knowledge-capture` | keep, rewrite to use each harness's native memory (Claude Code auto-memory, Antigravity rules, AGENTS.md notes) instead of a bespoke store. |

Removed outright: none. Twelve 1.0 names disappear by merging; the README and validator carry the mapping so old references resolve to the new names.

## 4. Skill-authoring rules (binding for every worker)

1. **Frontmatter**: `name` equals the directory name, lowercase with hyphens; `description` starts with "Use when", states triggering situations only, never summarises the workflow, third person, under 400 characters. These are the only two fields unless the platform research says a field is honoured everywhere.
2. **Body order**: H1 title; Overview (2-4 sentences, core principle in bold); `## The Prime Directive` (one line in a code block, followed by the GodMode line "No exceptions. No workarounds. No shortcuts."); `## When to Use` (required / skip); `## The Protocol` (numbered steps; a Graphviz block only where the flow branches); `## Cognitive Traps` (table, at least five rows, rationalisation versus truth); `## Guardrails` (Never / Always); `## Connections` (related `godmode:` skills, each with when it hands off). Skills with heavy reference material add `references/*.md` and link to them.
3. **Actions, not tools.** Bodies say "dispatch a subagent", "create a task", "invoke skill X", "read the file", "search the web". They never name a harness tool (`Agent`, `Task`, `TodoWrite`, `TeamCreate`, `SendMessage`, `invoke_subagent`, `spawn_agent`), a harness environment variable, or harness-specific JSON. Those live only in `skills/using-godmode/references/<harness>-tools.md`. Shell commands (`git`, `npm`, `pytest`) are fine. The validator fails the build on violations.
4. **Facts that can change are cited.** Any tool name, flag, URL, version, limit or price comes from a research report or a source the worker fetched during the rewrite, with the URL in a comment or reference file. Nothing is written from memory.
5. **Length**: 120 to 350 lines per SKILL.md; move anything longer into references.
6. **Voice**: plain, direct, second person to the agent, "the user" for the human. No emoji in skill bodies. British or American spelling may vary; consistency within a file.
7. **Cross-references** use `godmode:<skill>` with 2.0 names only.

## 5. Platform delivery

The skills are identical on every harness. Per harness, GodMode ships only the thin layer that (a) installs the skills through the harness's own mechanism and (b) gets the `using-godmode` bootstrap in front of the model at session start. The invariants and shapes follow superpowers' porting guide; the facts below are from the research reports.

| Harness | Install (user runs) | Manifest in repo | Bootstrap mechanism | Tool mapping |
|---|---|---|---|---|
| Claude Code | `/plugin install godmode --marketplace NoobyGains/godmode` (one step on 2.1.275+; two-step `marketplace add` + `install` on older) | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `hooks/hooks.json` | SessionStart command hook: `run-hook.cmd session-start` prints `hookSpecificOutput.additionalContext` with the bootstrap | `references/claude-code-tools.md` |
| Antigravity (`agy`) | `agy plugin install https://github.com/NoobyGains/godmode` | `.antigravity-plugin/plugin.json` + `assets/icon.png` logo | No session-start hook exists; the skill index surfaces `using-godmode`'s "Use when starting any conversation" description and the model loads it | `references/antigravity-tools.md` |
| Codex CLI / App | `codex plugin marketplace add https://github.com/NoobyGains/godmode` then `codex plugin add godmode@godmode` | `.codex-plugin/plugin.json` (with `"hooks": {}` to suppress hook discovery), `.agents/plugins/marketplace.json` | Native skill discovery; `$godmode:using-godmode` | `references/codex-tools.md` |
| Cursor | `/add-plugin` from marketplace or the repo | `.cursor-plugin/plugin.json`, `hooks/hooks-cursor.json` | sessionStart hook printing `additional_context` | `references/cursor-tools.md` |
| Gemini CLI | `gemini extensions install https://github.com/NoobyGains/godmode` | `gemini-extension.json` with `contextFileName: GEMINI.md`; `GEMINI.md` includes the bootstrap | Extension context file | `references/gemini-tools.md` |
| OpenCode | one-line "fetch and follow `.opencode/INSTALL.md`" | `.opencode/plugins/godmode.js` | plugin system-prompt transform (API verified against current docs) | `references/opencode-tools.md` |
| GitHub Copilot CLI | `copilot plugin marketplace add NoobyGains/godmode` then `copilot plugin install godmode@godmode` | reuses the Claude Code plugin + hook (`additionalContext` top-level) | SessionStart hook | `references/copilot-tools.md` |

Exact field names, output shapes and commands are confirmed against research reports 1, 2 and 4 before any manifest is written; where a report could not confirm a harness, the README says "untested" rather than claiming support.

## 6. Infrastructure

- `hooks/hooks.json`: double-quoted `"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd" session-start`, `startup|resume|clear|compact`, `"shell": "bash"` if the spec confirms the field. `hooks/run-hook.cmd` and `hooks/session-start` committed with mode 100755 (`git update-index --chmod=+x`), LF endings forced by `.gitattributes`.
- `hooks/session-start`: PATH-independent (no `cat`, no `dirname`), reads `skills/using-godmode/SKILL.md`, JSON-escapes with parameter expansion, emits exactly one output shape chosen by environment (`CURSOR_PLUGIN_ROOT`, `CLAUDE_PLUGIN_ROOT`, `COPILOT_CLI`), uses `printf | cat` to absorb EPIPE on Windows.
- `hooks/run-hook.cmd`: polyglot wrapper that finds Git Bash in the system and per-user locations, skips the WSL `bash` stub, falls back to `bash` on PATH.
- `scripts/validate.js` (zero dependencies, Node 20+): frontmatter rules from section 4; `godmode:` cross-references resolve; tool-name coupling lint; exec bits on hook scripts; hooks.json quoting; versions equal across every manifest and `package.json`; README skill count and skill table match `skills/`; `.version-bump.json` lists every manifest; icon PNG square and 512-2048 px.
- `scripts/bump-version.sh`: one command bumps every manifest.
- `scripts/doctor` (bash, run via `run-hook.cmd doctor` or `/godmode:doctor`): confirms the install root, exec bits, that the hook prints valid JSON, and which harness it is running in.
- `tests/`: hook smoke test (`sh -c` with `CLAUDE_PLUGIN_ROOT`, asserts valid JSON containing the bootstrap), manifest tests per harness, validator self-test. CI runs them on ubuntu, macos and windows.
- `.github/workflows/validate.yml` (matrix) and `star-history.yml` (weekly chart, adapted from usage-pulse).
- Removed: `site/` (undeployed Vite app), `lib/skills-core.js` (only the validator used it; folded in), `docs/svg-design-reference.md` (replaced by `scripts/readme_assets.py`), `tests/explicit-skill-requests` (superpowers-era prompts that reference 1.0 names).
- Kept: `agents/code-reviewer.md` (frontmatter refreshed), `commands/` only if the spec still prefers them over skills for slash commands.

## 7. README and assets

Structure mirrors usage-pulse: theme-aware `<picture>` logo; one-line promise; one `flat-square` badge row; nav row; the hero demo in the first screen; a 3×2 "Why GodMode" grid; install per harness with the one-step Claude Code line first and the rest short, details collapsed; one `###` per demo with its own animated picture; the pipeline picture; the skill table collapsed by group; "What GodMode is not"; contributing; thanks (ivnad95, g7trader, AdversaLLC, urbabby); licence.

Assets are generated, never hand-edited: `scripts/make_logo.py` (wordmark as Cascadia Code outlines; the mark is being redesigned after the first version looked like Usage Pulse), `scripts/readme_assets.py` (every demo scene as SMIL-animated SVG in dark and light, with a width guard so no line can overflow), `assets/icon.png` (512 px square for the Claude plugin directory and the Antigravity marketplace), `scripts/star_history.py` (weekly chart committed by CI).

## 8. Verification bar before release

1. `node scripts/validate.js --ci` clean; `npm test` green.
2. `claude plugin validate .` passes with no icon warning; `agy plugin validate . --strict` passes.
3. Hook smoke test passes on Windows Git Bash (this machine) and on ubuntu and macos in CI.
4. Local install into Claude Code from the repo marketplace, then a headless session with the prompt "Let's make a react todo list" invokes `intent-discovery` (or `rationale`) before any code is written. Transcript saved under `docs/verification/`.
5. `agy plugin install` of the repo, then `agy -p` with the same prompt loads `using-godmode` and a design skill before any code.
6. Codex: marketplace add + plugin add from the repo succeeds and `$godmode:using-godmode` resolves.
7. One Codex review pass of the diff; findings fixed and re-verified.
8. After push: every README picture is screenshotted on github.com with Playwright and inspected.

## 9. Release

Version 2.0.0. Push to `master`, tag `v2.0.0`, GitHub release with notes; close issues #1, #2, #4 with a comment; thank ivnad95 on PR #3; set repository description and topics; David uploads the social preview image in the GitHub UI (no API for it).

## 10. Decisions log

- Keep the name and repository (stars and forks stay attached); no rename.
- Skill count is not the headline; the pipeline and the three pillars are.
- No telemetry of any kind.
- Zero runtime dependencies; Node is needed only to run the validator and tests.
- Demo pictures are illustrations and say so in their captions.
