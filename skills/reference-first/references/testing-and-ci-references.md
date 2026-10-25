# Testing and CI/CD references

Checked 2026-10-25. Package versions are from the npm registry on that date and are given only so you can tell when the page you open is newer; check the current version with `npm view <package> version` (or the ecosystem's equivalent) before installing.

Contents: 1. Testing tools by job · 2. Strategy by project type · 3. Test strategy checklist · 4. CI/CD references · 5. CI checklist

## 1. Testing tools by job

| Job | Reference | Why it is the reference | URL |
|---|---|---|---|
| UI tests that resemble real use | Testing Library | "The more your tests resemble the way your software is used, the more confidence they can give you." Query the DOM, not component instances | https://testing-library.com/docs/guiding-principles |
| Unit and integration (JS/TS) | Vitest (5.x) | Fast runner sharing the Vite config | https://vitest.dev |
| End-to-end in real browsers | Playwright (`@playwright/test` 1.6x) | Cross-browser automation and test runner; built-in accessibility testing guide | https://playwright.dev |
| Network mocking (JS) | Mock Service Worker (`msw` 3.x) | Describe the network once with Fetch API semantics; the same handlers work in browser and Node | https://mswjs.io |
| Real dependencies in tests | Testcontainers | Throwaway databases, brokers and browsers in Docker, for many languages | https://testcontainers.com |
| Contract tests between services | Pact | Consumer-driven contracts for HTTP and message integrations, instead of deploying everything to test | https://docs.pact.io |
| Property-based (JS/TS) | fast-check (4.x) | Generated inputs and shrinking for invariants | https://fast-check.dev |
| Property-based (Python) | Hypothesis | The same idea for Python | https://hypothesis.readthedocs.io |
| Automated accessibility checks | axe-core, with `@axe-core/playwright` | Rule engine for WCAG checks inside browser tests | https://github.com/dequelabs/axe-core |

Use the project's existing runner if it has one (`godmode:codebase-conventions`); this table is for projects choosing for the first time.

## 2. Strategy by project type

| Project | Weight most tests here | Add | Avoid |
|---|---|---|---|
| Web front end | Component and integration tests through the DOM (Testing Library) | A few Playwright journeys for the critical paths; axe checks | Snapshot tests of large trees; testing framework internals |
| HTTP API or backend | Integration tests against a real database (Testcontainers) | Contract tests (Pact) where other teams consume the API | Mocking the ORM so heavily that SQL is never run |
| Library or package | Unit and property-based tests on the public API | A CI matrix across supported runtime versions | Tests that reach into private internals |
| CLI | Integration tests that run the binary and assert on output and exit code | Snapshot tests of help text | Tests that depend on the developer's shell |
| Data pipeline | Unit tests on transforms with fixture data | Data-quality assertions at stage boundaries | Only testing on the full production dataset |

There is no universal ratio of unit to integration to end-to-end tests. Choose the mix that gives confidence for this project's risks, and say why in the plan.

## 3. Test strategy checklist

1. Name the risks: what failure would hurt the user most? Test those first.
2. For each behaviour: the happy path, the edges from the spec (empty, maximum, duplicate, concurrent), the error paths (invalid input, timeout, dependency down), and the security paths (unauthorised, cross-tenant access).
3. Do not test third-party libraries or the framework itself; test your use of them.
4. Test behaviour through public interfaces, so refactors do not break tests.
5. Build test data with factories or fixtures, not magic values scattered through tests.
6. A test that never failed proves nothing: watch it fail first (`godmode:test-first`).
7. Flaky tests are bugs. Wait on conditions, never on fixed sleeps.

## 4. CI/CD references

| Source | Study it for | URL |
|---|---|---|
| `actions/starter-workflows` | Official GitHub Actions templates per language and deploy target | https://github.com/actions/starter-workflows |
| GitHub Actions secure use reference | Hardening rules (below) | https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions |
| `actions/setup-node` (v7 at check time) | Node setup with built-in npm, yarn and pnpm dependency caching | https://github.com/actions/setup-node |
| OpenSSF Scorecard action | Automated checks of the repository's own security practices | https://scorecard.dev |
| Keep a Changelog | Release notes format | https://keepachangelog.com |

### GitHub Actions hardening (from the secure use reference)

- Set the default `GITHUB_TOKEN` permission to read-only for contents and raise it per job only where needed.
- Pin third-party actions to a full commit SHA; a lockfile, where available, is stronger still.
- Use OpenID Connect to reach cloud providers instead of storing long-lived credentials as secrets.
- Never interpolate untrusted input (pull request titles, branch names) straight into an inline script; pass it through an intermediate environment variable.
- Avoid the `pull_request_target` trigger unless it is necessary; privileged workflows on untrusted code can be used to take over a repository.
- Mask any sensitive value that is not already a secret.

## 5. CI checklist

1. Start from the official starter workflow for the stack, not from a blank file.
2. Order the stages so the cheapest checks fail first: install, lint, type check, unit tests, build, integration and end-to-end tests, then deploy.
3. Cache dependencies keyed on the lockfile hash (setup actions usually provide this).
4. Run the same commands locally and in CI; put them in package scripts or a Makefile so there is one definition.
5. Required checks on the default branch: tests, lint, types, build, dependency audit.
6. Use a matrix only for what you support (runtime versions, operating systems).
7. Deploys: preview environments for pull requests where the host supports them, automatic staging from the default branch, production on a tag or manual approval.
8. Secrets live in the platform's secret store, scoped to the environment that needs them, and never printed.
9. Apply the hardening list above before the first deploy job exists.

Machine-enforced gates (coverage ratchet, bundle size, complexity) are covered by `godmode:quality-gates`.
