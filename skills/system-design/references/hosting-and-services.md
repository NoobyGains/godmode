# Hosting and services

Checked 2026-10-25: each vendor page below was opened and the description is taken from it. **No prices are written here on purpose**: they change too often. Before recommending a service, open its pricing and limits pages, quote what they say today, and cite the URL with the date (`godmode:grounding`).

Contents: 1. Choosing a host · 2. Hosting options · 3. Managed databases and backends · 4. Object storage · 5. Background work · 6. What to check on every vendor page

## 1. Choosing a host

Decide in this order:

1. **What the user already deploys to** and has an account with. Staying put is usually right.
2. **What the framework expects.** Some frameworks have a first-party host; others assume a Node or Python server or a container.
3. **The workload shape.** Long-lived connections, background workers and steady load suit servers and containers; spiky, static-heavy sites suit static hosting with functions.
4. **Operational appetite.** A VPS is cheap and flexible, and the user owns patching, backups and uptime. Platforms cost more per unit and take that work away.

## 2. Hosting options

| Option | What the vendor says it is | Fits | Check before choosing | Docs |
|---|---|---|---|---|
| Vercel | Hosting for front-end frameworks with Vercel Functions (Fluid compute) | Next.js and similar front ends, preview deploys | Function limits page; pricing | https://vercel.com/docs/functions/limitations · https://vercel.com/pricing |
| Netlify | Static and front-end hosting with functions | Static and Jamstack sites | Pricing and build limits | https://www.netlify.com/pricing/ |
| Cloudflare Workers | Serverless functions on Cloudflare's network | Edge logic, APIs, static assets, users already on Cloudflare | The limits page (for example CPU time and memory per plan) | https://developers.cloudflare.com/workers/platform/limits/ |
| Fly.io | Fly Machines, volumes, networking and managed Postgres; deploy with `fly launch` | Containers close to users, long-lived processes | Pricing, regions, volume backups | https://fly.io/docs/ |
| Railway | "All-in-one" cloud for provisioning infrastructure and deploying | Small teams wanting app plus database in one place | Usage-based pricing | https://docs.railway.com |
| Render | Cloud platform from prototypes to multi-service architectures | Web services, workers, cron jobs, databases | Instance types and pricing | https://render.com/docs |
| VPS (Hetzner Cloud, DigitalOcean and others) | Virtual servers | Steady traffic, Docker workloads, full control, lowest unit cost | The user's willingness to run patching, backups, TLS and monitoring | https://www.hetzner.com/cloud · https://www.digitalocean.com/pricing |
| AWS, Google Cloud, Azure | Full cloud providers | Organisations already on them, compliance needs, complex infrastructure | Architecture centre for the provider; cost controls | see `../../reference-first/references/architecture-references.md` |

## 3. Managed databases and backends

| Option | What the vendor says it is | Fits | Docs |
|---|---|---|---|
| Supabase | Postgres-based backend with framework quickstarts and a CLI | Projects wanting database, auth and storage from one provider | https://supabase.com/docs |
| Neon | "The backend for apps and agents": Postgres with auth, object storage and functions | Serverless Postgres, branch-per-preview workflows | https://neon.com/docs/introduction |
| Host-provided Postgres | Managed Postgres from the chosen host (for example Fly.io, Render, Railway) | Keeping the database next to the app on one bill | the host's docs |
| Self-managed PostgreSQL | PostgreSQL on the user's own server | A VPS deployment; the user already runs Postgres | https://www.postgresql.org/docs/current/ |
| SQLite | An embedded database file | Single-server apps with modest write concurrency | https://www.sqlite.org/whentouse.html |

## 4. Object storage

| Option | Note | Docs |
|---|---|---|
| Cloudflare R2 | S3-compatible; R2's pricing page says there are no charges for egress bandwidth on any storage class (operations and storage are billed) | https://developers.cloudflare.com/r2/pricing/ |
| AWS S3 | The reference object store; check egress costs for the expected traffic | https://aws.amazon.com/s3/pricing/ |
| The backend's own storage | Supabase or Neon storage when the project already uses that backend | the vendor's docs |
| Local disk | Development, or a single VPS with backups | n/a |

## 5. Background work

| Option | What it is | Docs |
|---|---|---|
| pg-boss | Job queue in PostgreSQL for Node.js (MIT) | https://github.com/timgit/pg-boss |
| BullMQ | Redis-backed job queue for Node.js (MIT) | https://docs.bullmq.io |
| Celery | Distributed task queue for Python | https://docs.celeryq.dev |
| Inngest | Durable workflows: runs each step, saves its result, retries from the failed step | https://www.inngest.com/docs |
| RabbitMQ | Message broker with flexible routing | https://www.rabbitmq.com/docs |
| Apache Kafka | Distributed event log for high-volume streaming and replay | https://kafka.apache.org/documentation/ |
| Amazon SQS | Managed message queue on AWS | https://aws.amazon.com/sqs/ |

## 6. What to check on every vendor page

- The current price for the expected usage, and what the free tier includes and excludes.
- Hard limits that could break the design: request duration, CPU time, memory, payload size, connections, cold starts.
- Regions and data residency, if the user has customers in regulated jurisdictions.
- Backups and restore for anything that holds data.
- Lock-in: is the data and the deploy format portable (standard Postgres, containers, S3 API)?
- Write the date you checked next to each fact you quote.
