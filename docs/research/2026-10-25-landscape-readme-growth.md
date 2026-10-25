# Landscape, README craft, animated assets and growth (fetched 2026-10-25)

Research agent report. Counts from the GitHub API on 2026-10-25.

## Part A: Landscape

| Repo | Stars | Last push | License | What it does and install |
|---|---|---|---|---|
| obra/superpowers | 304,851 | 2026-10-23 | MIT | Skills framework and methodology. `/plugin install superpowers@claude-plugins-official` |
| mattpocock/skills | 302,949 | 2026-10-22 | MIT | Small composable skills tied to named failure modes. `claude plugin install mattpocock-skills@claude-plugins-official` |
| affaan-m/everything-claude-code (ECC) | 288,498 | 2026-10-20 | MIT | Harness performance system. `npx ecc-universal@2.2.3 setup` |
| anthropics/skills | 183,665 | 2026-10-09 | mixed | Reference skills and spec |
| github/spec-kit | 142,806 | 2026-10-23 | MIT | Spec-driven development toolkit |
| addyosmani/agent-skills | 110,372 | 2026-10-13 | MIT | 25 lifecycle skills. `npx skills add addyosmani/agent-skills` |
| ruvnet/claude-flow (ruflo) | 79,184 | 2026-10-25 | MIT | Agent harness, swarms |
| hesreallyhim/awesome-claude-code | 56,492 | 2026-10-25 | Other | Curated list |
| bmad-code-org/BMAD-METHOD | 54,534 | 2026-10-20 | Other | Agile AI-driven development |
| wshobson/agents | 41,681 | 2026-10-24 | MIT | Multi-harness marketplace, 94 plugins, 185 skills |
| vercel-labs/skills | 36,483 | 2026-10-19 | MIT | `npx skills add OWNER/REPO` installer |
| davila7/claude-code-templates | 32,885 | 2026-10-25 | MIT | Component installer |
| VoltAgent/awesome-claude-code-subagents | 26,027 | 2026-10-11 | MIT | Subagent list |
| EveryInc/compound-engineering-plugin | 25,701 | 2026-10-25 | MIT | 36 skills, "compound" learning loop |
| SuperClaude-Org/SuperClaude_Framework | 23,914 | 2026-09-27 | MIT | 30 commands, 20 agents |
| NoobyGains/godmode | 114 | 2026-03-09 | MIT | 36 skills (1.0) |

Agent support: superpowers documents 17 harnesses; compound-engineering 14; wshobson adapters for 7; ECC Claude-first with beta adapters; anthropics/skills and SuperClaude are Claude-only.

### superpowers in detail
Skills now (15): brainstorming, diagnosing-superpowers, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills. Added since March: `diagnosing-superpowers` (v6.4.1), native Antigravity manifest (v7.0.0), Codex/Copilot/Devin/Hermes/Grok/OpenCode/Muse/Qwen support. The spec reviewer was replaced by a builder-check subagent; "discard" removed from finishing-a-development-branch. Latest release v7.0.1 (2026-10-21). README is text-first with no badges or hero; it has a commercial contact and a telemetry opt-out. Agent Teams are not mentioned.

### Features worth borrowing
- superpowers: per-harness native manifests, a bootstrap skill, a skill that diagnoses the install itself.
- compound-engineering: learnings written to `docs/solutions/` and read back during planning; report-only review; bounded autonomous run; a GIF leads the README.
- ECC: gated TDD with recorded failing and passing evidence; hooks for deterministic checks; search-first skill; eval harness; install-state record so uninstall only touches managed files.
- spec-kit: verdict exit states (verified, partial, failed) and a convergence loop.
- addyosmani: anti-rationalisation tables, evidence gates at the end of each skill.
- wshobson: a table of per-harness limits; `plugin-eval` scoring skills offline.
- mattpocock: each skill tied to a named failure mode; positions against heavy frameworks.
- SuperClaude: confidence-scored research with a 0.6 minimum; a `doctor` command.

## Part B: Gap analysis

| Candidate | Verdict |
|---|---|
| One install for all harnesses | Crowded (superpowers 17, compound 14) |
| Web-grounded "verify before you code" | Partly covered (ECC search-first, addyosmani source-driven-development, mattpocock research, SuperClaude scored research); none makes checking current docs the headline discipline |
| Machine-checked quality gates | Partly covered (ECC evidence recording, spec-kit verdicts); hook-enforced, machine-verifiable gates least served |
| Agent Teams recipes | Likely open (not in superpowers README; others not searched) |
| Skill test harness and evals | Partly covered (`claude plugin eval`, wshobson plugin-eval, ECC eval harness); few publish eval results for their own skills |
| Honest token-cost awareness | Partly covered; per-skill measured cost looks open |

Most defensible position: web-verified, evidence-gated, with published evals and Agent Teams recipes.

## Part C: README craft
Observed: compound-engineering leads with a GIF and badges "CI, MIT, Skills: 36"; ruflo has an animated neon GIF, comparison table and console walkthrough; spec-kit has a logo and star-history chart; ECC has a hero PNG and many badges; mattpocock ties four failure modes to fixes; wshobson tabulates per-harness limits. Star-history embeds: spec-kit, wshobson, claude-code-templates. Contributors wall: not seen.

Recommended order: (1) logo, one-line promise, 4-5 badges; (2) animated before/after demo on one task; (3) install, one line per harness, in a table; (4) the problem as named failure modes mapped to skills; (5) how it works, diagram plus alt text; (6) honest comparison table with "use them instead when" rows; (7) skills grouped by phase; (8) evidence: eval results and gate examples; (9) harness table with per-harness limits; (10) star history, contributing, licence, privacy note.

## Part D: Animated README assets
- SVG via `<img>`: SMIL (`<animate>`, `<animateTransform>`, `<set>`) is preserved and plays (https://github.com/WaterTian/svg-motion-cookbook). CSS keyframes: sources disagree (https://prlens.dev/guides/animated-svg-in-github-comments says both survive; the cookbook says CSS is stripped). JavaScript never runs. `foreignObject`: unconfirmed. No camo/CSP changes found for 2025-2026. Action: verify on the live README after push.
- Terminal recorders: charmbracelet/vhs (21,197 stars, v0.12.1 2026-09-24; GIF/MP4/WebM; `winget install charmbracelet.vhs`), agg (GIF only), svg-term-cli (unmaintained since 2024), termtosvg (archived).
- Dark/light: `<picture>` with `<source media="(prefers-color-scheme: dark)">` is GitHub's documented approach (https://github.blog/changelog/2022-08-15-specify-theme-context-for-images-in-markdown-ga); `#gh-dark-mode-only` fragments are deprecated.
- Social preview: PNG/JPG/GIF under 1 MB, 1280x640 best (https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview).

## Part E: Growth (mechanisms, not measured lifts)
1. Official Claude plugin marketplace: submit via https://clau.de/plugin-directory-submission.
2. Make `npx skills add OWNER/REPO` work; skills.sh ranks by installs.
3. skills.sh badge (used by anthropics/skills, vercel-labs/skills, mattpocock/skills).
4. Submit to awesome-claude-code via its issue form (repo needs 14+ days with commits or 100+ stars).
5. Get listed in VoltAgent/awesome-agent-skills.
6. Up to 20 topics: `agent-skills`, `claude-code`, `claude-skills`, `codex`, `antigravity`, `opencode`, etc.
7. 1280x640 social preview under 1 MB.
8. Trendshift badge and submission.
9. Lead with a short demo.
10. Ship evals with `claude plugin eval` and publish pass rates (https://code.claude.com/docs/en/plugin-evals).

Show HN, Reddit, X and Product Hunt effects: no evidence found.
