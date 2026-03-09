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
