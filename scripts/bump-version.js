#!/usr/bin/env node
/**
 * Set the same version in every manifest listed in .version-bump.json.
 *
 *   node scripts/bump-version.js 2.0.1
 *
 * Zero dependencies. Rewrites each JSON file with two-space indentation and a
 * trailing newline, touching only the named field.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const version = process.argv[2];
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
  console.error('usage: node scripts/bump-version.js <semver>');
  process.exit(2);
}

const spec = JSON.parse(fs.readFileSync(path.join(ROOT, '.version-bump.json'), 'utf8'));
for (const { path: rel, field } of spec.files) {
  const file = path.join(ROOT, rel);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const keys = field.split('.');
  let node = data;
  for (const key of keys.slice(0, -1)) node = node[Array.isArray(node) ? Number(key) : key];
  const last = keys.at(-1);
  const before = node[last];
  node[last] = version;
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`${rel}: ${before} -> ${version}`);
}
