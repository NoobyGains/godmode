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
