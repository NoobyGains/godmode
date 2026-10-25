---
name: knowledge-capture
description: "Use when a substantial task finishes, when the user corrects the agent or states a preference, when a non-obvious cause or project convention is discovered the hard way, or when the user asks the agent to remember or forget something"
---

# Knowledge Capture

Each session starts cold. What you learned the hard way in this one (a hidden convention, a root-cause signature, a preference the user stated) is lost unless it is written where the next session will read it. **Save durable, non-obvious lessons into the harness's own memory or the project's docs, never into a store of your own invention, and keep that memory short, current and free of duplicates.**

## The Prime Directive

```
SAVE WHAT THE NEXT SESSION CANNOT REDISCOVER CHEAPLY, WHERE IT WILL BE READ
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- The user corrects your approach or states a preference ("always use pnpm", "no emoji in commits").
- A bug's root cause was non-obvious and could recur.
- You found a project convention or gotcha by trial and error.
- A plan was badly misjudged and you now know why.
- The user says "remember", "note that", "from now on", or "forget".
- A substantial task finishes and something above happened during it.

**Skip:**
- Anything the repository already records: code structure, git history, the README, existing instruction files.
- Facts that only matter to this conversation (the current task's progress, a temporary path).
- Generic knowledge any capable engineer has.
- Secrets, tokens, personal data. Never store these.
- The user declines.

## Where Memory Lives

Use the harness's native mechanism. The exact paths and commands for each harness are in its reference file under `godmode:using-godmode` (for example [the Claude Code reference](../using-godmode/references/claude-code-tools.md)).

| Kind of lesson | Destination | Who may write |
|---|---|---|
| Agent's own learnings about this user or project (preferences, gotchas, past decisions) | the harness's auto memory, if it has one | you, freely |
| Standing instructions for every agent on the project | the project instruction file (CLAUDE.md, AGENTS.md, GEMINI.md) or a rules file | propose; the user approves |
| Knowledge a human contributor also needs | the project's docs (README, `docs/`, ADRs, comments at the code) | you, as part of the change |
| Personal preferences across projects | the user-level instruction file | propose; the user approves |

When the harness has no auto memory, the instruction file or the project docs are the only destinations, so every save is a proposal to the user. Never create a parallel store (a private JSON file, a custom database, a memory folder the harness does not load). Memory nobody loads is not memory.

## The Protocol

1. **Reflect.** At the end of a substantial task, or right after a correction, ask: what did I learn that I would want at the start of the next session? What surprised me? What did the user have to tell me?
2. **Filter.** Keep a lesson only if it is durable (still true next month), non-obvious (not derivable from the code in a minute) and actionable (it changes what an agent does). Drop the rest.
3. **Distil.** Write it as one fact in plain words, generalised from the specific case. Add why it holds and how to apply it. Convert relative dates ("yesterday", "next sprint") to absolute dates.
4. **Deduplicate.** Read the destination first. If the fact is already there, update that entry rather than adding another. If a stored entry contradicts the new evidence, replace it and keep the newer fact.
5. **Write** to the right destination from the table. One fact per entry; keep any index file to one line per entry.
6. **Promote with consent.** When the same lesson has held three or more times, or the user stated it as a rule, propose moving it into the project instruction file. Quote the line you would add. Add it only on a yes.
7. **Prune.** When you read memory at the start of work, remove or fix entries that are wrong, stale, or duplicated. Verify any file, function or flag a memory names before acting on it; memory reflects what was true when written.

## Entry Format

For auto memory or a notes file:

```markdown
---
name: prefers-pnpm
description: User wants pnpm, never npm or yarn, in this repository
---

Use pnpm for every install and script in this repository.
**Why:** the lockfile is pnpm-lock.yaml and CI fails on npm installs (corrected 2026-10-25).
**How to apply:** run `pnpm install`, `pnpm test`; never add package-lock.json.
```

For a proposed instruction-file line, one imperative sentence the user can accept or edit:

```text
- Use pnpm for all installs and scripts; CI rejects npm lockfiles.
```

## What Good Lessons Look Like

| Weak | Strong |
|---|---|
| "Fixed the login bug" | "Session cookies here need `SameSite=None; Secure`; the app is embedded in an iframe on the partner site." |
| "User likes clean code" | "User rejects string-typed errors; use the `AppError` subclasses in `src/errors.ts`." |
| "Tests were flaky" | "Tests that pass locally and fail in CI here are timezone bugs; CI runs in UTC, dev machines do not." |
| "Remember the config" | "Runtime config is read from `src/config/runtime.ts`, not from `.env`; `.env` only feeds the build." |

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "I'll remember this" | The next session starts with nothing. Write it or lose it. |
| "It's obvious" | It is obvious now, with full context. Cold, it is invisible. |
| "More memory is better" | Memory loads into every session and costs context. Short and current beats complete. |
| "I'll keep my own notes file" | A store the harness does not load is never read. Use the native one. |
| "The user said it once; I'll add a rule" | Rules in instruction files are the user's. Propose; do not write unasked. |
| "This old entry is probably still right" | Memory reflects the past. Verify before acting; fix or delete if wrong. |
| "Save the whole debugging story" | Save the lesson. The story is in the git log. |

## Guardrails

**Never:**
- Store secrets, credentials, tokens or personal data.
- Write to the user's instruction files without approval.
- Invent a memory store the harness does not load.
- Save what the repository already records.
- Add a duplicate entry instead of updating the existing one.
- Act on a remembered file, flag or function without checking it still exists.

**Always:**
- Read the destination before writing to it.
- Write one fact per entry, with why and how to apply it.
- Use absolute dates.
- Remove entries newer evidence contradicts.
- Tell the user in one line what you saved and where.

## Connections

- `godmode:using-godmode`: the harness reference files name each harness's memory paths and commands.
- `godmode:fault-diagnosis`: a non-obvious root cause is a prime lesson to capture.
- `godmode:review-response`: repeated review feedback becomes a lesson or a proposed rule.
- `godmode:codebase-conventions`: conventions found here feed later conformity checks.
- `godmode:completion-gate`: the end of a verified task is the natural moment to reflect.
- `godmode:writing-skills`: a lesson that applies to every project may belong in a skill instead.
