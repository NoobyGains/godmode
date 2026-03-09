#!/usr/bin/env node

/**
 * GodMode Protocol Validator
 *
 * Scans the skills/ directory and validates each protocol for:
 * - Correct YAML frontmatter structure
 * - File presence and size (SKILL.md exists, non-empty, reasonable length)
 * - Content integrity (headings present, "When to Use" section)
 * - Cross-reference validity (godmode:X references resolve to real protocols)
 * - Uniqueness (no duplicate protocol names)
 *
 * Usage:
 *   node scripts/validate-skills.js        # Interactive mode with color output
 *   node scripts/validate-skills.js --ci   # CI mode: non-zero exit on errors
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseFrontmatter } from '../lib/skills-core.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const AGENTS_DIR = path.join(ROOT, 'agents');

const ciMode = process.argv.includes('--ci');

// ── Terminal formatting ──────────────────────────────────────────────────

const fmt = {
  red:    (s) => ciMode ? s : `\x1b[31m${s}\x1b[0m`,
  green:  (s) => ciMode ? s : `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => ciMode ? s : `\x1b[33m${s}\x1b[0m`,
  cyan:   (s) => ciMode ? s : `\x1b[36m${s}\x1b[0m`,
  bold:   (s) => ciMode ? s : `\x1b[1m${s}\x1b[0m`,
  dim:    (s) => ciMode ? s : `\x1b[2m${s}\x1b[0m`,
};

// ── Frontmatter extraction (extended for validation) ─────────────────────

/**
 * Extract YAML frontmatter with support for quoted and multi-line values.
 * Returns { name, description } or null when no frontmatter is found.
 */
function extractHeader(content) {
  const lines = content.split('\n');
  let inside = false;
  let headerLines = [];

  for (const line of lines) {
    if (line.trim() === '---') {
      if (inside) break;
      inside = true;
      continue;
    }
    if (inside) {
      headerLines.push(line);
    }
  }

  if (!inside || headerLines.length === 0) {
    return null;
  }

  const data = {};
  let activeKey = null;
  let activeVal = '';

  for (const line of headerLines) {
    const keyMatch = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (keyMatch) {
      if (activeKey) {
        data[activeKey] = sanitizeValue(activeVal);
      }
      activeKey = keyMatch[1];
      activeVal = keyMatch[2];
    } else if (activeKey && (line.startsWith('  ') || line.startsWith('\t'))) {
      activeVal += ' ' + line.trim();
    }
  }

  if (activeKey) {
    data[activeKey] = sanitizeValue(activeVal);
  }

  return data;
}

/**
 * Strip surrounding quotes and whitespace from a YAML value.
 */
function sanitizeValue(val) {
  let v = val.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1);
  }
  if (v.startsWith("'") && v.endsWith("'")) {
    v = v.slice(1, -1);
  }
  return v.trim();
}

// ── Protocol validation ──────────────────────────────────────────────────

/**
 * Validate a single protocol directory.
 * Returns { errors: string[], warnings: string[] }
 */
function validateProtocol(protocolDir, knownNames) {
  const errors = [];
  const warnings = [];
  const dirName = path.basename(protocolDir);
  const defFile = path.join(protocolDir, 'SKILL.md');

  // ── Structure checks ──

  if (!fs.existsSync(defFile)) {
    errors.push('SKILL.md does not exist');
    return { errors, warnings };
  }

  const content = fs.readFileSync(defFile, 'utf8');
  const stat = fs.statSync(defFile);

  if (content.trim().length === 0) {
    errors.push('SKILL.md is empty');
    return { errors, warnings };
  }

  if (stat.size < 500) {
    warnings.push(`SKILL.md is only ${stat.size} bytes (likely incomplete)`);
  }

  // ── Frontmatter checks ──

  const hasOpener = content.startsWith('---') || content.match(/^---\s*$/m);
  if (!hasOpener) {
    errors.push('Missing opening --- frontmatter marker');
    return { errors, warnings };
  }

  const lines = content.split('\n');
  let delimCount = 0;
  for (const line of lines) {
    if (line.trim() === '---') delimCount++;
  }
  if (delimCount < 2) {
    errors.push('Missing closing --- frontmatter marker');
    return { errors, warnings };
  }

  const header = extractHeader(content);
  if (!header) {
    errors.push('Could not parse YAML frontmatter');
    return { errors, warnings };
  }

  // Cross-check with canonical parser
  const canonical = parseFrontmatter(defFile);

  // Name validation
  if (!header.name) {
    errors.push('Missing required "name" field in frontmatter');
  } else {
    const name = header.name;

    if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)) {
      errors.push(`Name "${name}" is not valid kebab-case`);
    }

    if (name.length > 64) {
      errors.push(`Name "${name}" exceeds 64 character limit (${name.length} chars)`);
    }

    if (name !== dirName) {
      errors.push(`Name "${name}" does not match directory name "${dirName}"`);
    }
  }

  // Description validation
  if (!header.description) {
    errors.push('Missing required "description" field in frontmatter');
  } else {
    const desc = header.description;

    if (desc.length > 1024) {
      errors.push(`Description exceeds 1024 character limit (${desc.length} chars)`);
    }

    if (!desc.startsWith('Use when') && !desc.startsWith('Use When')) {
      warnings.push(`Description does not start with "Use when" (starts with "${desc.substring(0, 30)}...")`);
    }
  }

  // ── Content quality checks ──

  let inFm = false;
  let fmDone = false;
  const bodyLines = [];
  for (const line of lines) {
    if (line.trim() === '---') {
      if (inFm) { fmDone = true; continue; }
      inFm = true;
      continue;
    }
    if (fmDone || !inFm) {
      bodyLines.push(line);
    }
  }
  const body = bodyLines.join('\n');

  if (!body.match(/^#+\s+/m)) {
    errors.push('No headings found in skill content');
  }

  const hasWhenToUse = body.match(/^#+\s+When\s+to\s+Use/mi) ||
                       body.match(/^#+\s+When\s+To\s+Use/m) ||
                       body.match(/^#+\s+When\s+to\s+use/m);
  if (!hasWhenToUse) {
    warnings.push('Missing "When to Use" section');
  }

  // ── Cross-reference validation ──

  const refPattern = /godmode:([a-z][a-z0-9-]*)/g;
  let match;
  const verified = new Set();
  while ((match = refPattern.exec(content)) !== null) {
    const refTarget = match[1];
    if (verified.has(refTarget)) continue;
    verified.add(refTarget);

    if (!knownNames.has(refTarget)) {
      errors.push(`Broken reference to "godmode:${refTarget}" (skill not found)`);
    }
  }

  return { errors, warnings };
}

// ── Entry point ──────────────────────────────────────────────────────────

function run() {
  console.log(fmt.bold('\nGodMode Protocol Validator\n'));

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(fmt.red('ERROR: skills/ directory not found at ' + SKILLS_DIR));
    process.exit(1);
  }

  // Enumerate all protocol directories
  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const protocolDirs = entries
    .filter(e => e.isDirectory())
    .map(e => ({
      name: e.name,
      path: path.join(SKILLS_DIR, e.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (protocolDirs.length === 0) {
    console.error(fmt.red('ERROR: No protocol directories found in skills/'));
    process.exit(1);
  }

  // Collect all known names for cross-reference checking
  const knownNames = new Set(protocolDirs.map(d => d.name));

  // Include agent definitions as valid cross-reference targets
  if (fs.existsSync(AGENTS_DIR)) {
    const agentFiles = fs.readdirSync(AGENTS_DIR);
    for (const af of agentFiles) {
      const baseName = af.replace(/\.md$/, '');
      knownNames.add(baseName);
    }
  }

  // Detect duplicate names across different directories
  const nameRegistry = new Map();
  const dupeErrors = [];
  for (const dir of protocolDirs) {
    const defFile = path.join(dir.path, 'SKILL.md');
    if (fs.existsSync(defFile)) {
      const content = fs.readFileSync(defFile, 'utf8');
      const fm = extractHeader(content);
      if (fm && fm.name) {
        if (nameRegistry.has(fm.name)) {
          dupeErrors.push(`Duplicate protocol name "${fm.name}" in ${nameRegistry.get(fm.name)} and ${dir.name}`);
        } else {
          nameRegistry.set(fm.name, dir.name);
        }
      }
    }
  }

  // Run validation on each protocol
  let errorTotal = 0;
  let warnTotal = 0;
  let okCount = 0;
  let failedCount = 0;

  for (const dir of protocolDirs) {
    const { errors, warnings } = validateProtocol(dir.path, knownNames);

    const hasErrors = errors.length > 0;
    errorTotal += errors.length;
    warnTotal += warnings.length;

    if (hasErrors) {
      failedCount++;
      console.log(fmt.red(`  \u2717 ${dir.name}`));
    } else {
      okCount++;
      console.log(fmt.green(`  \u2713 ${dir.name}`));
    }

    for (const err of errors) {
      console.log(fmt.red(`      ERROR: ${err}`));
    }
    for (const warn of warnings) {
      console.log(fmt.yellow(`      WARN:  ${warn}`));
    }
  }

  for (const dup of dupeErrors) {
    console.log(fmt.red(`  ERROR: ${dup}`));
    errorTotal++;
  }

  // ── Results ──

  console.log('');
  console.log(fmt.bold('  Results'));
  console.log(fmt.dim('  ' + '-'.repeat(40)));
  console.log(`  Protocols found: ${protocolDirs.length}`);
  console.log(fmt.green(`  Passed:          ${okCount}`));
  if (failedCount > 0) {
    console.log(fmt.red(`  Failed:          ${failedCount}`));
  }
  console.log(`  Total errors:    ${errorTotal}`);
  console.log(`  Total warnings:  ${warnTotal}`);
  console.log('');

  if (errorTotal > 0) {
    console.log(fmt.red(fmt.bold('  VALIDATION FAILED\n')));
    if (ciMode) {
      process.exit(1);
    }
  } else {
    console.log(fmt.green(fmt.bold('  ALL PROTOCOLS VALID\n')));
  }
}

run();
