# Architecture references

Checked 2026-10-25: each source was opened and the summary below was read on the page. Architecture choices themselves are made in `godmode:system-design`; this file is where that skill and this one find the evidence.

## Principles and case studies

| Source | What it says, briefly | URL |
|---|---|---|
| Martin Fowler, "Monolith First" (2015) | Almost all successful microservice stories started as a monolith that was broken up; systems built as microservices from scratch often ended in serious trouble. Microservices carry a "premium" that only pays off for complex systems | https://martinfowler.com/bliki/MonolithFirst.html |
| Shopify, "Deconstructing the Monolith" (2019) | One of the largest Rails codebases, worked on by more than a thousand developers, evolved into a **modular monolith** instead of microservices | https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity |
| Shopify Packwerk | The Ruby gem Shopify uses to enforce package boundaries inside a Rails monolith; the reference for "modules with enforced boundaries, one deployable" | https://github.com/Shopify/packwerk |
| Segment, "Goodbye Microservices" (2018) | Segment's destinations grew into many separate services and repositories with drifting shared-library versions; the team consolidated back to one service and repository | https://twilio.com/en-us/blog/developers/best-practices/goodbye-microservices |
| The Twelve-Factor App | Configuration in the environment, stateless processes, backing services as attached resources, dev/prod parity | https://12factor.net |

## Describing and recording architecture

| Source | Use it for | URL |
|---|---|---|
| C4 model (Simon Brown) | Hierarchical diagrams: system context, containers, components, code; plus landscape, dynamic and deployment views; notation- and tool-independent | https://c4model.com |
| arc42 | A template for architecture documentation | https://arc42.org |
| Architectural Decision Records | One record per significant decision with its rationale, trade-offs and consequences; the set forms the decision log | https://adr.github.io |

Record each structural decision that `godmode:system-design` makes as a short ADR (context, decision, consequences) in the project's docs, with links to the references that justified it.

## Cloud provider architecture centres

Use these for provider-specific reference architectures once the provider is already chosen. They describe what is possible at scale, not what a small project needs.

| Provider | URL |
|---|---|
| AWS Well-Architected Framework | https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html |
| Google Cloud Architecture Center | https://cloud.google.com/architecture |
| Azure Architecture Center | https://learn.microsoft.com/en-us/azure/architecture/ |

## Runnable examples

| Source | Use it for | URL |
|---|---|---|
| `docker/awesome-compose` (CC0-1.0) | Small multi-service Compose setups for common stacks, to copy freely | https://github.com/docker/awesome-compose |

## Data-store guidance from the vendors

| Source | What it says | URL |
|---|---|---|
| SQLite, "Appropriate Uses For SQLite" | SQLite allows one writer at a time, but writes usually take milliseconds so writers take turns; sites with fewer than 100K hits a day should work fine (a conservative figure); write-heavy or multi-server sites should consider a client/server database | https://www.sqlite.org/whentouse.html |
| PostgreSQL JSON types | `json` and `jsonb` columns for semi-structured data inside a relational database | https://www.postgresql.org/docs/current/datatype-json.html |
| PostgreSQL full-text search | Built-in text search before reaching for a search engine | https://www.postgresql.org/docs/current/textsearch.html |
| PostgreSQL LISTEN/NOTIFY | Simple in-database notifications | https://www.postgresql.org/docs/current/sql-listen.html |

## Using these references

- Quote the specific claim you rely on and link it; "Fowler says monoliths are better" is not what the article says.
- Case studies describe one organisation's constraints. Check that the constraint that drove their decision (team size, scale, deploy frequency) is true for this project before borrowing the conclusion.
- Prefer the vendor's own documentation for any limit or capability, and re-check it through `godmode:grounding`, because limits change.
