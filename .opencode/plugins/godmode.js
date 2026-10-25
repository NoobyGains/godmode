/**
 * GodMode plugin for OpenCode.
 *
 * Works on OpenCode V1 and V2 with no dependencies:
 *   V1 (opencode 1.x): the named export `GodModePlugin` adds the skills
 *      directory to the live config and injects the bootstrap into the first
 *      user message through `experimental.chat.messages.transform`.
 *   V2 (opencode 2.0.4+): the default export `{ id, setup }` registers every
 *      skill through `ctx.skill.transform()` and injects the bootstrap through
 *      `ctx.session.hook("context")`.
 *
 * The bootstrap is skills/using-godmode/SKILL.md plus a tool mapping for the
 * running OpenCode flavour. It is injected once per top-level session and
 * never into task-subagent (child) sessions, which have a parentID.
 *
 * The dual-flavour structure follows the plugin obra/superpowers ships (MIT).
 */

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(__dirname, '../../skills');

const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };
  const frontmatter = {};
  let lastKey = null;
  for (const rawLine of match[1].split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && !/^\s/.test(line)) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      frontmatter[key] = /^(>[+-]?|\|[+-]?)$/.test(value) ? '' : value;
      lastKey = key;
    } else if (lastKey !== null && line.trim() !== '') {
      frontmatter[lastKey] = `${frontmatter[lastKey]} ${line.trim()}`.trim();
    }
  }
  for (const key of Object.keys(frontmatter)) {
    frontmatter[key] = frontmatter[key].replace(/^(["'])([\s\S]*)\1$/, '$2');
  }
  return { frontmatter, content: match[2] };
};

// Tool mappings per OpenCode flavour. V1 exposes todowrite, task, skill,
// read, apply_patch, bash, grep, glob, webfetch. V2 (2.0.4+) has no todo
// tool; task became subagent, apply_patch became patch, bash became shell,
// and websearch exists.
export const V1_MAPPING = `**Tool mapping for OpenCode:**
When a skill names an action, use the OpenCode equivalent:
- Create or update tasks → \`todowrite\`
- Dispatch a subagent → \`task\` with \`subagent_type: "general"\` (\`"explore"\` for read-only exploration)
- Invoke a skill → the native \`skill\` tool
- Read files → \`read\`; create, edit or delete files → \`apply_patch\`
- Run shell commands → \`bash\`; search → \`grep\`, \`glob\`; fetch a URL → \`webfetch\`
- Agent teams: not available; use subagents or inline execution.`;

export const V2_MAPPING = `**Tool mapping for OpenCode:**
When a skill names an action, use the OpenCode equivalent:
- Create or update tasks → no todo tool on V2; keep the plan and ledger in a markdown file
- Dispatch a subagent → \`subagent\` with \`agent: "general"\` (\`description\`, \`prompt\`, optional \`background\`; pass \`sessionID\` to continue one)
- Invoke a skill → the native \`skill\` tool
- Read files → \`read\`; change files → \`patch\` with \`patchText\` when available, else \`write\` and \`edit\`
- Run shell commands → \`shell\`; search → \`grep\`, \`glob\`; fetch a URL → \`webfetch\`; search the web → \`websearch\`
- Agent teams: not available; use subagents or inline execution.`;

const _bootstrapCache = new Map();

const getBootstrapContent = (toolMapping) => {
  if (_bootstrapCache.has(toolMapping)) return _bootstrapCache.get(toolMapping);
  const skillPath = path.join(skillsDir, 'using-godmode', 'SKILL.md');
  if (!fs.existsSync(skillPath)) {
    _bootstrapCache.set(toolMapping, null);
    return null;
  }
  const { content } = extractAndStripFrontmatter(fs.readFileSync(skillPath, 'utf8'));
  _bootstrapCache.set(toolMapping, `<EXTREMELY_IMPORTANT>
You have GodMode.

**The using-godmode skill is included below and is already loaded; do not load it again with the skill tool. For every other skill, use the skill tool.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`);
  return _bootstrapCache.get(toolMapping);
};

// Child-session detection: task subagents are created with a parentID; the
// controller bootstrap must not restart design and approval cycles inside them.
const CHILD_SESSION_CACHE_MAX = 512;
const _childSessionCache = new Map();

const _cacheChildSession = (sessionID, isChild) => {
  if (_childSessionCache.size >= CHILD_SESSION_CACHE_MAX) {
    let toDrop = Math.ceil(CHILD_SESSION_CACHE_MAX / 4);
    for (const key of _childSessionCache.keys()) {
      if (toDrop-- <= 0) break;
      _childSessionCache.delete(key);
    }
  }
  _childSessionCache.set(sessionID, isChild);
};

const isChildSession = async (fetchSession, sessionID) => {
  if (!sessionID) return false;
  if (_childSessionCache.has(sessionID)) return _childSessionCache.get(sessionID);
  let isChild = false;
  try {
    const result = await fetchSession(sessionID);
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('no session record');
    if (result.error != null || result.response?.ok === false) throw new Error('session lookup failed');
    const session = 'data' in result ? result.data : result;
    if (!session || typeof session !== 'object' || session.id !== sessionID) throw new Error('invalid session identity');
    if (session.parentID !== undefined && (typeof session.parentID !== 'string' || session.parentID.length === 0)) throw new Error('invalid parent identity');
    isChild = session.parentID !== undefined;
  } catch (err) {
    console.error('[godmode] session lookup failed, treating session as top-level:', err);
    return false;
  }
  _cacheChildSession(sessionID, isChild);
  return isChild;
};

/** V1 plugin function (named export, also default.server). */
export const GodModePlugin = async ({ client }) => {
  return {
    config: async (config) => {
      if (Array.isArray(config.skills)) return; // V2 shape: setup() handles it
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) config.skills.paths.push(skillsDir);
    },
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent(V1_MAPPING);
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((m) => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some((p) => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;
      if (client && await isChildSession((id) => client.session.get({ path: { id } }), firstUser.info.sessionID)) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};

/** V2 setup: register skills natively and inject the bootstrap via the context hook. */
async function setup(ctx) {
  if (!ctx || !ctx.skill || typeof ctx.skill.transform !== 'function' || !ctx.session || typeof ctx.session.hook !== 'function') {
    return; // V1 also calls default.setup with a V1-shaped ctx; the named export serves V1
  }
  try {
    const skills = [];
    if (fs.existsSync(skillsDir)) {
      for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
        const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
        if (!fs.existsSync(skillPath)) continue;
        const { frontmatter, content } = extractAndStripFrontmatter(fs.readFileSync(skillPath, 'utf8'));
        skills.push({
          id: entry.name,
          name: frontmatter.name || entry.name,
          ...(frontmatter.description ? { description: frontmatter.description } : {}),
          path: skillPath,
          content,
        });
      }
    }
    await ctx.skill.transform((draft) => {
      for (const skill of skills) {
        try {
          draft.add(skill);
        } catch (err) {
          console.error(`[godmode] skill "${skill.id}" rejected by host, skipping:`, err);
        }
      }
    });
  } catch (err) {
    console.error('[godmode] skill registration failed:', err);
  }
  try {
    await ctx.session.hook('context', async (event) => {
      try {
        const bootstrap = getBootstrapContent(V2_MAPPING);
        if (!bootstrap || !event.messages || !event.messages.length) return;
        const firstUser = event.messages.find((m) => m.role === 'user');
        if (firstUser && (!firstUser.content || !firstUser.content.length)) return;
        if (firstUser?.content.some((p) => p.type === 'text' && p.text && p.text.includes('EXTREMELY_IMPORTANT'))) return;
        if (typeof ctx.session.get === 'function' && await isChildSession((id) => ctx.session.get({ sessionID: id }), event.sessionID)) return;
        if (firstUser) {
          firstUser.content.unshift({ type: 'text', text: bootstrap });
        } else {
          event.messages.push({ role: 'user', content: [{ type: 'text', text: bootstrap }] });
        }
      } catch (err) {
        console.error('[godmode] context hook failed:', err);
      }
    });
  } catch (err) {
    console.error('[godmode] session hook registration failed:', err);
  }
}

export default {
  id: 'godmode',
  server: GodModePlugin,
  setup,
};
