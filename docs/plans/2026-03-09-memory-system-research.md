# Memory System Research

> Research findings for building a local, zero-dependency persistent memory system for GodMode.

## Motivation

AI coding agents lose all context between sessions. The same debugging journey, the same architecture discovery, the same user preference correction — repeated from scratch every time. A memory system captures these insights and compounds them across sessions.

## Projects Analyzed

### 1. memory-mcp (Most Relevant Model)
- **Architecture:** Two-tier — surface file (CLAUDE.md, line-budgeted) + deep store (searchable JSON)
- **Storage:** JSON files with metadata (timestamps, confidence, tags)
- **Search:** Keyword matching, no vector DB
- **Compression:** Temporal decay, deduplication by similarity
- **Takeaway:** Closest to what we need. Lightweight, local, designed for Claude Code.

### 2. Engram (Best Zero-Dep Architecture)
- **Architecture:** Markdown-first storage with structured frontmatter
- **Storage:** `.md` files organized by namespace/category
- **Search:** Full-text search over markdown content
- **Compression:** Manual curation, no automatic compression
- **Takeaway:** Excellent file organization model. Markdown is human-readable and git-friendly.

### 3. mem0 (49.2K GitHub Stars)
- **Architecture:** Vector DB + graph DB + LLM extraction pipeline
- **Storage:** Qdrant/ChromaDB for vectors, Neo4j for relationships
- **Search:** Semantic similarity via embeddings
- **Compression:** LLM-powered summarization
- **Takeaway:** Too heavy. Requires embedding models, vector DBs, graph DBs. Overkill for local use.

### 4. memsearch
- **Architecture:** Markdown files with keyword indexing
- **Storage:** Flat markdown files in a directory
- **Search:** TF-IDF style keyword matching
- **Takeaway:** Simple and effective for small-to-medium memory stores.

### 5. Claude Code's Built-in Memory
- **Architecture:** Single-tier — `~/.claude/projects/<project>/memory/` directory
- **Storage:** Markdown files, MEMORY.md auto-loaded (200 line limit)
- **Search:** No search — entire MEMORY.md loaded into context
- **Compression:** Manual — user/agent must keep it under 200 lines
- **Takeaway:** This is what we build ON TOP OF. We enhance it, not replace it.

### 6. usewhisper.dev (The Trigger for This Work)
- **Architecture:** Cloud SaaS, closed-source
- **Storage:** Remote API, $20/mo
- **Search:** Unknown (proprietary)
- **Takeaway:** Not viable — no self-hosted option, no source code, no transparency.

## Recommended Architecture

### Two-Tier Memory Model

```
Tier 1: Surface Memory (auto-loaded every session)
├── MEMORY.md (~150 lines, in Claude Code's memory dir)
├── Contains: high-confidence patterns, preferences, key architecture notes
└── Budget-enforced: oldest low-confidence entries evicted first

Tier 2: Deep Memory (searched on demand)
├── .memory/memories.json (structured store, unlimited)
├── .memory/sessions/ (session logs as YYYY-MM-DD-HH-MM.md)
└── Searchable by keyword, type, confidence, date range
```

### Memory Types

| Type | Description | Decay Rate | Example |
|------|-------------|------------|---------|
| `architecture` | Codebase structure, key files, data flow | Very slow (180 days) | "All API routes defined in src/routes/" |
| `decision` | Why something was chosen over alternatives | Slow (90 days) | "Chose Zod over Joi for validation because..." |
| `pattern` | Recurring code patterns and conventions | Slow (90 days) | "This project uses barrel exports from index.ts" |
| `gotcha` | Traps, bugs, non-obvious behaviors | Medium (60 days) | "Redis connection pooling breaks in test env" |
| `progress` | Current work state, WIP context | Fast (7 days) | "Working on auth refactor, 3/5 tasks done" |
| `context` | Session-specific context, temporary notes | Fast (30 days) | "User prefers dark theme for all demos" |
| `preference` | User preferences, style choices | Very slow (never) | "Always use bun, not npm" |

### Confidence Scoring

```
Initial confidence: 0.5 (first observation)
Confirmed once:     0.7
Confirmed twice:    0.85
Confirmed 3+ times: 0.95 (promotion candidate)
User-stated:        1.0 (immediate high confidence)

Decay: confidence *= decay_factor ^ (days_since_last_confirmed / half_life)
Eviction threshold: 0.2 (below this, memory is pruned)
```

### Promotion to CLAUDE.md Rules

When a memory reaches:
- Confidence >= 0.9
- Confirmed 3+ times
- Type is `pattern`, `preference`, or `architecture`

It becomes a candidate for promotion to project CLAUDE.md. Requires user approval (never auto-promoted).

### Search Strategy (Zero Dependencies)

**No vector DB. No embeddings. Pure keyword matching with ranking.**

1. **Exact match boost** — Query terms found verbatim in memory content
2. **Tag matching** — Query terms match memory tags
3. **Type filtering** — Filter by memory type before ranking
4. **Recency boost** — More recent memories ranked higher
5. **Confidence boost** — Higher confidence memories ranked higher
6. **TF-IDF scoring** — Term frequency / inverse document frequency for relevance

### Compression Strategy (No LLM Required)

1. **Jaccard deduplication** — Memories with >60% word overlap are merged (keep higher confidence)
2. **Temporal decay** — Confidence decays based on type-specific half-life
3. **Eviction** — Memories below 0.2 confidence are pruned
4. **Surface budget enforcement** — MEMORY.md kept under 150 lines by evicting lowest-confidence entries
5. **Session log rotation** — Session logs older than 30 days are archived/deleted

### Data Model

```json
{
  "id": "uuid-v4",
  "type": "pattern|architecture|decision|gotcha|progress|context|preference",
  "content": "This project uses Zod for all validation at API boundaries",
  "tags": ["zod", "validation", "api"],
  "confidence": 0.85,
  "confirmations": 2,
  "created": "2026-03-09T10:00:00Z",
  "lastConfirmed": "2026-03-09T15:00:00Z",
  "source": "observation|user-stated|correction",
  "project": "godmode"
}
```

### File Structure

```
~/.claude/projects/<project>/memory/
├── MEMORY.md                    # Surface memory (auto-loaded, 150 lines)
└── .memory/
    ├── memories.json            # Deep memory store
    ├── config.json              # Memory system settings
    └── sessions/
        ├── 2026-03-09-10-00.md  # Session logs
        └── 2026-03-09-15-30.md
```

## Integration Points with GodMode

### New Skill: `memory-manager`
- Exposes memory CRUD operations
- Handles search, confidence updates, promotion
- Integrates with `knowledge-capture` skill (currently writes to memory files — this formalizes it)

### Modified Skills
- **`knowledge-capture`** — Routes captures through memory-manager instead of raw file writes
- **`activation`** — Loads surface memory at session start (already loads MEMORY.md)
- **`codebase-research`** — Checks memory before scanning codebase (faster repeat lookups)
- **`fault-diagnosis`** — Checks memory for previously diagnosed similar issues

### Session Hooks
- **session-start** — Load surface memory, decay old entries, enforce budget
- **session-end** — Persist any pending memories, write session log

## Design Decisions Still Needed

1. **Storage format** — JSON (structured, fast) vs SQLite (queryable, concurrent-safe) vs Markdown (human-readable)
2. **Scope** — Per-project only, or shared cross-project memories too?
3. **Session logging** — Full transcript capture or just key observations?
4. **Hook integration** — Session-start hook for auto-loading, or skill-based loading?
5. **CLI commands** — Expose memory operations as slash commands? (`/memory search`, `/memory forget`)

## References

- [memory-mcp](https://github.com/davidpp/memory-mcp) — Two-tier model, closest architecture match
- [Engram](https://github.com/codyth53/engram) — Markdown-first, zero-dependency
- [memsearch](https://github.com/pchaganti/gx-memsearch) — Keyword search over markdown
- Claude Code built-in memory — `~/.claude/projects/<project>/memory/MEMORY.md`
