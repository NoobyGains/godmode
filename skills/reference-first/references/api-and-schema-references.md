# API and schema references

Checked 2026-10-25: every source below was opened and the claim next to it was read on the page. Re-open the page before citing a detail; vendors revise their docs.

Contents: 1. Standards and style guides · 2. Product APIs worth studying · 3. API design checklist · 4. Schema references by domain · 5. Schema design checklist

## 1. Standards and style guides

| Source | Study it for | URL |
|---|---|---|
| RFC 9457, Problem Details for HTTP APIs | A standard machine-readable error body; obsoletes RFC 7807 | https://www.rfc-editor.org/rfc/rfc9457 |
| Google API Improvement Proposals (AIP) | Resource-oriented design (AIP-121), errors (AIP-193), pagination (AIP-158), long-running operations (AIP-151) | https://google.aip.dev |
| Microsoft REST API Guidelines | Large-organisation REST conventions, Azure service guidance | https://github.com/microsoft/api-guidelines |
| Zalando RESTful API and Event Guidelines | API-first, OpenAPI as the contract, naming, versioning, event formats | https://opensource.zalando.com/restful-api-guidelines/ |
| Standard Webhooks | Webhook signing, replay protection, interoperable payloads | https://www.standardwebhooks.com |

## 2. Product APIs worth studying

### Stripe (REST)

| Concern | What Stripe does | Source |
|---|---|---|
| Errors | 2xx success, 4xx client errors, rare 5xx; error object with `type`, `code`, `message`, `param` | https://docs.stripe.com/api/errors |
| Pagination | Cursor pagination with `limit` (1-100, default 10), `starting_after`, `ending_before` (mutually exclusive); list object with `data` and `has_more`. The `/v2` namespace paginates differently | https://docs.stripe.com/api/pagination |
| Idempotency | Client-generated idempotency key (V4 UUID suggested, up to 255 characters) on every v1 `POST`; retries return the saved first response; mismatched parameters on reuse are an error; keys may be pruned after 24 hours | https://docs.stripe.com/api/idempotent_requests |
| Versioning | Dated versions with names (current at check time: `2026-09-30.endive`); monthly non-breaking releases, breaking changes twice a year; per-request override with the `Stripe-Version` header | https://docs.stripe.com/api/versioning |
| Enums | Open enums can grow without a version bump; clients must keep a default branch | https://docs.stripe.com/api/versioning |

### GitHub (REST and GraphQL)

| Concern | What GitHub does | Source |
|---|---|---|
| Versioning | Date-named versions chosen with the `X-GitHub-Api-Version` header; requests without it get `2022-11-28`; old versions supported at least 24 months; `Deprecation` and `Sunset` headers before retirement; `410 Gone` after | https://docs.github.com/en/rest/about-the-rest-api/api-versions |
| Breaking versus additive | Published lists of what counts as breaking (removing or renaming fields, new required parameters, removing enum values) and additive (new fields, optional parameters, enum values) | same page |
| Pagination (REST) | `link` header with `prev`, `next`, `first`, `last`; `per_page`; endpoints use `page`, `before`/`after` or `since` | https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api |
| Rate limits | `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-used`, `x-ratelimit-reset` (UTC epoch seconds), `x-ratelimit-resource`; 403 or 429 when exceeded; honour `retry-after`; back off exponentially | https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api |
| Pagination (GraphQL) | Connections with `first`/`last` (1-100) plus `after`/`before` cursors; `pageInfo { endCursor startCursor hasNextPage hasPreviousPage }` | https://docs.github.com/en/graphql/guides/using-pagination-in-the-graphql-api |

### Google Cloud (resource-oriented RPC and REST)

AIP-121 builds APIs from named resources and a small set of standard methods, with custom methods only where those do not fit. AIP-193 requires a `google.rpc.Status` with canonical codes and messages a non-expert can act on. AIP-158 says to paginate from the start, because adding pagination later is a breaking change. AIP-151 returns an operation handle for slow methods instead of blocking. Sources: https://google.aip.dev/121, /193, /158, /151.

## 3. API design checklist

Use this as a question list, answered from the references above, not as a set of defaults.

1. **Resources and names.** Nouns, plural collections, one naming case for fields everywhere (pick the project's existing one).
2. **Errors.** One error shape for the whole API. RFC 9457 is the standard choice; Stripe's object and Google's `Status` are proven alternatives. Include a stable machine code and the offending parameter.
3. **Pagination.** Decide before the first list endpoint ships (AIP-158). Cursor pagination for data that changes; return a "has more" flag or next cursor; cap the page size.
4. **Idempotency.** Accept an idempotency key on every non-idempotent write that a client may retry (payments, orders, sends). Store the first response and replay it.
5. **Versioning.** Choose a scheme (dated header like Stripe and GitHub, or a path prefix) and write down what counts as breaking, using GitHub's list as the template.
6. **Rate limits.** Return limit, remaining and reset in headers; use 429 with `Retry-After`.
7. **Long work.** Return an operation or job resource for anything that can take more than a request's timeout (AIP-151).
8. **Webhooks.** Sign payloads, include a timestamp to stop replays, retry with backoff, and let receivers deduplicate by event ID (Standard Webhooks).
9. **Enums.** Document which enums are open, and tell clients to handle unknown values (Stripe).
10. **Contract.** Publish an OpenAPI description (Zalando: "MUST provide API specifications using OpenAPI") and test against it.

## 4. Schema references by domain

Open-source schemas worth reading before you design a similar data model. Licences were read from the GitHub API on 2026-10-25; reading a schema to learn its shape is fine whatever the licence, copying code is governed by it.

| Domain | Reference | Where to look | Licence |
|---|---|---|---|
| Scheduling and bookings | Cal.com | `packages/prisma/schema.prisma`: `User`, `Team`, `Membership`, `EventType`, `Schedule`, `Availability`, `Booking`, `Attendee`, `Webhook` models | MIT (GitHub API) |
| Social and federation | Mastodon | `db/schema.rb`: `accounts`, `statuses`, `follows`, `favourites`, `mentions`, `notifications` | AGPL-3.0 |
| Commerce | Medusa | `packages/modules/`: separate modules for product, pricing, inventory, stock-location, cart, order, payment, fulfillment, customer, promotion, region, sales-channel | MIT except Enterprise Edition materials (per its `LICENSE` file) |
| Usage-based billing | Lago | `getlago/lago-api` `app/models/`: `plan`, `charge`, `subscription`, `billable_metric`, `event`, `invoice`, `customer` | AGPL-3.0 |
| Authentication | Supabase Auth | `supabase/auth` `migrations/`: users, identities, sessions, refresh tokens, MFA factors | MIT |

Sources: https://github.com/calcom/cal.com/blob/main/packages/prisma/schema.prisma · https://github.com/mastodon/mastodon/blob/main/db/schema.rb · https://github.com/medusajs/medusa · https://github.com/getlago/lago-api · https://github.com/supabase/auth

Medusa is a useful example of splitting one domain into modules with explicit links between them; Cal.com is a useful example of a single schema file that still keeps tenancy (`Team`, `Membership`) separate from the core objects.

## 5. Schema design checklist

1. **Find the domain reference first** (table above, or search `"<domain>" schema.prisma`, `"<domain>" db/schema.rb`, `"<domain>" migrations` on GitHub code search).
2. **Identity.** Decide the primary-key type once for the whole schema. Random or time-ordered IDs (UUID, ULID) suit distributed writes and public URLs; integer keys are smaller and fine for a single database. Match the project if it already decided.
3. **Timestamps.** `created_at` and `updated_at` with time zone on every table that users can change.
4. **Tenancy.** Choose row-level tenancy (a tenant or organisation key on every row) or schema or database per tenant before the first table. Cal.com's `Team` and `Membership` show the row-level shape.
5. **Deletion.** Hard delete, soft delete (`deleted_at`) or archival: choose per entity and index for the common query.
6. **Audit.** If the domain needs history (money, permissions), add an append-only event or audit table rather than overwriting.
7. **Constraints in the database.** Foreign keys, unique constraints and check constraints, not only validation in application code.
8. **Indexes from queries.** Write the top five queries first and index for them.
9. **Naming.** One case convention for tables and columns (follow the project or the ORM default), consistent junction-table names.
10. **Migrations.** Every change is a forward migration that runs on a copy of production data before it ships.
