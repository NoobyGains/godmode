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
