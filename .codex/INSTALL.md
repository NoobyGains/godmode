# Installing GodMode for Codex

Enable godmode skills in Codex via native skill discovery. Just clone and symlink.

## Prerequisites

- Git

## Installation

1. **Clone the godmode repository:**
   ```bash
   git clone https://github.com/NoobyGains/godmode.git ~/.codex/godmode
   ```

2. **Create the skills symlink:**
   ```bash
   mkdir -p ~/.agents/skills
   ln -s ~/.codex/godmode/skills ~/.agents/skills/godmode
   ```

   **Windows (PowerShell):**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
   cmd /c mklink /J "$env:USERPROFILE\.agents\skills\godmode" "$env:USERPROFILE\.codex\godmode\skills"
   ```

3. **Restart Codex** (quit and relaunch the CLI) to discover the skills.

## Migrating from old bootstrap

If you installed godmode before native skill discovery, you need to:

1. **Update the repo:**
   ```bash
   cd ~/.codex/godmode && git pull
   ```

2. **Create the skills symlink** (step 2 above) — this is the new discovery mechanism.

3. **Remove the old bootstrap block** from `~/.codex/AGENTS.md` — any block referencing `godmode-codex bootstrap` is no longer needed.

4. **Restart Codex.**

## Verify

```bash
ls -la ~/.agents/skills/godmode
```

You should see a symlink (or junction on Windows) pointing to your godmode skills directory.

## Updating

```bash
cd ~/.codex/godmode && git pull
```

Skills update instantly through the symlink.

## Uninstalling

```bash
rm ~/.agents/skills/godmode
```

Optionally delete the clone: `rm -rf ~/.codex/godmode`.
