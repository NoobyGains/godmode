#!/usr/bin/env node
/**
 * GodMode validator. Zero dependencies, Node 20+.
 *
 * Checks the whole plugin, not only the skills:
 *   - every skills/<name>/SKILL.md has frontmatter with name == directory and a
 *     trigger-only description ("Use when ...", under the length limit, no
 *     workflow summary words);
 *   - the body has the required sections in order;
 *   - every godmode:<skill> cross-reference resolves to a 2.0 skill;
 *   - skill bodies name actions, not harness tools (tool names belong in
 *     skills/using-godmode/references/<harness>-tools.md);
 *   - hook scripts are executable in git and hooks.json double-quotes the
 *     plugin root (the 1.0 bug behind issues #1, #2 and #4);
 *   - the version is identical in every manifest and every manifest is listed
 *     in .version-bump.json;
 *   - the README names every skill and states the right skill count;
 *   - the icon is a square PNG between 512 and 2048 px.
 *
 * Usage: node scripts/validate.js [--ci] [--quiet]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ci = process.argv.includes('--ci');
const quiet = process.argv.includes('--quiet');

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const json = (rel) => JSON.parse(read(rel));

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

export function parseFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end < 0) return null;
  const block = content.slice(4, end);
  const data = {};
  let key = null;
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (m) {
      key = m[1];
      data[key] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    } else if (key && /^\s+\S/.test(line)) {
      data[key] = (data[key] + ' ' + line.trim()).trim();
    }
  }
  return { data, body: content.slice(end + 4) };
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

const REQUIRED_SECTIONS = [
  'The Prime Directive',
  'When to Use',
  'Cognitive Traps',
  'Guardrails',
];

// Words that mean the description summarises the workflow instead of the trigger.
const WORKFLOW_WORDS = /\b(then|after that|followed by|step \d|first .* then)\b/i;

// Harness tool names and env vars that must not appear in skill bodies.
// They are allowed in skills/using-godmode/references/*-tools.md only.
const TOOL_NAMES = [
  'TeamCreate', 'SendMessage', 'TaskCreate', 'TaskUpdate', 'TaskList', 'TaskGet',
  'TodoWrite', 'EnterWorktree', 'ToolSearch', 'AskUserQuestion', 'WebFetch', 'WebSearch',
  'invoke_subagent', 'spawn_agent', 'wait_agent', 'followup_task', 'write_to_file',
  'replace_file_content', 'update_plan', 'manage_task', 'define_subagent',
  'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS', 'CLAUDE_PLUGIN_ROOT', 'CURSOR_PLUGIN_ROOT',
];
const TOOL_RE = new RegExp(`(?<![\\w/.-])(${TOOL_NAMES.join('|')})(?![\\w-])`, 'g');
// "Agent tool", "Task tool", "Skill tool" phrases couple to Claude Code too.
const TOOL_PHRASE_RE = /\b(Agent|Task|Skill) tool\b/g;

const DESCRIPTION_MAX = 400;
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

const skillsDir = path.join(ROOT, 'skills');
const skillNames = fs.readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (skillNames.length === 0) err('skills/', 'no skills found');

for (const name of skillNames) {
  const rel = `skills/${name}/SKILL.md`;
  if (!exists(rel)) { err(rel, 'missing SKILL.md'); continue; }
  const content = read(rel);
  const fm = parseFrontmatter(content);
  if (!fm) { err(rel, 'missing or unterminated frontmatter'); continue; }
  const { data, body } = fm;

  if (!NAME_RE.test(name)) err(rel, `directory name "${name}" must be lowercase words joined by single hyphens`);
  if (data.name !== name) err(rel, `frontmatter name "${data.name}" must equal the directory name "${name}"`);
  if (!data.description) err(rel, 'missing description');
  else {
    if (!/^Use when\b/.test(data.description)) err(rel, 'description must start with "Use when"');
    if (data.description.length > DESCRIPTION_MAX) err(rel, `description is ${data.description.length} chars, limit ${DESCRIPTION_MAX}`);
    if (WORKFLOW_WORDS.test(data.description)) warn(rel, 'description looks like a workflow summary; keep it to triggering conditions');
    if (/\b(I|me|my)\b/.test(data.description)) err(rel, 'description must be in the third person');
  }
  // Claude Code honours these two; other harnesses ignore them, which is harmless.
  const extra = Object.keys(data).filter((k) => !['name', 'description', 'disable-model-invocation', 'allowed-tools'].includes(k));
  if (extra.length) warn(rel, `frontmatter fields beyond name/description are not honoured on every harness: ${extra.join(', ')}`);

  if (!/^# /m.test(body)) err(rel, 'body needs an H1 title');
  let lastIdx = -1;
  for (const section of REQUIRED_SECTIONS) {
    const re = new RegExp(`^## .*${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
    const m = body.match(re);
    if (!m) { err(rel, `missing section "## ${section}"`); continue; }
    if (m.index < lastIdx) err(rel, `section "## ${section}" is out of order`);
    lastIdx = m.index;
  }
  if (!/No exceptions\. No workarounds\. No shortcuts\./.test(body)) warn(rel, 'missing the GodMode line under the Prime Directive');

  const lines = content.split('\n').length;
  if (lines > 350) err(rel, `${lines} lines; move reference material into references/ (limit 350)`);
  if (lines < 60) warn(rel, `${lines} lines; is this skill complete?`);

  // Cross-references.
  for (const m of body.matchAll(/godmode:([a-z0-9-]+)/g)) {
    if (!skillNames.includes(m[1])) err(rel, `cross-reference godmode:${m[1]} does not resolve to a skill`);
  }

  // Tool coupling (references/ may name tools; bodies may not).
  const coupled = new Set();
  for (const m of body.matchAll(TOOL_RE)) coupled.add(m[1]);
  for (const m of body.matchAll(TOOL_PHRASE_RE)) coupled.add(m[0]);
  if (coupled.size) err(rel, `names harness tools in the body (move to using-godmode/references): ${[...coupled].join(', ')}`);

  // Supporting files referenced must exist.
  for (const m of body.matchAll(/\]\(((?:\.\/)?(?:references|scripts|templates)\/[^)#]+)\)/g)) {
    if (!exists(`skills/${name}/${m[1]}`)) err(rel, `links to missing file ${m[1]}`);
  }
}

// The bootstrap is injected whole by the SessionStart hook; Claude Code caps
// additionalContext at 10,000 characters and replaces anything longer with a
// file path, which the model is not told to read. Keep headroom for the wrapper.
if (exists('skills/using-godmode/SKILL.md')) {
  const n = read('skills/using-godmode/SKILL.md').length;
  if (n > 9000) err('skills/using-godmode/SKILL.md', `${n} characters; the SessionStart bootstrap is capped at 10,000 including the wrapper (limit 9,000)`);
} else err('skills/using-godmode/SKILL.md', 'missing: the bootstrap skill');

// Descriptions are quoted so YAML never misreads a colon (Antigravity < 1.3.6 dropped such skills).
for (const name of skillNames) {
  const rel = `skills/${name}/SKILL.md`;
  if (!exists(rel)) continue;
  const m = read(rel).match(/^description:\s*(.*)$/m);
  if (m && !/^(["']).*\1\s*$/.test(m[1])) err(rel, 'description must be wrapped in double quotes');
}

// Antigravity rules need a valid trigger or they are silently discarded.
if (exists('rules')) {
  for (const f of fs.readdirSync(path.join(ROOT, 'rules')).filter((f) => f.endsWith('.md'))) {
    const fm = parseFrontmatter(read(`rules/${f}`));
    if (!fm || !['always_on', 'model_decision', 'glob', 'manual'].includes(fm.data.trigger)) err(`rules/${f}`, 'needs frontmatter with trigger: always_on | model_decision | glob | manual');
  }
}

// Duplicate names are impossible with directories, but check case-insensitive clashes.
const lower = skillNames.map((s) => s.toLowerCase());
if (new Set(lower).size !== lower.length) err('skills/', 'skill names clash when case is ignored');

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function gitMode(rel) {
  try {
    const out = execSync(`git ls-files -s -- "${rel}"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    return out ? out.split(/\s+/)[0] : null;
  } catch { return null; }
}

for (const rel of ['hooks/run-hook.cmd', 'hooks/session-start', 'hooks/prompt-nudge', 'hooks/doctor']) {
  if (!exists(rel)) { err(rel, 'missing'); continue; }
  const mode = gitMode(rel);
  if (mode === null) warn(rel, 'not tracked by git yet (exec bit cannot be checked)');
  else if (mode !== '100755') err(rel, `git mode ${mode}; must be 100755 (git update-index --chmod=+x ${rel})`);
  if (read(rel).includes('\r\n')) err(rel, 'has CRLF line endings; bash and cmd both need LF here');
}

if (exists('hooks/hooks.json')) {
  const raw = read('hooks/hooks.json');
  if (raw.includes("'${CLAUDE_PLUGIN_ROOT}")) err('hooks/hooks.json', 'single-quoted ${CLAUDE_PLUGIN_ROOT} is never expanded (issues #1, #2, #4); use \\"${CLAUDE_PLUGIN_ROOT}/...\\"');
  const hooks = JSON.parse(raw);
  const session = hooks.hooks?.SessionStart;
  if (!Array.isArray(session) || !session.length) err('hooks/hooks.json', 'no SessionStart hook');
  for (const [event, groups] of Object.entries(hooks.hooks ?? {})) for (const group of groups) for (const h of group.hooks ?? []) {
    if (!h.command?.includes('"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd"')) err('hooks/hooks.json', `${event}: command does not run the quoted wrapper: ${h.command}`);
  }
} else err('hooks/hooks.json', 'missing');

// ---------------------------------------------------------------------------
// Manifests and versions
// ---------------------------------------------------------------------------

const MANIFESTS = [
  ['package.json', (j) => j.version],
  ['.claude-plugin/plugin.json', (j) => j.version],
  ['.claude-plugin/marketplace.json', (j) => j.plugins?.[0]?.version],
  ['.antigravity-plugin/plugin.json', (j) => j.version],
  ['.codex-plugin/plugin.json', (j) => j.version],
  ['.cursor-plugin/plugin.json', (j) => j.version],
  ['.cursor-plugin/marketplace.json', (j) => j.plugins?.[0]?.version],
  ['gemini-extension.json', (j) => j.version],
];
const versions = new Map();
for (const [rel, get] of MANIFESTS) {
  if (!exists(rel)) { err(rel, 'missing manifest'); continue; }
  let v;
  try { v = get(json(rel)); } catch (e) { err(rel, `invalid JSON: ${e.message}`); continue; }
  if (!v) err(rel, 'no version field');
  versions.set(rel, v);
}
const distinct = new Set([...versions.values()].filter(Boolean));
if (distinct.size > 1) err('versions', `manifests disagree: ${[...versions].map(([k, v]) => `${k}=${v}`).join(', ')}`);
if (exists('.version-bump.json')) {
  const listed = new Set(json('.version-bump.json').files.map((f) => f.path));
  for (const [rel] of MANIFESTS) if (!listed.has(rel)) err('.version-bump.json', `does not list ${rel}`);
} else err('.version-bump.json', 'missing');

for (const rel of ['.claude-plugin/plugin.json', '.antigravity-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json']) {
  if (!exists(rel)) continue;
  const j = json(rel);
  if (j.name !== 'godmode') err(rel, `name must be "godmode", got "${j.name}"`);
  if (!j.description) err(rel, 'missing description');
}
if (exists('.antigravity-plugin/plugin.json')) {
  const j = json('.antigravity-plugin/plugin.json');
  if ((j.description ?? '').length > 160) err('.antigravity-plugin/plugin.json', 'description over 160 characters');
  if (!j.logo || !exists(j.logo)) err('.antigravity-plugin/plugin.json', `logo missing: ${j.logo}`);
  if (!Array.isArray(j.suggestedPrompts) || !j.suggestedPrompts.length) err('.antigravity-plugin/plugin.json', 'suggestedPrompts required');
}

// Icon: square PNG, 512-2048 px.
function pngSize(rel) {
  const buf = fs.readFileSync(path.join(ROOT, rel));
  if (buf.toString('ascii', 1, 4) !== 'PNG') return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
if (exists('assets/icon.png')) {
  const s = pngSize('assets/icon.png');
  if (!s) err('assets/icon.png', 'not a PNG');
  else if (s.w !== s.h || s.w < 512 || s.w > 2048) err('assets/icon.png', `must be square and 512-2048 px, got ${s.w}x${s.h}`);
} else err('assets/icon.png', 'missing (Claude plugin directory and Antigravity marketplace need it)');

// ---------------------------------------------------------------------------
// README
// ---------------------------------------------------------------------------

if (exists('README.md')) {
  const readme = read('README.md');
  for (const name of skillNames) {
    if (!readme.includes(`\`${name}\``)) err('README.md', `does not mention skill \`${name}\``);
  }
  const counts = [...readme.matchAll(/\b(\d{2})\s+skills\b/gi)].map((m) => Number(m[1]));
  for (const c of counts) if (c !== skillNames.length) err('README.md', `says "${c} skills" but skills/ has ${skillNames.length}`);
  if (!readme.includes('/plugin install godmode --marketplace NoobyGains/godmode')) err('README.md', 'missing the one-step Claude Code install line');
} else err('README.md', 'missing');

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const c = (code, s) => (ci ? s : `\x1b[${code}m${s}\x1b[0m`);
if (!quiet) {
  for (const w of warnings) console.log(c(33, 'warn ') + w);
  for (const e of errors) console.log(c(31, 'error ') + e);
}
console.log(`${skillNames.length} skills, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
