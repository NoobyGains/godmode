---
name: memory-manager
description: Use when capturing, searching, or managing persistent memories across sessions - handles storage, confidence scoring, deduplication, decay, and surface sync
---

# Memory Manager

## Overview

Persistent memory across sessions. Capture insights, search previous discoveries, promote high-confidence observations to surface memory.

**Core principle:** Every valuable observation persists. Every session builds on the last.

## The Prime Directive

CAPTURE INSIGHTS. SEARCH BEFORE REDISCOVERING. PROMOTE WHAT PROVES TRUE.

## When to Use

**Automatically invoked by:**
- knowledge-capture skill (routes captures through this manager)
- Session-start hook (runs decay, eviction, surface sync)

**Manually invoked for:**
- Searching memories: "Have we seen this before?"
- Storing a new observation
- Confirming a previous observation was correct
- Forgetting incorrect memories
- Promoting memories to MEMORY.md or CLAUDE.md

## Operations

### Store a Memory

When an insight is worth preserving:

1. Classify the type: architecture, decision, pattern, gotcha, progress, context, preference
2. Extract 2-5 keyword tags
3. Determine source: observation (you noticed it), user-stated (user told you), correction (user corrected you)
4. Call store with the memory object
5. Deduplication runs automatically — if >60% word overlap with existing memory, it merges

### Search Memories

Before researching something that may have been discovered before:

1. Formulate a keyword query (2-5 terms)
2. Optionally filter by type or minimum confidence
3. Review results — top 10 returned by relevance
4. If a match exists, use it instead of rediscovering

### Confirm a Memory

When a previous observation is validated again:

1. Find the memory by searching
2. Confirm it — this bumps confidence (0.5 → 0.7 → 0.85 → 0.95)
3. At 3+ confirmations with confidence >= 0.9, it becomes a promotion candidate

### Promote a Memory

When a memory has proven itself:

1. Check: confidence >= 0.9, confirmations >= 3
2. Present to user: "This has been confirmed N times: [content]. Promote to MEMORY.md?"
3. If approved, add to surface memory
4. For high-value patterns, suggest CLAUDE.md promotion

### Forget a Memory

When a memory is wrong or outdated:

1. Search for the memory
2. Delete it from the store
3. If it was in MEMORY.md, regenerate surface

## Memory Types

| Type | Use For | Decay |
|------|---------|-------|
| preference | User preferences, tool choices | Never |
| architecture | Codebase structure, key files | 180 days |
| pattern | Code conventions, naming rules | 90 days |
| decision | Why X was chosen over Y | 90 days |
| gotcha | Traps, non-obvious behaviors | 60 days |
| context | Temporary session context | 30 days |
| progress | WIP state, task tracking | 7 days |

## Confidence Model

- 0.5: First observation
- 0.7: Confirmed once
- 0.85: Confirmed twice
- 0.95: Confirmed 3+ times (promotion candidate)
- 1.0: User-stated directly

Confidence decays based on type-specific half-life. Memories below 0.2 are evicted.

## Where Memories Live

**Per-project:** ~/.claude/projects/<project>/memory/.memory/memories.json
**Global:** ~/.claude/memory/global.json (preferences and cross-project patterns)
**Surface:** ~/.claude/projects/<project>/memory/MEMORY.md (auto-generated, auto-loaded)

## Integration

**Routes through this skill:**
- godmode:knowledge-capture — all captures go through memory-manager
- Session-start hook — decay, eviction, surface sync on every session

**Consults this skill:**
- godmode:codebase-research — check memory before scanning
- godmode:fault-diagnosis — check memory for previously diagnosed issues
- godmode:pattern-matching — check memory for confirmed patterns
