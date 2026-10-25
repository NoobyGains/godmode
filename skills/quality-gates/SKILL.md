---
name: quality-gates
description: "Use when setting up or changing a project's lint, type, test, coverage, build, size, audit, complexity or dead-code checks, when a commit, pull request or merge is being prepared, and when a check fails or someone proposes to disable, skip or loosen one."
---

# Quality Gates

Anything a machine can check, a machine checks, on every change, in CI, with the same configuration everyone runs locally. A check that only runs when someone remembers is a suggestion. **When a check fails, the code changes; the check does not.**

## The Prime Directive

```
NEVER DISABLE, SKIP OR LOOSEN A CHECK TO MAKE IT PASS
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Setting up a new project or a new CI pipeline.
- Before a commit, a pull request or a merge: run the gates locally and read the output.
- When a gate fails, in CI or locally.
- When anyone (you, a subagent, a reviewer, the user) proposes to turn off a rule, add a suppression comment, lower a threshold or skip CI.

**Skip:**
- Nothing in an existing project. In a throwaway spike, agree with the user which gates apply and say so.

## The Protocol

1. **Inventory what exists.** Read the project's scripts (`package.json`, `pyproject.toml`, `Makefile`, `Cargo.toml`, `go.mod`), the linter and type-checker configs and the CI workflow files. List which of the eight gates below are configured, which run in CI, and what their thresholds are. Use the project's own commands; do not invent new ones when the project already has them.

2. **Run every configured gate locally and record the output.** Run the full command, not a subset, and read the exit code and the counts. A gate you did not run this session has no status.

3. **Fix failures in the code.** A lint warning is fixed in the code. A type error is fixed in the types. A coverage drop is fixed with tests (written with `godmode:test-first`). A vulnerable dependency is upgraded, replaced or, if no fix exists, recorded with the user's decision and a review date.

4. **Add missing gates when you set up or are asked to harden a project.** Add them in the order of the table below, one per commit, each green before the next. Adding a gate to an existing codebase that fails it: fix the existing violations first, or set the ratchet at today's level and record a plan to tighten it; never land a gate that is red on arrival.

5. **Make CI enforce what runs locally.** The same commands, the same configs, required on every pull request, failing the job on any violation. Check that each tool really exits non-zero on a finding before you trust it in CI; run it once against a known violation and read the exit code.

6. **Handle a request to loosen a gate.** Stop, and put the question to the user with the evidence: which rule, which code triggers it, why the rule might genuinely be wrong for this project. A rule that is wrong for the project is changed in the config file with a comment that explains why, and the change is a disclosed, reviewed change. A rule that is inconvenient stays.

7. **Report.** Hand the gate results to `godmode:completion-gate` as evidence: each gate, the command, the result.

## The Eight Gates

| Gate | Standard | Fails when |
|---|---|---|
| Lint | Zero errors and zero warnings | Any warning or error |
| Types | Strict mode, zero errors | Any type error |
| Tests and coverage | Suite green; coverage never drops (ratchet) | A failing test, or coverage below the recorded floor |
| Build | Clean build, zero warnings | Non-zero exit or any warning |
| Size budget | Bundle or binary within the agreed budget | Over budget |
| Dependency audit | No known high or critical vulnerability | A high or critical advisory without a recorded decision |
| Complexity | Functions under the agreed threshold | A function over it |
| Dead code | No unused files, exports or dependencies | An unused item |

### Lint

Zero warnings, because a warning that is tolerated today is noise that hides tomorrow's real one. Commit the config. Report unused suppression comments too.

<!-- ESLint CLI: --max-warnings fails the run when warnings exceed the number; --report-unused-disable-directives. https://eslint.org/docs/latest/use/command-line-interface (fetched 2026-10-25) -->
- JavaScript and TypeScript: `eslint . --max-warnings 0 --report-unused-disable-directives`.
- Python: `ruff check .`.

A suppression comment is allowed only with a reason on the same line and, where the project uses them, an issue link. A bare `eslint-disable`, `# noqa` or `@ts-ignore` is a failing gate.

### Types

<!-- TSConfig reference: strict, noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch, noImplicitOverride, exactOptionalPropertyTypes, noEmit. https://www.typescriptlang.org/tsconfig/ (fetched 2026-10-25) -->
- TypeScript: `"strict": true` plus `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch` and `noImplicitOverride`; run `tsc --noEmit` in CI.

<!-- mypy --strict: https://mypy.readthedocs.io/en/stable/command_line.html (fetched 2026-10-25) -->
- Python: `mypy --strict` (or pyright in strict mode, if the project already uses it).

`any`, `# type: ignore` and casts that hide a real mismatch are type errors you chose not to fix. Each one needs a reason in a comment.

### Tests and the coverage ratchet

Coverage is a floor that only moves up. Record today's number in the config; CI fails when a change drops below it; when coverage rises, raise the floor.

<!-- Jest coverageThreshold (global branches/functions/lines/statements; run fails if not met): https://jestjs.io/docs/configuration ; Vitest coverage.thresholds incl. autoUpdate: https://vitest.dev/config/coverage ; pytest-cov --cov-fail-under and --cov-branch: https://pytest-cov.readthedocs.io/en/latest/config.html (all fetched 2026-10-25) -->
- Jest: `coverageThreshold.global` with `lines`, `branches`, `functions`, `statements`.
- Vitest: `coverage.thresholds`; `autoUpdate: true` rewrites the thresholds upward when coverage improves, which is the ratchet done for you.
- pytest: `pytest --cov --cov-branch --cov-fail-under=<floor>`.

Coverage measures what ran, not what was checked. A high number with weak assertions is worse than a lower one with strong assertions; coverage sits on top of `godmode:test-first`, never in place of it.

### Build

The production build runs in CI from a clean checkout and installs from the lockfile (`npm ci`, `pip install -r` with pinned versions, `cargo build --locked`). Zero warnings: treat compiler warnings as errors where the toolchain allows it.

### Size budget

<!-- size-limit: package.json "size-limit" array with path and limit; throws when over limit. https://github.com/ai/size-limit (fetched 2026-10-25) -->
For front-end bundles and published packages, agree a budget with the user and enforce it, for example with `size-limit` (a `size-limit` array in `package.json` with `path` and `limit`). When the budget is exceeded, find what grew before you discuss raising it.

### Dependency audit

<!-- npm audit --audit-level (info|low|moderate|high|critical|none): https://docs.npmjs.com/cli/v11/commands/npm-audit ; pip-audit exit 1 on findings: https://pypi.org/project/pip-audit/ ; govulncheck ./...: https://go.dev/doc/tutorial/govulncheck ; cargo audit: https://github.com/rustsec/rustsec/tree/main/cargo-audit (all fetched 2026-10-25) -->

| Ecosystem | Command |
|---|---|
| npm | `npm audit --audit-level=high` |
| Python | `pip-audit` (or `pip-audit -r requirements.txt`) |
| Go | `govulncheck ./...` |
| Rust | `cargo audit` |

Development dependencies count: they run in CI, and CI holds secrets. A finding with no fixed version gets a recorded decision from the user (accept until a date, replace the package, or remove the feature), not a silent ignore. Deeper supply-chain checks are in `godmode:security-protocol`.

### Complexity

<!-- ESLint complexity rule, default max 20: https://eslint.org/docs/latest/rules/complexity ; Ruff C901 with lint.mccabe.max-complexity: https://docs.astral.sh/ruff/rules/complex-structure/ (fetched 2026-10-25) -->
Set the threshold explicitly rather than relying on a tool default: the ESLint `complexity` rule with a `max`, or Ruff rule `C901` with `lint.mccabe.max-complexity`. A function over the threshold is split or simplified. Raising the threshold to fit one function is loosening a gate.

### Dead code

<!-- knip finds unused files, exports and dependencies: https://knip.dev/ ; vulture finds unused Python code, exit code 3 when found, --min-confidence: https://pypi.org/project/vulture/ (fetched 2026-10-25) -->
- JavaScript and TypeScript: `npx knip` (unused files, exports and dependencies).
- Python: `vulture <package> --min-confidence 80`, tuned with a whitelist for code used dynamically.

Dead code misleads: it implies something depends on it. Delete it; version control remembers.

## CI Template

One job, every gate, on every pull request. Adapt the commands to the project's own scripts; keep the order (fast checks first).

<!-- Action majors from the GitHub releases API on 2026-10-25: actions/checkout v7.0.1, actions/setup-node v7.1.0; setup-node accepts node-version 'lts/*' and cache 'npm': https://github.com/actions/setup-node -->
```yaml
name: quality-gates
on:
  pull_request:
  push:
    branches: [main]

jobs:
  gates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 'lts/*'
          cache: npm
      - run: npm ci
      - name: Lint (zero warnings)
        run: npx eslint . --max-warnings 0 --report-unused-disable-directives
      - name: Types (strict)
        run: npx tsc --noEmit
      - name: Tests with coverage floor
        run: npm test -- --coverage
      - name: Build
        run: npm run build
      - name: Size budget
        run: npx size-limit
      - name: Dependency audit
        run: npm audit --audit-level=high
      - name: Dead code
        run: npx knip
```

Make the job a required status check on the main branch, so a red gate blocks the merge rather than decorating it.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It is only a warning." | Tolerated warnings become the wallpaper that hides the one that matters. |
| "The types are wrong but it works at runtime." | It works for the inputs you tried. The type error describes the input you have not met yet. |
| "Coverage only dropped one percent." | One percent per change is the whole floor within a year. The ratchet exists for exactly this. |
| "CI is slow; I tested locally." | Local machines differ from CI and from each other. That difference is why CI exists. |
| "It is a dev dependency, so the advisory does not matter." | Dev dependencies run in CI with access to secrets and publish tokens. |
| "I will add one inline disable just here." | One becomes a pattern. Fix the code, or change the rule openly with a reason. |
| "The function is complex but readable." | Readability is the author's opinion; the threshold is the team's agreement. |
| "That code might be needed later." | Version control keeps it. Delete it now. |

## Guardrails

**Never:**
- Disable a rule, lower a threshold, add a bare suppression or skip CI to make a gate pass.
- Merge with a red or skipped gate, or mark a gate as non-required to unblock a merge.
- Land a new gate that fails on arrival.
- Claim a gate passes without its output from this session.
- Write tool names, flags or versions into project config from memory; check the tool's current documentation.

**Always:**
- Run the same commands locally that CI runs.
- Fix the code when a gate fails.
- Ratchet coverage upward when it rises.
- Disclose and justify any config change to a gate, as a reviewed change.
- Confirm a new gate fails on a known violation before trusting it.

## Connections

- `godmode:test-first`: tests are the foundation; coverage sits on top of them.
- `godmode:completion-gate`: gate output is part of the evidence for "done".
- `godmode:project-bootstrap`: sets the gates up when a project starts.
- `godmode:security-protocol`: the dependency audit is one of its checks; it adds secrets scanning and supply-chain review.
- `godmode:performance-tuning`: the size budget is a performance budget.
- `godmode:grounding`: current tool flags and versions are verified there before they go into config.
