# GitHub and package-registry search

Checked 2026-10-25. Every qualifier and flag below was read from the linked page or from `gh search repos --help` (gh 2.97.0). Re-check before relying on an exotic one.

Contents: 1. Where to search · 2. Query method · 3. Evaluating a repository · 4. Pattern harvesting · 5. Attribution · 6. Licence compatibility · 7. Reporting to the user

## 1. Where to search

| Channel | Use it for | Address |
|---|---|---|
| GitHub repository search | Whole projects, starters, examples | https://github.com/search?type=repositories |
| GitHub code search | How others call an API or shape a file | https://github.com/search?type=code |
| GitHub topics | Curated clusters of projects | `https://github.com/topics/<topic>` |
| `awesome-<topic>` lists | Community-vetted shortlists | search `awesome <topic>` |
| npm | JavaScript and TypeScript packages | https://www.npmjs.com |
| PyPI | Python packages | https://pypi.org |
| crates.io | Rust crates | https://crates.io |
| pkg.go.dev | Go modules | https://pkg.go.dev |
| RubyGems | Ruby gems | https://rubygems.org |
| deps.dev (Open Source Insights) | Dependency graph, licences, advisories across npm, Go, Maven, PyPI, NuGet, Cargo, RubyGems | https://deps.dev |
| OpenSSF Scorecard | Automated security-practice score for a repository | https://scorecard.dev |
| Web search | Blog write-ups, official guides, comparisons | any search engine; prefer official domains |

## 2. Query method

Never settle for one query. Before saying "nothing exists", run **at least three formulations across at least two channels**.

| Style | Example | Finds |
|---|---|---|
| Literal name | `kanban board react` | Direct matches |
| Problem statement | `drag and drop reorder list persistence` | Solutions to the same problem under other names |
| Stack plus pattern | `fastapi oauth2 refresh token` | Stack-specific implementations |
| Synonyms | `kanban` / `task board` / `project tracker` | The same idea in other words |
| Curated | `awesome-fastapi` | Vetted lists |

### Repository search qualifiers

Source: https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories

| Qualifier | Example |
|---|---|
| `in:name`, `in:name,description`, `in:readme`, `in:topics` | `scheduler in:name,description` |
| `stars:` | `stars:>=500` |
| `forks:` | `forks:>=50` |
| `pushed:` | `pushed:>=2025-10-01` (recently active) |
| `created:` | `created:>=2024-01-01` |
| `language:` | `language:typescript` |
| `license:` | `license:mit`, `license:apache-2.0` |
| `topic:` | `topic:booking` |
| `archived:` | `archived:false` |

A good default filter: `stars:>=100 pushed:>=<one year ago> archived:false`.

### Code search

Source: https://docs.github.com/en/search-github/github-code-search/understanding-github-code-search-syntax

Bare terms match file content or path. Narrow with `repo:`, `language:` and `path:`; quote exact strings; use `/regex/` for patterns; combine with `AND`, `OR`, `NOT`. Example: `language:go path:middleware "rate limit"`.

### From the terminal

The GitHub CLI wraps repository and code search (flags from `gh search repos --help`, gh 2.97.0):

```bash
gh search repos "booking calendar" --language=typescript --stars=">=200" \
  --updated=">=2025-10-01" --sort=stars --limit=20 \
  --json fullName,stargazersCount,license,pushedAt,isArchived,description

gh search code "createCheckoutSession" --language=typescript --limit=20
```

## 3. Evaluating a repository

| Signal | Positive | Negative |
|---|---|---|
| Activity | Commits or releases within the last year | Archived; nothing for years with open bug reports |
| Adoption | Stars, dependants, downloads proportionate to the niche | Near-zero use for a mainstream problem |
| Maintainer response | Issues answered, PRs merged | Hundreds of unanswered issues |
| Licence | A `LICENSE` file with an OSI licence that fits the project | No licence, or a licence you cannot honour |
| Tests | A test directory and CI that runs it | No tests |
| Dependencies | Few, well-known | Large tree of obscure packages |
| Security | Reasonable Scorecard result, no unpatched advisories on deps.dev | Known vulnerabilities left open |
| Fit | Covers most of the need | Tangential |

Stars are a popularity signal, not a quality signal; a 200-star library with tests and an active maintainer beats a 20,000-star abandoned one.

Minimum viable candidate: has a licence, has tests, has been touched in the last year, and its README explains usage.

### Decide what to do with it

| Verdict | When | Action |
|---|---|---|
| Depend on it | Strong fit, healthy, compatible licence, acceptable size | Add as a dependency through the project's package manager |
| Harvest patterns | Too heavy or wrong shape, but solves the hard part well | Re-implement the pattern in the project's conventions |
| Study only | Different paradigm, but the architecture teaches something | Read, note the idea, build your own |
| Reject | Fails a hard gate | Record why |

## 4. Pattern harvesting

1. Identify the extractable value: data model, public interface, algorithm, error handling, test strategy, project layout.
2. Read the code that implements it, plus its tests; tests reveal the edge cases the authors cared about.
3. Rewrite in the target project's conventions (`godmode:codebase-conventions`): its naming, error style, logging and test framework. Do not paste whole files.
4. Port the edge-case tests along with the behaviour.

## 5. Attribution

When a non-obvious pattern or any code comes from a reference, leave a short note where a future reader will see it:

```
// Retry schedule adapted from github.com/<owner>/<repo> (<licence>), <file or URL>.
```

Copied code keeps its original copyright and licence notice. Record the references in the design document as well.

## 6. Licence compatibility

Rules of thumb for bringing code **into** a project. They are not legal advice; when the stakes are real, ask the user to check.

| Incoming licence | Into MIT / BSD / Apache-2.0 / proprietary | Into GPL-3.0 | Notes |
|---|---|---|---|
| MIT, BSD-2/3-Clause, ISC | Yes, keep the notice | Yes | Permissive |
| Apache-2.0 | Yes, keep `LICENSE` and `NOTICE` | Yes for GPLv3; **not** GPLv2 | FSF treats Apache-2.0 as compatible with GPLv3 only <!-- https://www.apache.org/licenses/GPL-compatibility.html --> |
| MPL-2.0 | Yes at file level; changes to MPL files stay MPL | Yes | Weak, file-level copyleft <!-- https://choosealicense.com/licenses/mpl-2.0/ --> |
| LGPL | Usually as a separately linked library | Yes | Do not copy LGPL source into non-LGPL files <!-- https://choosealicense.com/licenses/lgpl-3.0/ --> |
| GPL-2.0 / GPL-3.0 | No (the whole work would have to become GPL) | GPL-3.0 yes; GPL-2.0-only no | Strong copyleft |
| AGPL-3.0 | No | Only if you accept the network-use clause | Running modified code as a network service triggers source sharing <!-- https://choosealicense.com/licenses/agpl-3.0/ --> |
| No licence | No | No | Default copyright: all rights reserved <!-- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository --> |
| CC0 / Unlicense | Yes | Yes | Public-domain dedication |

Licence summaries: https://choosealicense.com · identifiers: https://spdx.org/licenses/

Studying an AGPL project's schema or architecture and re-implementing the idea is different from copying its code. Copy nothing from a licence you cannot honour.

## 7. Reporting to the user

```
I searched <channels> with <queries>. Strongest candidates:

A) <owner/repo> - <stars>, <licence>, last push <date>
   <url>
   Covers: <what part of the need>; Verdict: depend / harvest / study
B) ...
C) ...

Recommendation: <A as a dependency> / <harvest X from A and Y from B>,
because <reason>. Not used: <repo> (<reason>).
```

Dependency and reference choices that change the project's shape are the user's call: present the options and wait.
