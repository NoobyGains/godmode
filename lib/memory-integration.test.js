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
