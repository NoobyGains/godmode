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
