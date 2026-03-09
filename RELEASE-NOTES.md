# GodMode Release Notes

## v1.0.0 (2026-03-09)

### Initial Release

GodMode v1.0.0 ships with 32 composable skills covering the full AI development lifecycle.

### Skills

**Core Workflow (5 skills)**
- `activation` — Bootstrap and skill routing
- `intent-discovery` — Requirements gathering and scope definition
- `task-planning` — Spec-driven plan decomposition
- `task-runner` — Guided task execution with verification
- `completion-gate` — Final validation before delivery

**Execution Patterns (5 skills)**
- `delegated-execution` — Sequential multi-step with review gates
- `parallel-execution` — Independent concurrent subagents
- `team-orchestration` — Peer-to-peer agent collaboration
- `agent-messaging` — Structured inter-agent communication
- `workspace-isolation` — Git worktree-based parallel development

**Quality & Review (4 skills)**
- `quality-gate` — Code review with explicit file reading
- `review-response` — Structured review feedback handling
- `quality-enforcement` — Automated quality standards
- `comprehension-check` — Post-implementation understanding verification

**Research & References (4 skills)**
- `reference-engine` — Universal reference-first routing
- `github-search` — External open-source research
- `codebase-research` — Internal codebase pattern analysis
- `design-research` — Theme and design system research

**Development Practices (5 skills)**
- `test-first` — Test-driven development workflow
- `specification-first` — Spec-driven development
- `fault-diagnosis` — Systematic debugging methodology
- `merge-protocol` — Branch finalization and merge readiness
- `pattern-matching` — Codebase convention conformance

**Architecture & Design (4 skills)**
- `system-design` — Architecture pattern selection
- `ui-engineering` — Frontend implementation methodology
- `design-integration` — Design system integration
- `ux-patterns` — UX reference system and pattern library

**Infrastructure & Operations (3 skills)**
- `project-bootstrap` — Project scaffolding from references
- `performance-tuning` — Performance optimization methodology
- `security-protocol` — Security-aware development

**Meta (2 skills)**
- `protocol-authoring` — Creating new skills
- `knowledge-capture` — Learning from completed work

### Platform Support

- **Claude Code** — Primary platform with SessionStart hook injection
- **Cursor** — Plugin manifest at `.cursor-plugin/plugin.json`
- **OpenCode** — Plugin at `.opencode/plugins/godmode.js`
- **Codex** — Native skill discovery via symlinks

### Infrastructure

- Skill validator (`scripts/validate-skills.js`) with CI pipeline
- Core library (`lib/skills-core.js`) for skill discovery and resolution
- Three-tier priority system: project > personal > godmode
- Cross-reference validation across skills and agents
