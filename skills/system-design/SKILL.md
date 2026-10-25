---
name: system-design
description: "Use when choosing or changing architecture, a database, an API style, authentication, caching, queues or background jobs, file and module organisation, hosting, or any external service, or when the user asks what to use, where to deploy, how to scale, or whether to split into services."
---

# System Design

Every component in an architecture is code to maintain, a bill, and a way to fail. This skill picks the simplest structure that meets a requirement the project has now, prefers what the user already runs over anything new, and records why. **Complexity must be paid for by a current, named requirement; "we might need it" pays for nothing.**

## The Prime Directive

```
NO STRUCTURAL COMPLEXITY WITHOUT A CURRENT, NAMED REQUIREMENT
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- Choosing a database, API style, auth approach, cache, queue or job runner.
- Deciding monolith versus services, or adding a new deployable.
- Choosing hosting, storage, email, search, payments or any managed service.
- Organising a new project's files and modules.
- The user asks "what should I use", "where should I host", "how do we scale", or "should we migrate to X".

**Skip:**
- The user has already chosen the stack and wants it implemented: respect the choice and build (flag a serious risk once, then proceed).
- Bug fixes and small changes inside an existing architecture.

## The Protocol

1. **List the requirements and classify each.** For every need (data, auth, files, jobs, real-time, email, payments, search, hosting), mark it **required now** (cannot launch without it), **required soon** (needed within the first weeks of real use, with evidence), **nice to have**, or **speculative**. Design only for the first two. Ask the user one question at a time when a classification is unclear.

2. **Inventory what the user already has.** Invoke `godmode:environment-awareness` for the machine and project inventory: installed databases and runtimes, container tools, cloud and hosting CLIs that are logged in, running services, existing dependencies, configuration that references services. Also ask what accounts or platforms the user or their organisation already pays for. What exists and fits wins over anything new.

3. **Start from the defaults** in the decision tables below. Each default is the simplest option that covers most projects.

4. **Move off a default only for a named requirement.** Write the requirement next to the deviation: "Queue, because image processing takes 40 s and must not block the request." If you cannot write that sentence, keep the default.

5. **Verify every changeable fact** behind the choice (a service's limits, free tier, pricing, region, runtime support) on the vendor's current page through `godmode:grounding`, and cite it. Hosting terms change often; never quote a price or limit from memory.

6. **Look for a reference architecture** when the system is unusual (`godmode:reference-first`, architecture references).

7. **Present the recommendation** in the format below, with an alternative and the trigger for switching, and what you deliberately left out.

8. **Record the decision** as a short decision record (context, decision, consequences, sources) in the project's docs, so the reason survives the conversation.

## Decision Tables

### Monolith or services

| Situation | Choose |
|---|---|
| New project, one team | **Monolith** (default), organised by capability |
| A growing codebase where teams step on each other | Modular monolith with enforced module boundaries |
| A component needs independent scaling or deploys **now**, with evidence | Extract that one component |
| Separate teams own separate domains with separate release cycles | Services along those team boundaries |

Martin Fowler's observation: successful microservice systems almost always started as a monolith; systems built as microservices from scratch often got into serious trouble. Shopify chose a modular monolith over microservices for one of the largest Rails codebases. <!-- https://martinfowler.com/bliki/MonolithFirst.html https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity -->

### Database

| Requirement | Choose |
|---|---|
| Relational data, transactions, multiple users (most applications) | **PostgreSQL** (default) |
| Single server or embedded, modest write concurrency, simplest operations | SQLite: one writer at a time, but writes take milliseconds; the SQLite authors say sites under 100K hits a day should work fine <!-- https://www.sqlite.org/whentouse.html --> |
| Some records with variable shape | PostgreSQL `jsonb` columns before a document database <!-- https://www.postgresql.org/docs/current/datatype-json.html --> |
| Text search over application data | PostgreSQL full-text search before a search engine <!-- https://www.postgresql.org/docs/current/textsearch.html --> |
| Cache, sessions, rate-limit counters, ephemeral data | Redis or a compatible store, only once needed |
| Search relevance, facets and scale beyond the database | A dedicated search engine |
| Time-series, graph or analytics workloads that dominate the product | A specialised store, chosen with evidence |

Use the database the user already runs if it fits. One database until a second access pattern clearly needs its own store.

### API style

| Context | Choose |
|---|---|
| CRUD, public or partner API, browser clients | **REST** with JSON (default); design details from `godmode:reference-first` |
| Many client shapes over nested data, client-controlled queries | GraphQL |
| Internal service-to-service calls with measured throughput needs, streaming | gRPC |
| Server pushes to the browser | Server-sent events for one-way streams; WebSockets for two-way <!-- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events --> |
| Notifying other systems of events | Signed webhooks (Standard Webhooks) |

A full-stack framework's built-in server functions are fine for its own front end; add a separate API only when another client needs it.

### Authentication

| Context | Choose |
|---|---|
| A web app with its own users on one site | **Server-side sessions in secure, HttpOnly cookies** (default), via the framework's established auth library <!-- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html --> |
| Social or enterprise sign-in | OAuth 2.0 / OpenID Connect through a maintained library or provider |
| A separate API used by third parties or other origins | Short-lived access tokens with refresh, or API keys for server-to-server |
| Polished hosted UI, organisations and SSO wanted quickly | A managed identity provider, if the user accepts the cost and lock-in |

Never write password hashing, session handling or token validation from scratch. Stateless tokens cannot be revoked before expiry without extra machinery; sessions can. Security review goes to `godmode:security-protocol` (and the OWASP Authentication Cheat Sheet). <!-- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html -->

### Caching

Add a cache only when all three hold: a performance problem has been **measured**; the query or code cannot simply be fixed; the data is read far more than it is written and can be slightly stale.

| Layer | When |
|---|---|
| HTTP caching and a CDN | Static assets and public pages (first and cheapest) |
| In-process memory | One instance, small data |
| Shared cache (Redis or compatible) | Several instances need the same cached data |
| Materialised views | Expensive aggregations in the database |

Default: no cache. Every cache needs an invalidation rule written down before it ships.

### Queues and background jobs

| Need | Choose |
|---|---|
| Work fits in the request | **Direct call** (default) |
| Occasional slow work, retries, already on PostgreSQL | A Postgres-backed job queue (for example pg-boss for Node.js) <!-- https://github.com/timgit/pg-boss --> |
| Many jobs, Redis already present | A Redis-backed queue (BullMQ for Node.js, Celery for Python) <!-- https://docs.bullmq.io https://docs.celeryq.dev --> |
| Multi-step workflows that must resume after failure, serverless hosting | A durable-workflow service (for example Inngest, which retries from the failed step) <!-- https://www.inngest.com/docs --> |
| Event streaming with replay, many consumers, high volume | A log-based broker such as Kafka, with evidence of the volume |
| Scheduled tasks | The host's cron or scheduler first |

### Hosting and services

Choose by what the user already uses, then by the shape of the workload. The comparison, with links to each vendor's current limits and pricing pages, is in [hosting-and-services.md](references/hosting-and-services.md). Rules:

- Already deploying somewhere that fits: stay there.
- Framework with a first-party host and the user is happy with it: that host is the default.
- Steady traffic, containers, full control wanted: a VPS or container platform.
- Spiky or low traffic, static-heavy: static hosting plus serverless functions.
- One provider that covers database, auth and storage beats three providers glued together, if it fits.

## File Organisation

Organise by capability, not by technical layer, so one change touches one directory:

```
src/
  billing/
    billing.routes.ts
    billing.service.ts
    billing.repository.ts
    billing.test.ts
  accounts/
    ...
  shared/
    db.ts
    auth.middleware.ts
    logger.ts
```

In an existing project, follow its layout (`godmode:codebase-conventions`), even if it is by layer. For a new project, set it up with `godmode:project-bootstrap`.

## Presenting the Recommendation

```
Requirements
- <need>: required now / required soon / nice to have (deferred) / speculative (dropped)

Already available
- <databases, runtimes, CLIs, accounts found>

Recommended
| Layer | Choice | Why (requirement, and what the user already has) | Source |
Expected running cost: <from the vendor's current pricing page, dated>, or "free tier covers current scale" with the limit cited.

Alternative and when to switch
| Layer | Alternative | Switch when <measurable trigger> |

Deliberately not used
- <service or pattern>: <why it is not needed now>
```

Keep it proportional: a weekend project gets five lines.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "We might need microservices later." | Extracting later is possible; merging a premature split is painful. Start with a monolith. |
| "NoSQL is more flexible." | PostgreSQL stores JSON. Flexibility without a schema usually becomes confusion. |
| "Everyone uses X now." | Popularity is not a requirement. What does this project need, and what does the user already run? |
| "JWTs are more secure." | They are harder to revoke. Sessions are simpler for a single site. |
| "We need a cache for speed." | Measure first. Most slowness is a query or an N+1, not a missing cache. |
| "A queue makes it scalable." | A queue adds a moving part. Use one when work cannot fit in the request. |
| "Serverless is always cheaper." | It depends on the traffic shape. Check the current pricing for this workload. |
| "I remember the free tier." | Free tiers and limits change. Read the vendor page today and cite it. |

## Guardrails

**Never:**
- Add infrastructure for speculative scale.
- Recommend a new service without first checking what the user already has.
- Quote a price, limit or free tier without a current source.
- Stack several managed services where one that the user already uses would do.
- Override a stack the user has chosen; state the risk once and build.

**Always:**
- Classify every requirement before choosing.
- Write the requirement next to every deviation from a default.
- Give an alternative with a measurable switch trigger.
- Say what you left out and why.
- Record the decision with its sources.

## Connections

- `godmode:environment-awareness`: supplies the inventory of what the user already runs; always first for hosting and service choices.
- `godmode:rationale`: questions whether the feature needs building at all, before this skill decides how.
- `godmode:reference-first`: reference architectures and API, schema and CI references.
- `godmode:grounding`: verifies vendor limits, pricing and capabilities.
- `godmode:security-protocol`: reviews auth, data flow and secrets handling.
- `godmode:performance-tuning`: measures before any cache or scaling change.
- `godmode:project-bootstrap`: sets up the chosen structure in a new repository.
