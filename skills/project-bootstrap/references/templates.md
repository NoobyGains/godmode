# Project Bootstrap Blueprints

Per-class layouts, setup checklists and a minimum CI workflow. **Versions and config formats below were checked on 2026-10-25.** They drift: before you write any of them into a project, re-check the tool's current release and documentation (`godmode:grounding`) and update this file if it is stale.

Contents: 1. Tool versions checked. 2. Universal files. 3. Web application. 4. API (Node). 5. Python service. 6. CLI. 7. Library. 8. Go service. 9. Rust. 10. Minimum CI workflow. 11. Sources.

## 1. Tool versions checked (2026-10-25)

Latest releases from each project's GitHub releases page on that date. Use the ecosystem initialiser to install the current version rather than pinning these numbers by hand.

| Tool | Latest release | Config file it reads | Check command |
|---|---|---|---|
| ESLint | 10.13.0 | `eslint.config.js` (or `.mjs`, `.cjs`, `.ts`); flat config | `npx eslint .` |
| Prettier | 3.9.10 | `.prettierrc`, `prettier.config.js` and variants | `npx prettier --check .` |
| Biome (alternative to ESLint + Prettier) | 2.6.3 | `biome.json` | `npx @biomejs/biome check .` |
| TypeScript | 7.0.2 | `tsconfig.json` | `npx tsc --noEmit` |
| Vitest | 5.0.5 | `vitest.config.ts` (else `vite.config.ts`) | `npx vitest run` |
| pnpm | 12.15.0 | `pnpm-workspace.yaml` for workspaces | `pnpm install --frozen-lockfile` |
| Bun | 1.4.4 | `bunfig.toml`; lockfile `bun.lock` | `bun install --frozen-lockfile` |
| uv | 0.13.5 | `pyproject.toml`; lockfile `uv.lock` | `uv sync --locked` |
| Ruff | 0.17.2 | `pyproject.toml` `[tool.ruff]`, `ruff.toml` | `ruff check .` and `ruff format --check .` |
| pytest | see PyPI | `pytest.toml`, or `[tool.pytest]` in `pyproject.toml` (pytest 9+), or `[tool.pytest.ini_options]` | `pytest` |
| golangci-lint | 2.15.0 | `.golangci.yml` with `version: "2"` | `golangci-lint run` and `golangci-lint fmt` |
| Rust clippy / rustfmt | with the toolchain | `clippy.toml`, `rustfmt.toml` | `cargo clippy` with warnings denied, `cargo fmt --check` |

Notes:
- **TypeScript:** set `"strict": true` explicitly in `tsconfig.json`. Reports say TypeScript 7 changed several defaults; an explicit setting is correct on every version.
- **Rust warnings:** the Clippy docs recommend the `build.warnings = "deny"` Cargo setting (Cargo 1.97 and later) over `cargo clippy -- -Dwarnings`, which invalidates build caches.
- **ESLint:** initialise with `npm init @eslint/config@latest` (or `pnpm create @eslint/config@latest`, `yarn create @eslint/config`, `bun create @eslint/config@latest`).

## 2. Universal files

```
.gitignore        language entries + .env, .env.*, !.env.example, logs, OS and build output
.gitattributes    * text=auto  and  *.sh text eol=lf
.env.example      every variable, placeholder value, one-line comment each
README.md         purpose, install, run, test, build
LICENSE           for anything published or shared
```

## 3. Web application

```
src/
  app/            routes or pages (follow the framework's convention)
  components/     shared UI components
  lib/            API clients, utilities
  styles/         global styles and design tokens
public/           static assets
e2e/              end-to-end tests; unit tests sit beside the code
```

- [ ] Framework created with its own initialiser (`npm create <framework>@latest` or the documented equivalent)
- [ ] TypeScript with `"strict": true`
- [ ] Formatter and linter wired without overlapping rules (Biome alone, or ESLint + Prettier)
- [ ] Vitest (or the framework's runner) with one passing component or unit test
- [ ] Design tokens defined before components (`godmode:ui-engineering`)
- [ ] `.env.example`; public variables named with the framework's public prefix only when they are safe to ship to browsers
- [ ] CI: format check, lint, type check, test, build

## 4. API (Node)

```
src/
  modules/
    orders/       orders.routes.ts, orders.service.ts, orders.repo.ts, orders.test.ts
  middleware/     auth, validation, error handling
  lib/            db client, logger, config loader
  app.ts          builds the app (importable by tests)
  server.ts       starts listening
migrations/
```

- [ ] Request validation at the edge with a schema library
- [ ] One error-handling middleware; no stack traces in production responses
- [ ] Structured logging that never logs secrets or tokens
- [ ] Config loaded and validated once at start-up; the process exits on missing variables
- [ ] Migration tool chosen and one migration committed
- [ ] Health endpoint for the platform's checks
- [ ] Integration test that starts the app in-process and calls one endpoint

## 5. Python service

```
src/<package>/    importable package (src layout)
tests/            pytest tests, conftest.py for fixtures
pyproject.toml    metadata, dependencies, tool config
uv.lock
```

- [ ] `uv init` (or the team's manager), then `uv add <dep>` and `uv add --dev pytest ruff`
- [ ] Ruff for lint and format; mypy or pyright for types, configured in `pyproject.toml`
- [ ] pytest with one passing test, run through `uv run pytest`
- [ ] `.venv/` ignored; `requires-python` set
- [ ] CI: `uv sync --locked`, `ruff format --check .`, `ruff check .`, type check, `uv run pytest`

## 6. CLI

```
src/
  cli.(ts|py|rs|go)   argument parsing only
  commands/           one handler per subcommand
  core/               logic with no CLI dependency
tests/
```

- [ ] Argument parser from the ecosystem's standard library or best-known package
- [ ] `--help` for every command, `--version` at the top level
- [ ] Results to stdout, diagnostics to stderr; exit 0 on success, non-zero on failure
- [ ] Core logic unit-tested without spawning the CLI; one end-to-end test that runs the binary
- [ ] Tested on Windows as well as POSIX if users will run it there (paths, quoting, line endings)

## 7. Library

```
src/index.*       the public API, explicit named exports
src/internal/     implementation details
tests/
CHANGELOG.md
LICENSE
```

- [ ] Public surface listed explicitly; everything else private
- [ ] Type declarations shipped; package `exports` (or the language's equivalent) defined
- [ ] Runtime dependencies kept minimal; peer dependencies for frameworks
- [ ] README with install, a ten-line quick start and the API
- [ ] Release workflow that publishes from CI with provenance where the registry supports it

## 8. Go service

```
cmd/<name>/main.go   entry point
internal/            private packages (handler, service, store)
go.mod, go.sum
.golangci.yml        version: "2"
```

- [ ] `go mod init <module path>`
- [ ] golangci-lint v2 config; `golangci-lint run` and `golangci-lint fmt` in CI
- [ ] One table-driven test; `go test ./...` passes
- [ ] Structured logging with `log/slog`
- [ ] `govulncheck ./...` in CI

## 9. Rust

```
src/main.rs or src/lib.rs   keep logic in lib.rs so it is testable
tests/                      integration tests
Cargo.toml, Cargo.lock      commit Cargo.lock for binaries
```

- [ ] `cargo new <name>` (add `--lib` for a library)
- [ ] `cargo fmt --check` and clippy with warnings denied in CI
- [ ] One unit test and one integration test pass with `cargo test`
- [ ] `cargo audit` in CI

## 10. Minimum CI workflow

GitHub Actions, Node with pnpm. Swap the setup and run lines for other ecosystems. GitHub recommends pinning third-party actions to a full commit SHA and granting the workflow token the minimum permissions; the major tags below were checked to exist on 2026-10-25, and you should replace them with SHAs for anything beyond a personal project.

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: pnpm/action-setup@v6   # reads the pnpm version from package.json "packageManager"; else pass with: version
      - uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm run format:check
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm test
      - run: pnpm run build
```

Other ecosystems, same shape:

| Ecosystem | Setup | Install | Checks |
|---|---|---|---|
| Python (uv) | `astral-sh/setup-uv` (no major tag; pin the release SHA its README shows) | `uv sync --locked` | `uv run ruff format --check .`, `uv run ruff check .`, `uv run pytest` |
| Go | `actions/setup-go@v7` | `go mod download` | `golangci-lint run` (or `golangci/golangci-lint-action@v9`), `go test ./...` |
| Rust | the toolchain preinstalled on GitHub runners, or a toolchain action | none | `cargo fmt --check`, `cargo clippy`, `cargo test` |

Run the same matrix on `windows-latest` and `macos-latest` when users run the project there.

## 11. Sources

Fetched 2026-10-25.

- Release versions: GitHub releases API for eslint/eslint, prettier/prettier, biomejs/biome, microsoft/TypeScript, vitest-dev/vitest, pnpm/pnpm, oven-sh/bun, astral-sh/uv, astral-sh/ruff, golangci/golangci-lint, actions/checkout, actions/setup-node, actions/setup-python, actions/setup-go, pnpm/action-setup, astral-sh/setup-uv, golangci/golangci-lint-action.
- ESLint config files and init command: https://eslint.org/docs/latest/use/configure/configuration-files and https://eslint.org/docs/latest/use/getting-started
- Prettier config files: https://prettier.io/docs/configuration
- Vitest config lookup: https://vitest.dev/config/
- pytest config files: https://docs.pytest.org/en/stable/reference/customize.html
- Ruff configuration: https://docs.astral.sh/ruff/configuration/
- uv projects: https://docs.astral.sh/uv/guides/projects/
- Bun lockfile and frozen installs: https://bun.sh/docs/install/lockfile and https://bun.sh/docs/cli/install
- Biome CLI: https://biomejs.dev/reference/cli/
- pnpm/action-setup inputs: https://github.com/pnpm/action-setup
- golangci-lint v2 config and commands: https://golangci-lint.run/docs/configuration/file/ and https://golangci-lint.run/docs/welcome/quick-start/
- Clippy in CI: https://doc.rust-lang.org/clippy/usage.html
- rustfmt `--check`: https://github.com/rust-lang/rustfmt
- govulncheck: https://go.dev/doc/tutorial/govulncheck
- GitHub Actions secure use (SHA pinning, token permissions): https://docs.github.com/en/actions/reference/security/secure-use
- TypeScript 7 default changes (secondary reports, not official notes): https://github.com/microsoft/TypeScript/issues/62333
