---
name: project-bootstrap
description: "Use when creating a new project or repository, scaffolding a codebase from nothing, turning a prototype into something that will be kept, or inheriting a project that has no version control hygiene, formatter, linter, tests or CI."
---

# Project Bootstrap

A project's foundation is cheapest on day one and most expensive the day after the first feature lands. Before any feature code, the repository gets version control hygiene, a formatter, a linter, a test runner with one passing test, CI that runs them, and safe handling of configuration and secrets. **The foundation is part of the first commit, not a later clean-up.**

## The Prime Directive

```
NO FEATURE CODE UNTIL THE FOUNDATION RUNS GREEN IN CI
```

No exceptions. No workarounds. No shortcuts.

"Runs green" means you ran format check, lint, type check (where the language has one) and tests locally, they passed, and the same commands are in a CI workflow.

## When to Use

**Required:**
- A new project, repository, package, service or CLI.
- "Just get something running" and "it's only a prototype": prototypes are kept more often than they are thrown away.
- An inherited project with no `.gitignore`, no formatter, no tests or no CI.
- Adding a new language or package to a monorepo.

**Skip:**
- A throwaway experiment the user has explicitly said will be deleted, kept out of any shared repository.
- An existing project whose foundation already runs green; follow its conventions with `godmode:codebase-conventions` instead of re-bootstrapping it.

## The Protocol

1. **Probe the environment.** Invoke `godmode:environment-awareness` and record the OS, shell, runtimes and the package manager the user prefers. Scaffold only with tools that are installed or that the user agrees to install.

2. **Classify the project** with the table below. The class decides the blueprint in [references/templates.md](references/templates.md). Mixed projects (an API with a web front end) take one blueprint per deployable part.

3. **Check current tool versions and commands before writing config.** Invoke `godmode:grounding` for every tool you are about to configure. Config formats change between majors (ESLint moved to `eslint.config.js`, golangci-lint v2 requires `version: "2"`), so the dated notes in the templates file are a starting point that you refresh, not a source of truth. Record what you verified and the date.

4. **Initialise version control first.** `git init`, a `.gitignore` for the language plus the universal entries below, and a `.gitattributes` that fixes line endings. The `.gitignore` must exclude `.env` before any `.env` file exists.

5. **Use the ecosystem's own initialiser** (`npm create`, `uv init`, `cargo new`, `go mod init`) instead of hand-writing manifests, then commit the lockfile it produces.

6. **Wire the foundation:** formatter, linter, type checker, test runner. Write one real test that passes, and run each tool once so its output proves it works. Save each check as a named script or task (`npm run lint`, `make test`, `uv run pytest`) so humans, agents and CI call the same command.

7. **Add CI** that runs exactly those scripts on push and pull request, with read-only default token permissions. Use the minimum workflow in the templates file and pin third-party actions as described there.

8. **Add configuration handling.** A committed `.env.example` lists every variable with a placeholder and a comment; real values live only in an ignored `.env` or a secret manager. Invoke `godmode:security-protocol` for anything that holds credentials.

9. **Write the README** with three things: what the project is, how to install it, and the exact commands to run, test and build it.

10. **Prove it.** Run the full check locally from a clean clone (or after deleting dependency and build directories), then push and confirm the CI run is green. Paste or link the evidence before you report the foundation as done, per `godmode:completion-gate`.

## Project Classes

| Class | Signals | Blueprint |
|---|---|---|
| Web application | Pages, routes, a browser UI | Web app |
| API or backend service | Endpoints, a database, background jobs | API (Node) or Python service or Go service |
| CLI tool | Run from a terminal, flags and subcommands | CLI |
| Library or package | Imported by other code, published to a registry | Library |
| Systems program | Native binary, performance-sensitive | Rust or Go |
| Anything else | Scripts, data pipelines, automation | General: the universal foundation alone |

## The Universal Foundation

Every class gets all of these:

| Piece | Minimum | Evidence it works |
|---|---|---|
| Version control | `git init`, `.gitignore`, `.gitattributes` | `git status` shows no ignored junk |
| Formatter | One formatter, run on save and in CI as a check | Check command exits 0 |
| Linter | The ecosystem's standard linter, warnings fail CI | Lint command exits 0 |
| Types | Strict mode where the language has a type checker | Type check exits 0 |
| Tests | Runner configured, one real passing test | Test command shows 1 passed |
| CI | Runs format check, lint, types, tests, build | Green run on the first push |
| Configuration | `.env.example` committed, `.env` ignored | `git check-ignore .env` prints `.env` |
| README | Purpose, install, run, test, build | A new reader can run it from the README alone |

**Universal `.gitignore` entries:** dependency directories (`node_modules/`, `.venv/`, `target/`), build output (`dist/`, `build/`, `out/`), environment files (`.env`, `.env.*`, with `!.env.example`), logs (`*.log`), OS files (`.DS_Store`, `Thumbs.db`), and editor directories unless the team shares settings on purpose.

**Line endings:** `* text=auto` in `.gitattributes`, plus `*.sh text eol=lf` for shell scripts so they run on Linux and in Git Bash.

## Directory Principles

- **Organise by feature, not by file type.** `orders/` holding its routes, service, model and tests beats top-level `controllers/`, `services/`, `models/`. Architecture choices belong to `godmode:system-design`.
- **Keep core logic apart from the delivery layer.** A CLI's argument parsing, an API's HTTP handlers and a UI's components call into plain modules that tests can exercise without the framework.
- **Co-locate unit tests** (`payment.ts` beside `payment.test.ts`) unless the ecosystem convention says otherwise (Rust integration tests in `tests/`, Python projects often in `tests/`). End-to-end tests get their own directory.
- **One obvious entry point** per deployable, named in the README.
- **Scripts in `scripts/`**, each runnable on every platform the team uses, or documented as POSIX-only.
- **Follow the framework's layout** when a framework imposes one; do not fight a generator's structure.

## Dependency Governance

Before adding any dependency, answer these and keep the answers in the commit message or PR description:

1. **Need:** could you write it in under 50 clear lines? If so, write it.
2. **Health:** recent releases, responsive maintainers, more than one maintainer for anything critical.
3. **Weight:** how many transitive dependencies it brings in, and its install and bundle size.
4. **Risk:** known vulnerabilities (run the ecosystem's audit), licence compatible with the project, install scripts that run code on install.
5. **Fit:** does an existing dependency already cover it?

**Always:** commit the lockfile; install in CI with the frozen-lockfile mode (`npm ci`, `pnpm install --frozen-lockfile`, `uv sync --locked`); run the dependency audit in CI; add automated update pull requests so upgrades arrive in small steps. Treat a new dependency as a supply-chain decision (`godmode:security-protocol`).

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It's just a prototype." | Prototypes get kept. Ten minutes of setup now is the cheapest it will ever be. |
| "I'll add linting later." | Later means hundreds of violations to triage at once, and nobody does it. |
| "Tests slow down the first day." | One passing test proves the runner works. Without it the first real test also debugs the setup. |
| "CI is overkill for this." | CI is the only check that runs when you forget. It is one small file. |
| "I know the config format." | Config formats change between majors. Verify the current one before writing it. |
| "The .gitignore can wait." | One commit of a `.env` puts the secret in history for good, even after deletion. |
| "I'll hand-write the manifest, it's faster." | The ecosystem initialiser gets fields, lockfile and defaults right; hand-written manifests drift. |

## Guardrails

**Never:**
- Write feature code before the foundation runs green locally and in CI.
- Commit a `.env`, credentials, build output or dependency directories.
- Copy a tool version or config format from memory or from an old template without checking it today.
- Mix two package managers or two lockfiles in one project.
- Add a dependency without the governance answers.

**Always:**
- Probe the environment and classify the project first.
- Use the ecosystem's initialiser and commit the lockfile.
- Give every check a named script, and make CI call those scripts.
- Write one real passing test on day one.
- Show the green CI run before calling the bootstrap done.

## Connections

- `godmode:environment-awareness`: runs first; the scaffold uses the tools and package manager it found.
- `godmode:grounding`: verifies every tool version, config format and CI action before it is written.
- `godmode:system-design`: decides architecture, hosting and technology choices when they are open questions.
- `godmode:quality-gates`: adds coverage ratchets, size budgets and the stricter gates once the foundation exists.
- `godmode:security-protocol`: secrets handling, dependency audit and supply-chain rules.
- `godmode:test-first`: every feature after the bootstrap starts with a failing test.
- `godmode:completion-gate`: the green CI run is the evidence the bootstrap is finished.
