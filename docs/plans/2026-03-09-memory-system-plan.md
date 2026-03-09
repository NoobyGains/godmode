# Memory System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use godmode:task-runner to implement this plan task-by-task.

**Goal:** Build a local, zero-dependency persistent memory system that captures insights across sessions, searches them on demand, and auto-surfaces the highest-value memories.

**Architecture:** Two-tier (surface MEMORY.md + deep JSON store), per-project with shared global layer, keyword search with TF-IDF scoring, confidence-based lifecycle management.

**Tech Stack:** Node.js (ESM), pure stdlib (fs, path, crypto), JSON storage, bash hooks.

---

### Task 1: Core Memory Library (`lib/memory-core.js`)

**Files:**
- Create: `lib/memory-core.js`
- Create: `lib/memory-core.test.js`

**Step 1: Write failing tests for core memory operations**

```javascript
// lib/memory-core.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  createMemory,
  loadStore,
  saveStore,
  addMemory,
  confirmMemory,
  forgetMemory,
  updateMemory,
  decayMemories,
  evictMemories,
  deduplicateMemory,
  MEMORY_TYPES,
  DECAY_HALF_LIVES
} from './memory-core.js';

// Use temp directory for test isolation
function makeTempStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'godmode-mem-'));
  const storePath = path.join(dir, 'memories.json');
  return { dir, storePath };
}

describe('createMemory', () => {
  test('creates a memory with correct defaults', () => {
    const mem = createMemory({
      type: 'pattern',
      content: 'This project uses ESM modules',
      tags: ['esm', 'modules']
    });
    assert.equal(mem.type, 'pattern');
    assert.equal(mem.content, 'This project uses ESM modules');
    assert.deepEqual(mem.tags, ['esm', 'modules']);
    assert.equal(mem.confidence, 0.5);
    assert.equal(mem.confirmations, 0);
    assert.equal(mem.source, 'observation');
    assert.ok(mem.id);
    assert.ok(mem.created);
  });

  test('user-stated memories start at confidence 1.0', () => {
    const mem = createMemory({
      type: 'preference',
      content: 'Always use bun',
      tags: ['bun'],
      source: 'user-stated'
    });
    assert.equal(mem.confidence, 1.0);
  });

  test('rejects invalid memory type', () => {
    assert.throws(() => createMemory({ type: 'invalid', content: 'test' }));
  });
});

describe('loadStore / saveStore', () => {
  test('returns empty array for non-existent store', () => {
    const { storePath } = makeTempStore();
    const memories = loadStore(storePath);
    assert.deepEqual(memories, []);
  });

  test('round-trips memories through save and load', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'pattern', content: 'test', tags: [] });
    saveStore(storePath, [mem]);
    const loaded = loadStore(storePath);
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0].content, 'test');
  });
});

describe('addMemory', () => {
  test('adds memory to store', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'pattern', content: 'test pattern', tags: ['test'] });
    const store = addMemory(storePath, mem);
    assert.equal(store.length, 1);
  });
});

describe('confirmMemory', () => {
  test('bumps confidence and confirmations', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'pattern', content: 'test', tags: [] });
    addMemory(storePath, mem);
    const updated = confirmMemory(storePath, mem.id);
    assert.equal(updated.confirmations, 1);
    assert.equal(updated.confidence, 0.7);
  });

  test('caps confidence at 0.95 for observations', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'pattern', content: 'test', tags: [] });
    addMemory(storePath, mem);
    confirmMemory(storePath, mem.id); // 0.7
    confirmMemory(storePath, mem.id); // 0.85
    const updated = confirmMemory(storePath, mem.id); // 0.95
    assert.equal(updated.confidence, 0.95);
    const again = confirmMemory(storePath, mem.id); // still 0.95
    assert.equal(again.confidence, 0.95);
  });
});

describe('forgetMemory', () => {
  test('removes memory from store', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'pattern', content: 'test', tags: [] });
    addMemory(storePath, mem);
    forgetMemory(storePath, mem.id);
    const store = loadStore(storePath);
    assert.equal(store.length, 0);
  });
});

describe('decayMemories', () => {
  test('reduces confidence based on time and type half-life', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'progress', content: 'WIP', tags: [] });
    // Simulate 7 days ago
    mem.lastConfirmed = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    mem.lastDecayed = mem.lastConfirmed;
    saveStore(storePath, [mem]);
    const decayed = decayMemories(storePath);
    // progress has 7-day half-life, so after 7 days confidence ~= 0.5 * 0.5 = 0.25
    assert.ok(decayed[0].confidence < 0.5);
    assert.ok(decayed[0].confidence > 0.1);
  });

  test('preference type never decays', () => {
    const { storePath } = makeTempStore();
    const mem = createMemory({ type: 'preference', content: 'use bun', tags: [], source: 'user-stated' });
    mem.lastConfirmed = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    mem.lastDecayed = mem.lastConfirmed;
    saveStore(storePath, [mem]);
    const decayed = decayMemories(storePath);
    assert.equal(decayed[0].confidence, 1.0);
  });
});

describe('evictMemories', () => {
  test('removes memories below 0.2 confidence', () => {
    const { storePath } = makeTempStore();
    const low = createMemory({ type: 'context', content: 'old', tags: [] });
    low.confidence = 0.1;
    const high = createMemory({ type: 'pattern', content: 'keep', tags: [] });
    high.confidence = 0.8;
    saveStore(storePath, [low, high]);
    const remaining = evictMemories(storePath);
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].content, 'keep');
  });
});

describe('deduplicateMemory', () => {
  test('merges memories with >60% word overlap', () => {
    const existing = createMemory({
      type: 'pattern',
      content: 'This project uses ESM modules for all imports',
      tags: ['esm'],
      source: 'observation'
    });
    existing.confidence = 0.7;
    existing.confirmations = 1;

    const incoming = createMemory({
      type: 'pattern',
      content: 'This project uses ESM modules for imports and exports',
      tags: ['esm', 'modules']
    });

    const result = deduplicateMemory(incoming, [existing]);
    assert.equal(result.action, 'merge');
    assert.ok(result.merged.confirmations > existing.confirmations);
  });

  test('keeps distinct memories separate', () => {
    const existing = createMemory({
      type: 'pattern',
      content: 'Uses Redis for caching',
      tags: ['redis']
    });

    const incoming = createMemory({
      type: 'architecture',
      content: 'API routes defined in src/routes/',
      tags: ['api']
    });

    const result = deduplicateMemory(incoming, [existing]);
    assert.equal(result.action, 'add');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `node --test lib/memory-core.test.js`
Expected: FAIL — module `./memory-core.js` not found

**Step 3: Implement `lib/memory-core.js`**

```javascript
// lib/memory-core.js
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const MEMORY_TYPES = [
  'architecture', 'decision', 'pattern', 'gotcha',
  'progress', 'context', 'preference'
];

export const DECAY_HALF_LIVES = {
  architecture: 180,
  decision: 90,
  pattern: 90,
  gotcha: 60,
  progress: 7,
  context: 30,
  preference: Infinity // never decays
};

const CONFIDENCE_BUMPS = [0.5, 0.7, 0.85, 0.95];
const EVICTION_THRESHOLD = 0.2;
const JACCARD_THRESHOLD = 0.6;

export function createMemory({ type, content, tags = [], source = 'observation', project = null }) {
  if (!MEMORY_TYPES.includes(type)) {
    throw new Error(`Invalid memory type: ${type}. Must be one of: ${MEMORY_TYPES.join(', ')}`);
  }
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    content,
    tags,
    confidence: source === 'user-stated' ? 1.0 : 0.5,
    confirmations: 0,
    created: now,
    lastConfirmed: now,
    lastDecayed: now,
    source,
    project: project || '_current'
  };
}

export function loadStore(storePath) {
  try {
    const raw = fs.readFileSync(storePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStore(storePath, memories) {
  const dir = path.dirname(storePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(memories, null, 2), 'utf-8');
}

export function addMemory(storePath, memory) {
  const store = loadStore(storePath);
  const dedup = deduplicateMemory(memory, store);
  if (dedup.action === 'merge') {
    const idx = store.findIndex(m => m.id === dedup.merged.id);
    store[idx] = dedup.merged;
  } else {
    store.push(memory);
  }
  saveStore(storePath, store);
  return store;
}

export function confirmMemory(storePath, memoryId) {
  const store = loadStore(storePath);
  const mem = store.find(m => m.id === memoryId);
  if (!mem) throw new Error(`Memory not found: ${memoryId}`);

  mem.confirmations += 1;
  const bumpIdx = Math.min(mem.confirmations, CONFIDENCE_BUMPS.length - 1);
  if (mem.source !== 'user-stated') {
    mem.confidence = CONFIDENCE_BUMPS[bumpIdx];
  }
  mem.lastConfirmed = new Date().toISOString();
  saveStore(storePath, store);
  return mem;
}

export function forgetMemory(storePath, memoryId) {
  const store = loadStore(storePath);
  const filtered = store.filter(m => m.id !== memoryId);
  saveStore(storePath, filtered);
  return filtered;
}

export function updateMemory(storePath, memoryId, newContent) {
  const store = loadStore(storePath);
  const mem = store.find(m => m.id === memoryId);
  if (!mem) throw new Error(`Memory not found: ${memoryId}`);
  mem.content = newContent;
  mem.confidence = 0.5;
  mem.lastConfirmed = new Date().toISOString();
  saveStore(storePath, store);
  return mem;
}

export function decayMemories(storePath) {
  const store = loadStore(storePath);
  const now = Date.now();
  for (const mem of store) {
    const halfLife = DECAY_HALF_LIVES[mem.type];
    if (halfLife === Infinity) continue;
    const lastDecayed = new Date(mem.lastDecayed || mem.lastConfirmed).getTime();
    const daysSince = (now - lastDecayed) / (1000 * 60 * 60 * 24);
    if (daysSince > 0) {
      mem.confidence *= Math.pow(0.5, daysSince / halfLife);
      mem.lastDecayed = new Date().toISOString();
    }
  }
  saveStore(storePath, store);
  return store;
}

export function evictMemories(storePath) {
  const store = loadStore(storePath);
  const remaining = store.filter(m => m.confidence >= EVICTION_THRESHOLD);
  saveStore(storePath, remaining);
  return remaining;
}

export function deduplicateMemory(incoming, existingStore) {
  const incomingWords = new Set(incoming.content.toLowerCase().split(/\s+/));

  for (const existing of existingStore) {
    if (existing.type !== incoming.type) continue;
    const existingWords = new Set(existing.content.toLowerCase().split(/\s+/));
    const intersection = new Set([...incomingWords].filter(w => existingWords.has(w)));
    const union = new Set([...incomingWords, ...existingWords]);
    const jaccard = intersection.size / union.size;

    if (jaccard > JACCARD_THRESHOLD) {
      const merged = { ...existing };
      merged.confirmations += 1;
      const bumpIdx = Math.min(merged.confirmations, CONFIDENCE_BUMPS.length - 1);
      if (merged.source !== 'user-stated') {
        merged.confidence = Math.max(merged.confidence, CONFIDENCE_BUMPS[bumpIdx]);
      }
      merged.content = incoming.content; // prefer newer wording
      merged.tags = [...new Set([...existing.tags, ...incoming.tags])];
      merged.lastConfirmed = new Date().toISOString();
      return { action: 'merge', merged };
    }
  }
  return { action: 'add' };
}
```

**Step 4: Run tests to verify they pass**

Run: `node --test lib/memory-core.test.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add lib/memory-core.js lib/memory-core.test.js
git commit -m "feat(memory): add core memory library with CRUD, decay, dedup, and eviction"
```

---

### Task 2: Search Engine (`lib/memory-search.js`)

**Files:**
- Create: `lib/memory-search.js`
- Create: `lib/memory-search.test.js`

**Step 1: Write failing tests**

```javascript
// lib/memory-search.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { searchMemories } from './memory-search.js';
import { createMemory } from './memory-core.js';

function buildTestStore() {
  const mems = [
    createMemory({ type: 'pattern', content: 'This project uses ESM modules for all imports', tags: ['esm', 'modules', 'imports'] }),
    createMemory({ type: 'architecture', content: 'API routes defined in src/routes/', tags: ['api', 'routes'] }),
    createMemory({ type: 'gotcha', content: 'Redis connection pooling breaks in test environment', tags: ['redis', 'testing', 'connection'] }),
    createMemory({ type: 'preference', content: 'Always use bun instead of npm', tags: ['bun', 'npm', 'package-manager'], source: 'user-stated' }),
    createMemory({ type: 'decision', content: 'Chose PostgreSQL over MongoDB for relational data', tags: ['postgres', 'mongodb', 'database'] }),
  ];
  // Set varying confidence for ranking tests
  mems[0].confidence = 0.85;
  mems[1].confidence = 0.7;
  mems[2].confidence = 0.5;
  mems[3].confidence = 1.0;
  mems[4].confidence = 0.6;
  return mems;
}

describe('searchMemories', () => {
  test('finds memories by keyword in content', () => {
    const store = buildTestStore();
    const results = searchMemories('ESM modules', store);
    assert.ok(results.length > 0);
    assert.equal(results[0].content, 'This project uses ESM modules for all imports');
  });

  test('finds memories by tag match', () => {
    const store = buildTestStore();
    const results = searchMemories('redis', store);
    assert.ok(results.length > 0);
    assert.ok(results.some(r => r.tags.includes('redis')));
  });

  test('filters by type', () => {
    const store = buildTestStore();
    const results = searchMemories('project', store, { type: 'pattern' });
    assert.ok(results.every(r => r.type === 'pattern'));
  });

  test('returns empty for no matches', () => {
    const store = buildTestStore();
    const results = searchMemories('nonexistent-xyz-query', store);
    assert.equal(results.length, 0);
  });

  test('ranks higher confidence results first when relevance is equal', () => {
    const store = buildTestStore();
    // Both mention "project" — pattern has 0.85, architecture has 0.7
    const results = searchMemories('project', store);
    if (results.length >= 2) {
      assert.ok(results[0].confidence >= results[1].confidence);
    }
  });

  test('respects limit option', () => {
    const store = buildTestStore();
    const results = searchMemories('', store, { limit: 2 });
    assert.ok(results.length <= 2);
  });

  test('filters by minimum confidence', () => {
    const store = buildTestStore();
    const results = searchMemories('', store, { minConfidence: 0.8 });
    assert.ok(results.every(r => r.confidence >= 0.8));
  });
});
```

**Step 2: Run tests to verify failure**

Run: `node --test lib/memory-search.test.js`
Expected: FAIL — module not found

**Step 3: Implement `lib/memory-search.js`**

```javascript
// lib/memory-search.js

export function searchMemories(query, store, options = {}) {
  const { type, limit = 10, minConfidence = 0 } = options;

  let candidates = store;
  if (type) candidates = candidates.filter(m => m.type === type);
  if (minConfidence > 0) candidates = candidates.filter(m => m.confidence >= minConfidence);

  if (!query || query.trim() === '') {
    // No query — return by confidence descending
    return candidates
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const idf = buildIDF(candidates);

  const scored = candidates.map(mem => {
    const contentLower = mem.content.toLowerCase();
    const contentWords = contentLower.split(/\s+/);

    // Exact match boost
    const exactMatch = contentLower.includes(query.toLowerCase()) ? 3.0 : 0;

    // Tag match boost
    const tagMatches = queryTerms.filter(t => mem.tags.some(tag => tag.toLowerCase().includes(t))).length;
    const tagBoost = (tagMatches / queryTerms.length) * 2.0;

    // TF-IDF relevance
    let tfidfScore = 0;
    for (const term of queryTerms) {
      const tf = contentWords.filter(w => w.includes(term)).length / contentWords.length;
      const termIdf = idf.get(term) || 0;
      tfidfScore += tf * termIdf;
    }

    // Recency boost
    const daysSince = (Date.now() - new Date(mem.lastConfirmed).getTime()) / (1000 * 60 * 60 * 24);
    const recencyBoost = 1.0 / (1.0 + daysSince) * 0.5;

    // Confidence boost
    const confBoost = mem.confidence * 0.5;

    const score = exactMatch + tagBoost + tfidfScore + recencyBoost + confBoost;
    return { ...mem, _score: score };
  });

  return scored
    .filter(m => m._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...mem }) => mem);
}

function buildIDF(store) {
  const docCount = store.length || 1;
  const termDocCounts = new Map();

  for (const mem of store) {
    const words = new Set(mem.content.toLowerCase().split(/\s+/));
    for (const word of words) {
      termDocCounts.set(word, (termDocCounts.get(word) || 0) + 1);
    }
  }

  const idf = new Map();
  for (const [term, count] of termDocCounts) {
    idf.set(term, Math.log(docCount / count));
  }
  return idf;
}
```

**Step 4: Run tests**

Run: `node --test lib/memory-search.test.js`
Expected: All PASS

**Step 5: Commit**

```bash
git add lib/memory-search.js lib/memory-search.test.js
git commit -m "feat(memory): add TF-IDF keyword search engine with type/confidence filtering"
```

---

### Task 3: Surface Sync (`lib/memory-surface.js`)

**Files:**
- Create: `lib/memory-surface.js`
- Create: `lib/memory-surface.test.js`

**Step 1: Write failing tests**

```javascript
// lib/memory-surface.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { syncSurface, SURFACE_LINE_BUDGET } from './memory-surface.js';
import { createMemory } from './memory-core.js';

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'godmode-surface-'));
}

describe('syncSurface', () => {
  test('generates MEMORY.md from memories', () => {
    const dir = makeTempDir();
    const memoryMdPath = path.join(dir, 'MEMORY.md');
    const memories = [
      { ...createMemory({ type: 'preference', content: 'Always use bun', tags: ['bun'], source: 'user-stated' }), confidence: 1.0 },
      { ...createMemory({ type: 'pattern', content: 'Uses ESM modules', tags: ['esm'] }), confidence: 0.85 },
      { ...createMemory({ type: 'architecture', content: 'Routes in src/routes/', tags: ['routes'] }), confidence: 0.7 },
    ];
    syncSurface(memoryMdPath, memories);
    const content = fs.readFileSync(memoryMdPath, 'utf-8');
    assert.ok(content.includes('Always use bun'));
    assert.ok(content.includes('Uses ESM modules'));
    assert.ok(content.includes('Routes in src/routes/'));
  });

  test('stays within line budget', () => {
    const dir = makeTempDir();
    const memoryMdPath = path.join(dir, 'MEMORY.md');
    // Generate many memories to exceed budget
    const memories = Array.from({ length: 200 }, (_, i) =>
      ({ ...createMemory({ type: 'context', content: `Memory entry number ${i} with some extra words to fill lines`, tags: ['test'] }), confidence: 0.5 + (i * 0.001) })
    );
    syncSurface(memoryMdPath, memories);
    const lines = fs.readFileSync(memoryMdPath, 'utf-8').split('\n');
    assert.ok(lines.length <= SURFACE_LINE_BUDGET + 5); // small margin for headers
  });

  test('orders by type priority then confidence', () => {
    const dir = makeTempDir();
    const memoryMdPath = path.join(dir, 'MEMORY.md');
    const memories = [
      { ...createMemory({ type: 'context', content: 'Low priority context', tags: [] }), confidence: 0.9 },
      { ...createMemory({ type: 'preference', content: 'High priority preference', tags: [] }), confidence: 0.8 },
    ];
    syncSurface(memoryMdPath, memories);
    const content = fs.readFileSync(memoryMdPath, 'utf-8');
    const prefIdx = content.indexOf('High priority preference');
    const ctxIdx = content.indexOf('Low priority context');
    assert.ok(prefIdx < ctxIdx, 'Preferences should appear before context');
  });

  test('skips memories below 0.5 confidence', () => {
    const dir = makeTempDir();
    const memoryMdPath = path.join(dir, 'MEMORY.md');
    const memories = [
      { ...createMemory({ type: 'pattern', content: 'Keep this', tags: [] }), confidence: 0.8 },
      { ...createMemory({ type: 'pattern', content: 'Skip this', tags: [] }), confidence: 0.3 },
    ];
    syncSurface(memoryMdPath, memories);
    const content = fs.readFileSync(memoryMdPath, 'utf-8');
    assert.ok(content.includes('Keep this'));
    assert.ok(!content.includes('Skip this'));
  });
});
```

**Step 2: Run tests to verify failure**

Run: `node --test lib/memory-surface.test.js`
Expected: FAIL

**Step 3: Implement `lib/memory-surface.js`**

```javascript
// lib/memory-surface.js
import fs from 'node:fs';
import path from 'node:path';

export const SURFACE_LINE_BUDGET = 150;

const TYPE_PRIORITY = [
  'preference',
  'architecture',
  'pattern',
  'decision',
  'gotcha',
  'context',
  'progress'
];

const TYPE_LABELS = {
  preference: 'User Preferences',
  architecture: 'Architecture',
  pattern: 'Patterns & Conventions',
  decision: 'Key Decisions',
  gotcha: 'Gotchas & Traps',
  context: 'Context',
  progress: 'Work in Progress'
};

export function syncSurface(memoryMdPath, memories) {
  // Filter to surface-worthy memories
  const surfaceMemories = memories.filter(m => m.confidence >= 0.5);

  // Sort by type priority, then confidence descending
  surfaceMemories.sort((a, b) => {
    const typeDiff = TYPE_PRIORITY.indexOf(a.type) - TYPE_PRIORITY.indexOf(b.type);
    if (typeDiff !== 0) return typeDiff;
    return b.confidence - a.confidence;
  });

  // Group by type
  const groups = new Map();
  for (const mem of surfaceMemories) {
    if (!groups.has(mem.type)) groups.set(mem.type, []);
    groups.get(mem.type).push(mem);
  }

  // Build markdown
  const lines = ['# GodMode Memory', ''];
  let lineCount = 2;

  for (const type of TYPE_PRIORITY) {
    const group = groups.get(type);
    if (!group || group.length === 0) continue;

    const headerLines = [`## ${TYPE_LABELS[type]}`, ''];
    if (lineCount + headerLines.length >= SURFACE_LINE_BUDGET) break;
    lines.push(...headerLines);
    lineCount += headerLines.length;

    for (const mem of group) {
      const entry = `- ${mem.content}`;
      if (lineCount + 1 >= SURFACE_LINE_BUDGET) break;
      lines.push(entry);
      lineCount += 1;
    }
    lines.push('');
    lineCount += 1;
  }

  const dir = path.dirname(memoryMdPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(memoryMdPath, lines.join('\n'), 'utf-8');
}
```

**Step 4: Run tests**

Run: `node --test lib/memory-surface.test.js`
Expected: All PASS

**Step 5: Commit**

```bash
git add lib/memory-surface.js lib/memory-surface.test.js
git commit -m "feat(memory): add surface sync to auto-generate MEMORY.md from top memories"
```

---

### Task 4: Memory Manager Skill (`skills/memory-manager/SKILL.md`)

**Files:**
- Create: `skills/memory-manager/SKILL.md`

**Step 1: Write the skill definition**

```markdown
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
```

**Step 2: Run validator to check skill structure**

Run: `node scripts/validate-skills.js`
Expected: memory-manager passes validation (valid frontmatter, has required sections)

**Step 3: Commit**

```bash
git add skills/memory-manager/SKILL.md
git commit -m "feat(memory): add memory-manager skill definition"
```

---

### Task 5: Session-Start Hook Enhancement

**Files:**
- Modify: `hooks/session-start` (add memory maintenance calls)
- Create: `hooks/memory-maintenance.js` (decay, evict, sync logic)

**Step 1: Write `hooks/memory-maintenance.js`**

This script runs at session start to maintain memory health.

```javascript
#!/usr/bin/env node
// hooks/memory-maintenance.js
// Called by session-start hook to decay, evict, and sync memories.

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import from lib relative to project root
const rootDir = path.resolve(__dirname, '..');

async function run() {
  // Dynamic import to handle potential missing files gracefully
  let memoryCore, memorySurface;
  try {
    memoryCore = await import(path.join(rootDir, 'lib', 'memory-core.js'));
    memorySurface = await import(path.join(rootDir, 'lib', 'memory-surface.js'));
  } catch {
    // Memory system not installed yet — silently skip
    return { active: 0, evicted: 0 };
  }

  // Resolve project memory directory
  // Claude Code sets the project memory path based on the working directory
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const cwd = process.env.CLAUDE_PROJECT_DIR || process.cwd();

  // Attempt to find the project memory dir
  // Convention: ~/.claude/projects/<encoded-path>/memory/
  const claudeDir = path.join(homeDir, '.claude');
  const projectsDir = path.join(claudeDir, 'projects');

  if (!fs.existsSync(projectsDir)) {
    return { active: 0, evicted: 0 };
  }

  // Find project directories and process each that has a .memory store
  const results = { active: 0, evicted: 0 };

  try {
    const entries = fs.readdirSync(projectsDir);
    for (const entry of entries) {
      const memoryDir = path.join(projectsDir, entry, 'memory');
      const storePath = path.join(memoryDir, '.memory', 'memories.json');

      if (!fs.existsSync(storePath)) continue;

      // Decay
      const decayed = memoryCore.decayMemories(storePath);

      // Evict
      const remaining = memoryCore.evictMemories(storePath);
      const evictedCount = decayed.length - remaining.length;

      // Sync surface
      const memoryMdPath = path.join(memoryDir, 'MEMORY.md');
      memorySurface.syncSurface(memoryMdPath, remaining);

      results.active += remaining.length;
      results.evicted += evictedCount;
    }
  } catch {
    // Non-critical — don't break session start
  }

  // Also process global memory
  const globalStorePath = path.join(claudeDir, 'memory', 'global.json');
  if (fs.existsSync(globalStorePath)) {
    try {
      memoryCore.decayMemories(globalStorePath);
      memoryCore.evictMemories(globalStorePath);
    } catch {
      // Non-critical
    }
  }

  return results;
}

// Execute and report
run().then(results => {
  if (results.active > 0 || results.evicted > 0) {
    // Output as JSON for the hook to consume
    console.error(`Memory: ${results.active} active, ${results.evicted} evicted`);
  }
}).catch(() => {
  // Silent failure — never break session start
});
```

**Step 2: Modify `hooks/session-start` to call memory maintenance**

Add a line before the JSON output to run memory maintenance:

```bash
# Add after resolving BASE_DIR, before the activation skill loading:
# Run memory maintenance (decay, evict, sync) — non-blocking, best-effort
node "${BASE_DIR}/hooks/memory-maintenance.js" 2>/dev/null || true
```

**Step 3: Run session-start hook to verify it still works**

Run: `bash hooks/session-start`
Expected: Outputs JSON payload as before (memory maintenance runs silently)

**Step 4: Commit**

```bash
git add hooks/memory-maintenance.js hooks/session-start
git commit -m "feat(memory): add session-start memory maintenance (decay, evict, sync)"
```

---

### Task 6: Update knowledge-capture Skill

**Files:**
- Modify: `skills/knowledge-capture/SKILL.md`

**Step 1: Update the Storage Mechanism section**

Replace the current manual file-writing instructions with memory-manager integration. The skill should instruct agents to route captures through the memory-manager skill instead of writing directly to separate markdown files.

Key changes:
- Add a note at the top of the Storage section: "**REQUIRED:** Route all captures through godmode:memory-manager"
- Replace the file taxonomy table to reference memory types instead of separate files
- Keep the Entry Structure format (Date, Context, Insight, Confidence, Confirmations) as it maps directly to the memory data model
- Add memory-manager to the Integration section

**Step 2: Run validator**

Run: `node scripts/validate-skills.js`
Expected: knowledge-capture passes, cross-ref to memory-manager resolves

**Step 3: Commit**

```bash
git add skills/knowledge-capture/SKILL.md
git commit -m "feat(memory): integrate knowledge-capture with memory-manager skill"
```

---

### Task 7: Update Skill Count and References

**Files:**
- Modify: `README.md` (update skill count 36 → 37, add memory-manager to skill table)
- Modify: `skills/activation/SKILL.md` (add memory-manager to skill ordering if needed)
- Modify: `.claude-plugin/marketplace.json` (if skill count is referenced)

**Step 1: Update README.md**

- Change badge from `skills-36` to `skills-37`
- Change "36-skill system" to "37-skill system"
- Add `memory-manager` to the Infrastructure and Operations table (now 6 skills)
- Update "Infrastructure and Operations (5 skills)" to "(6 skills)"
- Update "The 37 Skills" heading

**Step 2: Run validator**

Run: `node scripts/validate-skills.js`
Expected: 37 protocols found, all pass

**Step 3: Commit**

```bash
git add README.md skills/activation/SKILL.md .claude-plugin/marketplace.json
git commit -m "chore: update skill count to 37, add memory-manager to README and manifests"
```

---

### Task 8: Integration Tests

**Files:**
- Create: `lib/memory-integration.test.js`

**Step 1: Write integration tests covering the full lifecycle**

```javascript
// lib/memory-integration.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createMemory, addMemory, loadStore, confirmMemory, decayMemories, evictMemories } from './memory-core.js';
import { searchMemories } from './memory-search.js';
import { syncSurface } from './memory-surface.js';

function makeTempEnv() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'godmode-integ-'));
  const storePath = path.join(dir, '.memory', 'memories.json');
  const surfacePath = path.join(dir, 'MEMORY.md');
  return { dir, storePath, surfacePath };
}

describe('full memory lifecycle', () => {
  test('store → search → confirm → promote → surface', () => {
    const { storePath, surfacePath } = makeTempEnv();

    // 1. Store multiple memories
    const m1 = createMemory({ type: 'pattern', content: 'Uses Zod for validation at API boundaries', tags: ['zod', 'validation'] });
    const m2 = createMemory({ type: 'architecture', content: 'Database migrations in db/migrations/', tags: ['database', 'migrations'] });
    const m3 = createMemory({ type: 'preference', content: 'Always use pnpm', tags: ['pnpm'], source: 'user-stated' });
    addMemory(storePath, m1);
    addMemory(storePath, m2);
    addMemory(storePath, m3);

    // 2. Search
    const results = searchMemories('zod validation', loadStore(storePath));
    assert.ok(results.length > 0);
    assert.ok(results[0].content.includes('Zod'));

    // 3. Confirm pattern 3 times
    confirmMemory(storePath, m1.id);
    confirmMemory(storePath, m1.id);
    const confirmed = confirmMemory(storePath, m1.id);
    assert.equal(confirmed.confidence, 0.95);
    assert.equal(confirmed.confirmations, 3);

    // 4. Sync surface
    syncSurface(surfacePath, loadStore(storePath));
    const surface = fs.readFileSync(surfacePath, 'utf-8');
    assert.ok(surface.includes('Always use pnpm'));
    assert.ok(surface.includes('Uses Zod'));
    assert.ok(surface.includes('Database migrations'));
  });

  test('decay → eviction lifecycle', () => {
    const { storePath } = makeTempEnv();

    // Store a progress memory with old timestamp
    const m = createMemory({ type: 'progress', content: 'Old WIP', tags: ['wip'] });
    m.lastConfirmed = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    m.lastDecayed = m.lastConfirmed;
    m.confidence = 0.5;

    const keeper = createMemory({ type: 'preference', content: 'Always bun', tags: ['bun'], source: 'user-stated' });

    addMemory(storePath, m);
    addMemory(storePath, keeper);

    // Decay
    decayMemories(storePath);

    // Evict
    const remaining = evictMemories(storePath);

    // Progress memory should be evicted (30 days / 7-day half-life = ~4 half-lives)
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].content, 'Always bun');
  });

  test('deduplication on add', () => {
    const { storePath } = makeTempEnv();

    const m1 = createMemory({ type: 'pattern', content: 'This project uses ESM modules for all imports', tags: ['esm'] });
    addMemory(storePath, m1);

    // Add near-duplicate
    const m2 = createMemory({ type: 'pattern', content: 'This project uses ESM modules for imports and exports', tags: ['esm', 'exports'] });
    addMemory(storePath, m2);

    const store = loadStore(storePath);
    // Should have merged into one entry
    assert.equal(store.length, 1);
    assert.ok(store[0].confirmations >= 1);
    assert.ok(store[0].tags.includes('exports')); // merged tags
  });
});
```

**Step 2: Run all tests**

Run: `node --test lib/memory-core.test.js lib/memory-search.test.js lib/memory-surface.test.js lib/memory-integration.test.js`
Expected: All PASS

**Step 3: Commit**

```bash
git add lib/memory-integration.test.js
git commit -m "test(memory): add integration tests for full memory lifecycle"
```
