---
name: grounding
description: "Use when about to write code, config or commands against a library, API, CLI, SDK, model or platform, or to state a version, flag, limit, price, licence, release date or best practice to the user, or when an error suggests an interface has changed"
---

# Grounding

What you remember about an API, a CLI flag, a version or a price was true at some point before your training ended, and may not be true now. **Treat every fact that can change as a hypothesis: verify it against a current primary source, record where and when you checked, and let the source win when it disagrees with memory.**

## The Prime Directive

```
NO FACT THAT CAN CHANGE GOES IN CODE OR AN ANSWER UNVERIFIED
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Before code or config calls an external library, SDK, API or CLI you have not verified this session.
- Before a plan or design names a version, flag, environment variable, endpoint, limit or price.
- Before telling the user what a tool "supports", "requires" or "recommends".
- When an error says a function, option or field does not exist, or behaves unexpectedly.
- When the user asks for the latest, current, best or recommended anything.

**Skip:**
- Facts about this repository that you can read directly (its own code, files, git history).
- Language fundamentals that do not drift (what a for-loop does, how HTTP status classes work).
- A fact you already verified in this session, from a source you recorded.

## Facts That Can Change

| Class | Examples | Typical drift |
|---|---|---|
| Interfaces | function signatures, config keys, CLI flags, REST fields, hook payloads | every minor release |
| Versions and support | latest version, minimum runtime, deprecations, end-of-life dates | months |
| Names | model IDs, package names, tool names, plan names | weeks to months |
| Limits | rate limits, context windows, file size caps, quotas | without notice |
| Prices and plans | per-token prices, tiers, free allowances | without notice |
| Platform rules | store policies, marketplace requirements, licence terms | quarterly |
| Best practice | recommended patterns, security guidance | years, but contested |
| Availability | "X supports Y", region availability, feature flags | per release |

If a fact sits in one of these classes, it needs a source.

## What Counts as a Primary Source

In order of trust:

1. **The thing itself**: running `tool --help`, `tool --version`, reading the installed package's types or source, calling the API and reading the response.
2. **The owner's current documentation**: the official docs site, API reference, or changelog for the version in use.
3. **The owner's repository**: README, release notes, source at the tagged version, maintainer comments in issues.
4. **A documentation service** that serves the owner's docs for a named version (for example Context7).
5. **Secondary sources**: blog posts, tutorials, Q&A answers, other agents' summaries. Use them to find a primary source, not as the source.

A search-engine snippet is not a source; open the page. Your own memory is not a source at any rank.

## The Protocol

1. **Spot the claim.** While drafting code, a plan or an answer, mark each statement that falls in a class above.
2. **Check the cache.** Was it verified this session, with a recorded source? Then reuse it.
3. **Climb the ladder** until one rung settles it:

   | Rung | Cost | Use when |
   |---|---|---|
   | Run the installed tool (`--help`, `--version`, a one-line probe) | seconds | the tool is on this machine |
   | Read the installed dependency (lockfile version, type definitions, source) | seconds | it is a project dependency |
   | Fetch library docs through a docs service | under a minute | a known library and version |
   | Fetch the official docs or changelog page | a minute | anything with official docs |
   | Search the web and open the authoritative result | minutes | you do not know where the page is |
   | Read the owner's repository at the right tag, or its issues | minutes | docs are silent or contradict behaviour |
   | Write a throwaway probe that exercises the behaviour | minutes | the docs are ambiguous and the cost of being wrong is high |

4. **Record the source** next to the fact (format below).
5. **Apply it.** Write the code or answer from the source, not from memory. If the source contradicts what you were going to write, change what you write.
6. **Batch.** Group related checks into one search or one fetch session rather than one tool call per fact. If your harness offers a cheap research agent, one dispatch with all the questions is fine.

## Recording Sources

In a plan, design or reference file:

```markdown
<!-- source: https://example.com/docs/config#timeout (fetched 2026-10-25, v4.2) -->
Timeout defaults to 30 s.
```

In a message to the user: name the source in a short clause, for example "per the v4.2 config reference (checked today)".

In code: only when the value is surprising or fragile, a one-line comment with the URL.

Record what you could not verify too: "Not verified: the docs do not state the cap; behaviour observed with v4.2 locally."

## When Sources Conflict or Are Missing

- **Source versus memory**: the source wins. Say so if the user would expect the remembered answer.
- **Source versus source**: prefer the running tool over docs, docs for the installed version over docs for latest, the owner over third parties, newer over older. State the conflict and which one you followed.
- **Docs versus behaviour**: trust observed behaviour for this version, note the discrepancy, and point to the issue if one exists.
- **No source found**: say "unverified" plainly. Do not present a guess as fact. If the decision depends on it, ask the user or design so the value is easy to change.
- **Source is undated**: record the fetch date as the date.

## Proportionality

Check in proportion to the cost of being wrong:

- **Cheap to be wrong** (a log message format, a dev-only flag the tests will exercise): one rung, or let the test be the check.
- **Expensive to be wrong** (auth, billing, data migration, public API, security setting, anything shipped to users): primary source at the right version, recorded.
- **Hard to undo** (deleting data, publishing, spending money, licence obligations): primary source plus a probe or the user's confirmation.

Do not re-verify the same fact within a session. Do not verify facts no decision depends on.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "I know this API well" | You knew a version of it. Interfaces drift with every release. |
| "It's a popular library, it won't have changed" | Popular libraries ship the most breaking releases. |
| "Checking takes too long" | A `--help` takes seconds; a wrong flag costs a debugging session. |
| "The search snippet says so" | Snippets are stale and cut. Open the page. |
| "The blog post is recent" | Recent is not authoritative. Find the owner's page it was based on. |
| "The tests will catch it" | Tests catch what you thought to test. Limits, prices and policies rarely have tests. |
| "I'll cite it later" | Sources not written down at the time get lost or invented. |
| "Two sources disagree, so I'll go with memory" | Memory is not a tiebreaker. Prefer the running tool, then the docs for your version. |

## Guardrails

**Never:**
- State a version, price, limit or "supports" claim from memory as fact.
- Cite a page you did not open.
- Invent a URL or a version number to fill a gap.
- Hide a conflict between sources; name it and say which you followed.
- Spend verification effort on facts no decision depends on.

**Always:**
- Prefer the running tool and the docs for the installed version.
- Record the source and date beside the fact in plans and reference files.
- Say "unverified" when no source settles it.
- Re-check when an error suggests the interface changed.

## Connections

- `godmode:intent-discovery`: grounds every external fact the design rests on.
- `godmode:rationale`: grounds claims about alternatives, prices and licences.
- `godmode:reference-first`: finds the implementations; grounding checks their current state.
- `godmode:task-planning`: plans carry the recorded sources into each task.
- `godmode:fault-diagnosis`: an "unknown option" or "no such method" error sends you back here.
- `godmode:environment-awareness`: what is installed on this machine is the first rung of the ladder.
