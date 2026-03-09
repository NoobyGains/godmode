---
name: quality-enforcement
description: Use when preparing code for commit, PR, or merge - covers linting, type safety, bundle budgets, coverage thresholds, complexity limits, dependency audit, and dead code detection
---

# Quality Enforcement

## Overview

Quality enforcement is automated, not aspirational. If it can be checked by a machine, it must be.

**Core principle:** A quality check that is not enforced in CI does not exist.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO CODE LANDS WITHOUT ALL QUALITY CHECKS PASSING
```

If a check fails, fix the code. Never disable the check. Never bypass CI.

## When to Use

**Always before:**
- Committing code
- Opening a pull request
- Merging to trunk
- Releasing to production

**Especially when:**
- "Just suppress the linter this once" (never)
- "CI is too slow, merge manually" (fix CI, do not skip it)
- "Type errors but it works at runtime" (fix the types)
- "Coverage dropped but the critical paths are tested" (restore coverage)

## The Entry Protocol

```
BEFORE any PR or merge:

1. LINT: Zero errors, zero warnings
2. TYPES: Zero type errors (strict mode)
3. TESTS: All passing, coverage meets threshold
4. BUILD: Clean build, no warnings
5. SIZE: Bundle/binary within budget (if applicable)
6. DEPS: No known vulnerabilities (critical/high)
7. COMPLEXITY: No functions exceeding complexity threshold

Any check fails = code is not ready. Fix before advancing.
```

## Quality Check Reference

### Check 1: Linting

```
Standard: Zero errors AND zero warnings
```

| Setting | Value | Rationale |
|---------|-------|-----------|
| Errors | 0 | Non-negotiable |
| Warnings | 0 | Warnings become errors you learn to ignore |
| Config committed | Yes | Consistent across all contributors |
| CI enforced | Yes | Local overrides are irrelevant |

**Warnings are tomorrow's errors.** Either fix them or adjust the rule. Never tolerate warnings.

**Disable a rule?** Only if the team explicitly agrees the rule is inappropriate for this project. Document the rationale in the config file. Never disable inline for convenience.

### Check 2: Type Safety

```
Standard: Zero type errors, strict mode enabled
```

**TypeScript:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Python:** mypy or pyright with strict mode.

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| `any` type | Disables type checking | Use specific types or generics |
| `// @ts-ignore` | Conceals real errors | Fix the type error |
| `# type: ignore` | Same problem | Fix the type error |
| Non-strict mode | False sense of safety | Enable strict from day one |

**`any` is a type error you chose not to resolve.** Every `any` weakens the type system for everything it touches.

### Check 3: Test Coverage

```
Standard: Coverage threshold that never decreases
```

| Metric | Floor | Target |
|--------|-------|--------|
| Line coverage | 80% | 90%+ |
| Branch coverage | 70% | 85%+ |
| New code coverage | 90% | 100% (aspire to) |

**Coverage thresholds are a ratchet.** They increase, never decrease. Configure CI to fail if coverage drops below the current level.

Coverage is necessary but not sufficient. 100% coverage with poor assertions is worse than 70% coverage with rigorous assertions. Coverage checks combine with TDD discipline (`godmode:test-first`).

### Check 4: Build

```
Standard: Clean build, zero warnings
```

- Build must complete successfully
- Zero compiler/build warnings
- Output matches expected structure
- No missing dependencies at build time

### Check 5: Bundle Size Budget (Frontend)

```
Standard: Total bundle size within defined budget
```

| Target | Budget | Tool |
|--------|--------|------|
| Initial JS (compressed) | <200KB | webpack-bundle-analyzer |
| CSS | <50KB | PurgeCSS check |
| Images | Optimized, WebP/AVIF | imagemin |
| Total page weight | <1MB | Lighthouse |

**Set the budget. Enforce in CI.** When budget is exceeded, analyze the bundle contents and eliminate or split.

### Check 6: Dependency Audit

```
Standard: Zero critical or high vulnerabilities
```

| Language | Command | CI Integration |
|----------|---------|---------------|
| JavaScript | `npm audit --audit-level=high` | Fail on high+ |
| Python | `pip-audit` or `safety check` | Fail on high+ |
| Go | `govulncheck ./...` | Fail on any |
| Rust | `cargo audit` | Fail on any |

**Also verify:**
- No unnecessary dependencies (is every dep actually used?)
- No duplicate dependencies (different versions of same package)
- Dependencies are maintained (last update within 12 months)

### Check 7: Complexity Metrics

```
Standard: No function exceeds complexity threshold
```

| Metric | Threshold | Tool |
|--------|-----------|------|
| Cyclomatic complexity | <10 per function | ESLint (complexity rule), radon, gocyclo |
| Function length | <50 lines | Linter rules |
| File length | <400 lines | Linter rules |
| Parameters | <5 per function | Linter rules |

**When complexity exceeds threshold:** Refactor. Extract functions. Simplify conditionals. Never raise the threshold.

### Check 8: Dead Code

```
Standard: No unused exports, variables, or dependencies
```

| What | Tool |
|------|------|
| Unused exports | ts-prune, knip |
| Unused dependencies | depcheck, knip |
| Unused variables | Linter (no-unused-vars) |
| Unreachable code | Linter, type checker |

Dead code is misleading code. It implies something depends on it. Remove it.

## CI Pipeline Template

```yaml
# Minimum quality enforcement pipeline
quality-checks:
  steps:
    - name: Lint
      run: npm run lint
    - name: Type Check
      run: npm run typecheck
    - name: Test
      run: npm test -- --coverage
    - name: Coverage Check
      run: check-coverage --threshold 80
    - name: Build
      run: npm run build
    - name: Bundle Size
      run: bundlesize
    - name: Audit
      run: npm audit --audit-level=high
```

All checks run on every PR. All must pass before merge.

## Cognitive Traps

| Rationalization | Truth |
|-----------------|-------|
| "Just a lint warning, not an error" | Warnings you ignore become errors you miss. |
| "Type error but it works at runtime" | Types prevent the runtime error you have not encountered yet. |
| "Coverage dropped 1%, not a big deal" | 1% per PR = 50% in a year. Ratchets do not go down. |
| "Skip CI, I tested locally" | Local environments differ from CI. That is why CI exists. |
| "Bundle grew because we added features" | Features should replace or split, not only add. |
| "Vulnerability is in a dev dependency" | Dev deps run in CI. CI has secrets. Still a risk. |
| "Function is complex but readable" | Complexity limits exist because readability is subjective. |
| "Dead code might be needed later" | Git remembers. Delete it. Restore from history if needed. |

## Guardrails - HALT and Fix

- Disabling lint rules inline without documented rationale
- `@ts-ignore` or `# type: ignore` without an accompanying issue
- Coverage threshold lowered in config
- CI skipped or overridden for merge
- `any` types spreading through codebase
- Bundle size growing without investigation
- Warnings treated as acceptable
- Audit failures dismissed because "it's a dev dependency"

**All of these mean: The check is broken. Fix the check before writing more code.**

## Integration

**Complements:**
- **godmode:test-first** — Tests are one check among many
- **godmode:completion-gate** — Quality checks are verification evidence
- **godmode:project-bootstrap** — Checks configured at project setup
- **godmode:security-protocol** — Dependency audit is a security check
- **godmode:performance-tuning** — Bundle size is a performance check

## The Bottom Line

```
Every quality check automated in CI. Every check passing before merge. No exceptions.
```

If a check can be bypassed, it will be bypassed. Make it impossible to bypass.
