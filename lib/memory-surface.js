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
