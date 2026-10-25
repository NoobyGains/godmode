# 2.1 round: Claude Code changes since March 2026 and peer-project mechanisms

Date: 2026-10-25. Two web-researcher passes (Claude Code changelog and docs; nine peer projects read from their source files) plus direct reads of the official docs and a local clone of obra/superpowers 7.0.1. Only items that changed GodMode are listed with their evidence; the rest of the research is summarised at the end.

## Claude Code facts GodMode now relies on

| Fact | Source | Used in |
|---|---|---|
| Skill frontmatter `hooks` registers hooks when the skill is invoked and keeps them for the session; `once: true` removes a hook after its first successful run and is honoured only in skill frontmatter | https://code.claude.com/docs/en/hooks#hooks-in-skills-and-agents | `completion-gate` arms a one-shot Stop check |
| Prompt-type Stop hooks answer `{"ok", "reason", "impossible"}`; `ok: false` feeds the reason back as the next instruction; eight consecutive continuations end the turn (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`); Claude Code wraps the prompt as "has the following stopping condition been satisfied? Condition: ..." | https://code.claude.com/docs/en/hooks (Stop, prompt hooks); debug log of the acceptance run | hook text written as a condition |
| Invoking a skill that declares hooks asks for permission in the default mode ("Execute skill: ..."); a `-p` run auto-denies it unless `Skill` is in `--allowedTools` | observed 2026-10-25 on 2.1.310, see docs/verification/claude-code-stop-check-2026-10-25.md | acceptance scripts pass `--allowedTools Skill`; reference documents the prompt |
| After compaction only the first 5,000 tokens of each invoked skill are re-attached, 25,000 tokens across skills, newest first | https://code.claude.com/docs/en/skills#skill-content-lifecycle | validator: `## The Protocol` within the first 8,000 bytes; writing-skills rule |
| Skill listing budget is 1% of the context window, least-used descriptions dropped first; each description cut at 1,536 characters | https://code.claude.com/docs/en/skills#skill-descriptions-are-cut-short | measured: 33 skills, 7,540 description characters, no overflow warning in a sonnet session's debug log |
| Agent frontmatter `tools` accepts a comma string or a YAML list; plugin agents ignore `hooks`, `mcpServers`, `permissionMode` | https://code.claude.com/docs/en/sub-agents | `agents/code-reviewer.md` read-only tool list (YAML list form, which Antigravity's loader also accepts) |
| Other fields available: `context: fork` + `agent` + `background`, `paths`, `when_to_use`, `shell`, `effort`; agent `maxTurns`, `isolation: worktree`, `omitClaudeMd`, `memory`, `skills` | same pages | documented in `skills/using-godmode/references/claude-code-tools.md`; not adopted (see below) |
| `/goal` is a session-scoped prompt Stop hook; `claude plugin eval` graders `tool_used: Skill` are indicators under with-without ablation | https://code.claude.com/docs/en/goal ; https://code.claude.com/docs/en/plugin-evals | reference; eval re-run for the completion case |

Not adopted, with the reason: `paths` on any skill (it limits automatic loading to matching files, and most GodMode skills apply before a file exists); `context: fork` (GodMode skills steer the main agent and need the conversation); `memory` on the reviewer agent (it turns on write tools, which breaks read-only review); `workflows/` (David's rule: workflows only on request); `userConfig` (nothing to configure yet).

## Codex facts

| Fact | Source | Used in |
|---|---|---|
| Plugin metadata lives under `extensions.com.openai` (`interface`, `apps`, `hooks`, `onboardingSkill`); plugins with lifecycle hooks are not eligible for the public directory | https://developers.openai.com/codex/plugins/build | `.codex-plugin/plugin.json` restructured; `onboardingSkill` points at `godmode:doctor`; the empty `hooks` key removed; reinstall verified with `codex plugin add godmode@godmode` (CLI 0.163) |
| Skill list budget 2% of the context window (8,000 characters when unknown), descriptions shortened first; no documented cap on SKILL.md size | https://learn.chatgpt.com/docs/build-skills (redirect target of developers.openai.com/codex/skills) | reference; a third-party claim of an 8 KB Codex skill cap was not confirmed and was ignored |

## Peer mechanisms adopted

| Mechanism | Where it came from | Where it went |
|---|---|---|
| Context-first first message: echo a detailed request back with what the survey found and ask the one open question; offer to skip only when the skill started on its own; builder check only for projects | obra/superpowers 7.0.1 `skills/brainstorming/SKILL.md`, release notes 7.0.1 (#2560, #2571) | `intent-discovery` step 3 and step 9; new `references/builder-check-prompt.md` |
| Plan tasks carry Consumes/Produces interfaces; a Review Focus section lists the five uncovered failure modes; a plan states decisions (signatures, tests, pinned values), not function bodies | superpowers 7.0.1 `skills/writing-plans/SKILL.md` | `task-planning` header, task template, self-review, traps |
| 20,000-byte skill size test | superpowers 7.0.1 `tests/skill-size/test-skill-size.sh` (#2565) | `scripts/validate.js` (done earlier in this round) |
| RED evidence as its own commit (`test: reproduce ...` before `fix:`) | affaan-m/everything-claude-code `skills/tdd-workflow/SKILL.md` | `test-first` step 8 |
| A finding without an evidence quote is at most Minor; reviewer agreement does not raise severity | EveryInc/compound-engineering-plugin `docs/guides/ce-code-review.md` | `code-review/reviewer-template.md`, `agents/code-reviewer.md` |
| Lessons loop: a verified non-obvious root cause is recorded with symptoms, what did not work, why the fix works | compound-engineering `docs/guides/ce-compound.md` | `fault-diagnosis` connection to `knowledge-capture` (whose entry format already carries why and how-to-apply) |

Already present in GodMode 2.0 and therefore not changed: the pre-flight scan, same-shape batching, "cannot verify from diff" handling and the ledger/rulings format (superpowers `subagent-driven-development/references/`); the Rationalisation/Reality tables (addyosmani/agent-skills); the three-state verdict and gap types missing/partial/contradicts/unrequested (github/spec-kit `converge`); search across channels with the queries listed when nothing fits (ECC `search-first`, already in `reference-first`).

Considered and rejected: SuperClaude's numeric confidence thresholds (its README and skill disagree on the numbers; pseudo-precision); ECC's install-state hash manifest (harnesses own installation); a plugin-level Stop hook that runs on every turn (cost and noise; the skill-scoped once hook covers the moment that matters); nizos/tdd-guard style PreToolUse enforcement (framework reporters per language, out of scope for a cross-harness skill set).

## Sources (fetched 2026-10-25)

- https://code.claude.com/docs/en/skills ; https://code.claude.com/docs/en/hooks ; https://code.claude.com/docs/en/sub-agents ; https://code.claude.com/docs/en/permissions ; https://code.claude.com/docs/en/plugin-evals
- https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md (version markers: skill hooks 2.1.0, `once` and `background` 2.1.218, `paths` 2.1.84, `bin/` 2.1.91, plugin eval 2.1.269, `/goal` 2.1.139, listing budget 1% 2.1.32, `omitClaudeMd` 2.1.271, `autoCompactWindow` 2.1.296)
- https://github.com/obra/superpowers (clone of v7.0.1, 2026-10-21) ; https://github.com/EveryInc/compound-engineering-plugin ; https://github.com/affaan-m/everything-claude-code ; https://github.com/addyosmani/agent-skills ; https://github.com/mattpocock/skills ; https://github.com/wshobson/agents ; https://github.com/github/spec-kit ; https://github.com/SuperClaude-Org/SuperClaude_Framework ; https://github.com/nizos/tdd-guard
- https://developers.openai.com/codex/plugins/build ; https://learn.chatgpt.com/docs/build-skills ; https://antigravity.google/docs/plugins?tab=cli
