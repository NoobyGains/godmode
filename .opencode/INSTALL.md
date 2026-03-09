# Installing GodMode for OpenCode

## Prerequisites

- [OpenCode.ai](https://opencode.ai) installed
- Git installed

## Installation Steps

### 1. Clone GodMode

```bash
git clone https://github.com/NoobyGains/godmode.git ~/.config/opencode/godmode
```

### 2. Register the Plugin

Create a symlink so OpenCode discovers the plugin:

```bash
mkdir -p ~/.config/opencode/plugins
rm -f ~/.config/opencode/plugins/godmode.js
ln -s ~/.config/opencode/godmode/.opencode/plugins/godmode.js ~/.config/opencode/plugins/godmode.js
```

### 3. Symlink Skills

Create a symlink so OpenCode's native skill tool discovers godmode skills:

```bash
mkdir -p ~/.config/opencode/skills
rm -rf ~/.config/opencode/skills/godmode
ln -s ~/.config/opencode/godmode/skills ~/.config/opencode/skills/godmode
```

### 4. Restart OpenCode

Restart OpenCode. The plugin will automatically inject godmode context.

Verify by asking: "do you have godmode?"

## Usage

### Finding Skills

Use OpenCode's native `skill` tool to list available skills:

```
use skill tool to list skills
```

### Loading a Skill

Use OpenCode's native `skill` tool to load a specific skill:

```
use skill tool to load godmode/intent-discovery
```

### Personal Skills

Create your own skills in `~/.config/opencode/skills/`:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
```

Create `~/.config/opencode/skills/my-skill/SKILL.md`:

```markdown
---
name: my-skill
description: Use when [condition] - [what it does]
---

# My Skill

[Your skill content here]
```

### Project Skills

Create project-specific skills in `.opencode/skills/` within your project.

**Skill Priority:** Project skills > Personal skills > GodMode skills

## Updating

```bash
cd ~/.config/opencode/godmode
git pull
```

## Troubleshooting

### Plugin not loading

1. Check plugin symlink: `ls -l ~/.config/opencode/plugins/godmode.js`
2. Check source exists: `ls ~/.config/opencode/godmode/.opencode/plugins/godmode.js`
3. Check OpenCode logs for errors

### Skills not found

1. Check skills symlink: `ls -l ~/.config/opencode/skills/godmode`
2. Verify it points to: `~/.config/opencode/godmode/skills`
3. Use `skill` tool to list what's discovered

### Tool mapping

When skills reference Claude Code tools:
- `TodoWrite` → `update_plan`
- `Task` with subagents → `@mention` syntax
- `Skill` tool → OpenCode's native `skill` tool
- File operations → your native tools

## Getting Help

- Report issues: https://github.com/NoobyGains/godmode/issues
- Full documentation: https://github.com/NoobyGains/godmode/blob/main/docs/README.opencode.md
