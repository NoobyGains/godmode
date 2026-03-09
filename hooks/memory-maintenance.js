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
