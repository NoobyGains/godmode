# Project Bootstrap Blueprints

Per-classification setup checklists. Consult the appropriate blueprint when initializing a new project.

## Web Application (React/Next.js/Vue/Svelte)

```
project/
  src/
    app/              # Pages and route handlers
    components/       # Shared UI components
    hooks/            # Custom hooks or composables
    lib/              # Utilities, API clients, helpers
    styles/           # Global styles and design tokens
  public/             # Static assets
  tests/              # E2E tests (unit tests co-located with source)
  .env.example        # Required environment variables documented (no values)
  .gitignore
  README.md
  tsconfig.json       # strict: true
  eslint.config.js
  prettier.config.js
  vitest.config.ts
```

**Setup checklist:**
- [ ] TypeScript strict mode active
- [ ] ESLint + Prettier configured without conflicts
- [ ] Vitest or Jest initialized with one passing assertion
- [ ] Design tokens established (colors, spacing, typography)
- [ ] .env.example enumerates all required variables
- [ ] .gitignore covers node_modules, .env, dist, .DS_Store
- [ ] CI pipeline: lint, type-check, test, build
- [ ] README: purpose, install steps, dev/build/test commands

## API / Backend (Node.js/Express/Fastify)

```
project/
  src/
    modules/          # Feature modules (accounts/, orders/)
      accounts/
        account.controller.ts
        account.service.ts
        account.model.ts
        account.routes.ts
        account.test.ts
    middleware/        # Auth, validation, error handling
    lib/              # Database client, logger, shared utilities
    app.ts            # Application setup
    server.ts         # Server entry point
  migrations/         # Database migrations
  scripts/            # Seed, deploy, and utility scripts
  .env.example
  .gitignore
  README.md
  tsconfig.json
  eslint.config.js
  vitest.config.ts
  Dockerfile          # If containerized deployment
```

**Setup checklist:**
- [ ] TypeScript strict mode active
- [ ] ESLint configured
- [ ] Vitest/Jest with one passing assertion
- [ ] Database migration tool wired up (Prisma, Drizzle, Knex)
- [ ] Error handling middleware in place (no stack traces in production)
- [ ] Request validation layer (zod, joi, or equivalent)
- [ ] Structured logging configured (no secrets in log output)
- [ ] .env.example with DATABASE_URL, PORT, NODE_ENV documented
- [ ] Health check endpoint (/health)
- [ ] CI pipeline: lint, type-check, test, build
- [ ] Dockerfile if container deployment is planned

## Python Application (FastAPI/Django/Flask)

```
project/
  src/
    app/
      modules/        # Feature modules
      middleware/
      models/
      main.py         # Application entry point
  tests/
    conftest.py       # Shared test fixtures
  migrations/         # Alembic or Django migrations
  scripts/
  .env.example
  .gitignore
  pyproject.toml      # Project metadata and dependencies
  README.md
```

**Setup checklist:**
- [ ] pyproject.toml populated with project metadata
- [ ] Virtual environment mechanism selected (venv, poetry, or uv)
- [ ] Ruff installed for linting and formatting
- [ ] mypy or pyright configured for type checking
- [ ] pytest initialized with one passing assertion
- [ ] Type annotations on all function signatures
- [ ] .gitignore covers __pycache__, .env, venv, *.pyc
- [ ] CI pipeline: lint, type-check, test

## CLI Tool (Any Language)

```
project/
  src/
    cli.ts            # Entry point and argument parsing
    commands/         # Subcommand handlers
    lib/              # Core logic (decoupled from CLI layer)
  tests/
  .gitignore
  README.md
  tsconfig.json       # Or pyproject.toml, Cargo.toml
```

**Setup checklist:**
- [ ] Argument parsing library selected (commander, click, clap)
- [ ] --help text provided for all commands
- [ ] Core logic separated from CLI layer (enables unit testing without CLI)
- [ ] Exit codes: 0 for success, 1 for error
- [ ] Errors written to stderr, output written to stdout
- [ ] CI pipeline: lint, type-check, test

## Library / Package

```
project/
  src/
    index.ts          # Public API surface
    lib/              # Internal implementation
  tests/
  .gitignore
  README.md
  tsconfig.json
  package.json        # Or pyproject.toml, Cargo.toml
  LICENSE
  CHANGELOG.md
```

**Setup checklist:**
- [ ] Public API explicitly defined (named exports)
- [ ] README with: installation, quick start, API reference
- [ ] LICENSE file present
- [ ] CHANGELOG.md initialized
- [ ] Both CJS and ESM builds provided (if JavaScript)
- [ ] Type declarations bundled
- [ ] Peer dependencies vs runtime dependencies correctly categorized
- [ ] CI pipeline: lint, type-check, test, build
- [ ] Publish workflow configured (npm publish, PyPI, crates.io)

## Go Service

```
project/
  cmd/
    server/
      main.go         # Application entry point
  internal/           # Private packages
    handler/
    service/
    repository/
  pkg/                # Public packages (if any)
  migrations/
  .gitignore
  go.mod
  go.sum
  Makefile
  README.md
  Dockerfile
```

**Setup checklist:**
- [ ] go.mod initialized
- [ ] golangci-lint configured (.golangci.yml)
- [ ] One passing test present
- [ ] Makefile with build, test, lint targets
- [ ] Internal packages for private code
- [ ] Structured logging (slog or zerolog)
- [ ] CI pipeline: lint, test, build

## Rust Application

```
project/
  src/
    main.rs           # Application entry point
    lib.rs            # Library code (testable)
    modules/
  tests/              # Integration tests
  .gitignore
  Cargo.toml
  README.md
```

**Setup checklist:**
- [ ] Cargo.toml populated with metadata
- [ ] clippy configured (deny warnings)
- [ ] rustfmt configured
- [ ] One passing test present
- [ ] CI pipeline: clippy, fmt --check, test, build
