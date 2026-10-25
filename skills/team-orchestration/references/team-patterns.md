# Team patterns

Five team shapes for `godmode:team-orchestration`. Each says when it fits, the roles, how tasks and ownership are laid out, and the coordination moments that justify a team over subagents. If a pattern's coordination moments would never happen in your case, you do not need a team.

## Contents

1. Exploration team
2. Feature team
3. Diagnosis team
4. Inspection team
5. Migration team
6. Choosing a pattern

Sizes follow the agent-teams guidance (start with 3 to 5 teammates, 5 to 6 tasks each; https://code.claude.com/docs/en/agent-teams, fetched 2026-10-25).

---

## 1. Exploration team

**Fits when** several dimensions of one question are researched at once and a finding in one should redirect another. Evaluating a technology, mapping an unfamiliar codebase, comparing approaches before a design decision.

**Roles**

| Teammate | Owns | Deliverable |
|---|---|---|
| lead | the synthesis document | recommendation with evidence |
| explorer-a, explorer-b, explorer-c | one dimension each (for example performance, security, ecosystem) | a findings file per dimension, with sources |

**Tasks and ownership.** One task per dimension per question, no dependencies at the start. Read-only work, so no source-file ownership is needed; each explorer owns only its own findings file. A final synthesis task depends on all of them and belongs to the lead.

**Coordination moments.** An explorer finds something that changes another dimension's question ("garbage-collection pauses under memory pressure: worth checking as a timing side channel") and messages that explorer directly. The lead redirects a dimension that has stopped producing.

**Exit.** The lead writes the synthesis from the findings files, citing which explorer's evidence supports each claim.

---

## 2. Feature team

**Fits when** one feature spans layers whose interface is not settled in advance: an endpoint with its UI and tests, authorisation in both frontend and backend, a new entity with schema, API and screens.

**Roles**

| Teammate | Owns | Deliverable |
|---|---|---|
| lead | the interface contract file, rulings | agreed contract, integration |
| backend | API routes, services, data access | endpoint plus unit tests |
| frontend | components, state, API client | screens plus component tests |
| tester | integration and end-to-end tests | test suite against the contract |

**Tasks and ownership.**
- Phase 1: "Draft the interface contract" (backend), no dependencies. Output: a types or schema file the others consume.
- Phase 2: "Implement backend" and "Implement frontend", each depending on the contract task, each with a disjoint directory set.
- Phase 3: "Integration tests", depending on both phase 2 tasks.
The contract file has one owner; changes to it go through that owner by message.

**Coordination moments.** Frontend needs a field the contract lacks and asks backend; backend changes an error shape and tells frontend and tester; the lead rules when they disagree and records the ruling.

**Exit.** Full suite green on the combined branch; the lead checks the implemented types match the contract file.

---

## 3. Diagnosis team

**Fits when** a failure's cause is unclear and several hypotheses are plausible. A single investigator anchors on the first plausible theory; adversarial investigators do not.

**Roles**

| Teammate | Owns | Deliverable |
|---|---|---|
| lead | the shared findings document, the verdict | root cause with the evidence that survived |
| investigator-1 to investigator-n (3 to 5) | one hypothesis each | evidence for and against, reproduction steps |

**Tasks and ownership.** One task per hypothesis, no dependencies. Investigation is read-only plus throwaway instrumentation in each investigator's own scratch directory; nobody commits a fix during this phase. A "write the fix" task depends on the verdict and goes to one owner.

**Coordination moments.** Each investigator is told to try to disprove the others' theories, not only to support its own. Evidence that kills a hypothesis goes straight to that hypothesis's owner. Each follows `godmode:fault-diagnosis`.

**Exit.** The hypothesis that survives the debate, with a reproduction; the fix then follows `godmode:test-first` with a failing test that reproduces the cause.

---

## 4. Inspection team

**Fits when** a large change needs review through several independent lenses at once, and the lenses inform each other (a security reviewer's finding changes what the performance reviewer looks at).

**Roles**

| Teammate | Lens | Deliverable |
|---|---|---|
| lead | synthesis, severity calls | one combined review |
| security | authentication, input handling, secrets, injection | findings with file:line |
| performance | hot paths, queries, allocations, caching | findings with file:line |
| tests | coverage of new behaviour, assertion quality | findings with file:line |

**Tasks and ownership.** One task per lens over the same diff (a review package file in the run workspace). Read-only; each reviewer owns its findings file. A synthesis task depends on all lenses.

**Coordination moments.** A finding that crosses lenses ("this cache keys on user input") is sent to the reviewer whose lens it also touches. The lead de-duplicates and assigns one severity per issue.

**Exit.** One review in the format of `godmode:code-review`. When independence from the author's model family matters more than breadth of lenses, `godmode:cross-model-review` is the cheaper tool.

---

## 5. Migration team

**Fits when** a cross-cutting change (a new error type, an API version, a logging convention) lands across several subsystems, and what one subsystem discovers changes the convention for the rest.

**Roles**

| Teammate | Owns | Deliverable |
|---|---|---|
| lead | the convention document, rulings | final convention, integration |
| pilot | the first subsystem migrated | worked example plus lessons |
| migrator-a, migrator-b, migrator-c | one subsystem each (disjoint directories) | migrated subsystem with green tests |

**Tasks and ownership.**
- "Migrate the pilot subsystem and write the worked example" (pilot), no dependencies.
- One task per remaining subsystem, each depending on the pilot task.
- "Remove the old convention and its shims" depending on every migration task, owned by the lead or one migrator.
Shared modules (the new error type itself) have one owner; others request changes by message.

**Coordination moments.** A migrator meets a case the convention does not cover ("billing errors need domain metadata") and messages the lead; the lead updates the convention document, records a ruling, and messages each migrator whose subsystem is affected.

**Exit.** No occurrences of the old convention remain (`git grep` for it returns nothing), the full suite is green, and the convention document matches the code.

---

## 6. Choosing a pattern

| Goal | Pattern | Writes code during the team phase? |
|---|---|---|
| Understand something | Exploration | No |
| Build across layers | Feature | Yes, disjoint ownership |
| Find a root cause | Diagnosis | No (fix afterwards) |
| Review a large change | Inspection | No |
| Apply a convention everywhere | Migration | Yes, disjoint ownership |

New to teams on a project? Start with a read-only pattern (exploration, diagnosis, inspection): they show the value of parallel discussion without the coordination risk of parallel edits.
