# Memory System Design

> Validated design for GodMode's local persistent memory system.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope | Per-project + shared global layer | Preferences cross projects; architecture stays scoped |
| Storage | JSON files | Zero dependencies, human-inspectable, fast for hundreds of entries |
| Session logging | Key observations only | High signal-to-noise, leverages existing knowledge-capture skill |
| Interaction | Skill + slash commands + auto-capture | Invisible when working, accessible when needed |

## Architecture

```
Per-Project Memory:
~/.claude/projects/<project>/memory/
├── MEMORY.md                      # Surface tier (auto-loaded, ~150 lines)
└── .memory/
    ├── memories.json              # Deep store (structured, searchable)
    ├── config.json                # Per-project settings
    └── sessions/
        └── YYYY-MM-DD-HH-MM.md   # Key observations per session

Global Memory:
~/.claude/memory/
├── global.json                    # Cross-project memories (preferences, global patterns)
└── config.json                    # Global settings
```

## Data Model

### Memory Entry

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
  "lastDecayed": "2026-03-09T10:00:00Z",
  "source": "observation|user-stated|correction",
  "project": "godmode|_global"
}
```

### Memory Types

| Type | Description | Decay Half-Life | Stored In |
|------|-------------|-----------------|-----------|
| `architecture` | Codebase structure, key files, data flow | 180 days | Project |
| `decision` | Why something was chosen over alternatives | 90 days | Project |
| `pattern` | Recurring code patterns and conventions | 90 days | Project |
| `gotcha` | Traps, bugs, non-obvious behaviors | 60 days | Project |
| `progress` | Current work state, WIP context | 7 days | Project |
| `context` | Session-specific context, temporary notes | 30 days | Project |
| `preference` | User preferences, style choices | Never decays | Global |

## Confidence Model

### Scoring

| Event | Confidence |
|-------|------------|
| First observation | 0.5 |
| Confirmed once | 0.7 |
| Confirmed twice | 0.85 |
| Confirmed 3+ times | 0.95 |
| User-stated directly | 1.0 |
| User correction | 1.0 (replaces old memory) |

### Decay Formula

```
confidence *= decay_factor ^ (days_since_last_confirmed / half_life)

Where:
  decay_factor = 0.5 (halves at half_life)
  half_life = type-specific (see table above)
```

### Thresholds

| Threshold | Action |
|-----------|--------|
| >= 0.9 + 3 confirmations | Promotion candidate (surface to MEMORY.md or CLAUDE.md) |
| >= 0.5 | Active memory, included in search results |
| 0.2 - 0.5 | Low confidence, deprioritized in search |
| < 0.2 | Evicted (deleted from store) |

## Search Strategy

Zero-dependency keyword search with composite scoring:

```
score = (exact_match_boost * 3.0)
      + (tag_match_boost * 2.0)
      + (tfidf_relevance * 1.0)
      + (recency_boost * 0.5)
      + (confidence * 0.5)

Where:
  exact_match_boost = 1.0 if query appears verbatim in content, else 0.0
  tag_match_boost = (matching_tags / total_query_terms)
  tfidf_relevance = sum of TF-IDF scores for each query term
  recency_boost = 1.0 / (1.0 + days_since_last_confirmed)
  confidence = memory.confidence
```

Results filtered by type if specified, sorted by composite score, top 10 returned.

## Compression Strategy

### Deduplication (Jaccard Similarity)

```
For each new memory:
  Compare against existing memories of same type
  If Jaccard similarity > 0.6:
    Merge: keep higher confidence, combine tags, update content to newer version
    Increment confirmations on the surviving memory
```

### Budget Enforcement (Surface Memory)

```
When MEMORY.md exceeds 150 lines:
  1. Sort entries by confidence (ascending)
  2. Remove lowest-confidence entries until under budget
  3. Entries with confidence >= 0.9 are protected (never auto-evicted)
```

### Temporal Eviction

```
On session start:
  1. Calculate decayed confidence for all memories
  2. Delete memories with confidence < 0.2
  3. Update lastDecayed timestamp
```

## Components

### 1. memory-manager Skill (New)

Core operations exposed to agents:

| Operation | Description |
|-----------|-------------|
| `store(memory)` | Add a new memory, dedup against existing |
| `search(query, options)` | Keyword search with type/confidence filters |
| `confirm(id)` | Bump confidence and confirmation count |
| `forget(id)` | Delete a specific memory |
| `update(id, content)` | Update memory content, reset confidence to 0.5 |
| `promote(id)` | Surface a memory to MEMORY.md (with user approval) |
| `decay()` | Run temporal decay across all memories |
| `sync()` | Regenerate MEMORY.md from top memories |
| `stats()` | Return memory counts by type, average confidence |

### 2. Session-Start Hook Enhancement

Add to existing `hooks/session-start.js`:

```
On session start:
  1. Run decay() on project memories and global memories
  2. Run eviction (delete confidence < 0.2)
  3. Run sync() to regenerate MEMORY.md from top memories
  4. Report: "Memory: X active, Y evicted this session"
```

### 3. knowledge-capture Integration

Modify `knowledge-capture` skill to route through memory-manager:

```
Current flow:
  Reflect -> Distill -> Write to memory file manually

New flow:
  Reflect -> Distill -> memory-manager.store(memory)
  memory-manager handles dedup, confidence, tagging, storage
```

### 4. Slash Commands

| Command | Action |
|---------|--------|
| `/memory search <query>` | Search memories, display top results |
| `/memory forget <id>` | Delete a specific memory |
| `/memory promote <id>` | Promote memory to MEMORY.md or CLAUDE.md |
| `/memory stats` | Show memory counts, health, oldest entries |
| `/memory list [type]` | List memories, optionally filtered by type |

### 5. Surface Sync Algorithm

Auto-generate MEMORY.md from the memory store:

```
1. Collect all memories with confidence >= 0.5
2. Sort by: type priority (preference > architecture > pattern > decision > gotcha > context > progress), then confidence descending
3. Format each as a concise line under type headers
4. Truncate at 150 lines
5. Write to MEMORY.md
```

## File Structure (Implementation)

```
skills/
  memory-manager/
    SKILL.md                # Skill definition and instructions
    memory-ops.js           # Core memory operations (store, search, decay, sync)
    search.js               # TF-IDF search implementation
    dedup.js                # Jaccard similarity deduplication

lib/
  memory-core.js            # Shared memory utilities (file I/O, path resolution)

hooks/
  session-start.js          # Enhanced with memory decay/sync (modify existing)
```

## Integration with Existing Skills

| Skill | Integration |
|-------|-------------|
| `knowledge-capture` | Routes captures through memory-manager.store() |
| `activation` | Already loads MEMORY.md; no change needed |
| `codebase-research` | Check memory before scanning (faster repeat lookups) |
| `fault-diagnosis` | Check memory for previously diagnosed similar issues |
| `pattern-matching` | Check memory for confirmed patterns before file scanning |

## Promotion Flow

```
Memory reaches confidence >= 0.9 with 3+ confirmations
  -> memory-manager flags as promotion candidate
  -> On next /memory promote or during session summary:
     Present to user: "This observation has been confirmed 3+ times:
       '[content]'
       Promote to MEMORY.md? (y/n)"
  -> If approved: Add to MEMORY.md under appropriate section
  -> If high-value pattern: Suggest adding to project CLAUDE.md
  -> NEVER auto-promote without user consent
```
