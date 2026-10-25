# Installing GodMode for OpenCode

OpenCode installs plugins from a git-backed package spec. GodMode's plugin registers every skill and injects the `using-godmode` bootstrap at the start of each top-level session.

## OpenCode V1 (1.x)

Add to `opencode.json`:

```json
{
  "plugin": ["godmode@git+https://github.com/NoobyGains/godmode.git"]
}
```

## OpenCode V2 (2.0.4 or later)

```json
{
  "plugins": ["godmode@git+https://github.com/NoobyGains/godmode.git"]
}
```

Restart OpenCode, then ask: "Tell me about GodMode". A working install names the `using-godmode` skill and the execution modes.

To pin a release, append a tag: `godmode@git+https://github.com/NoobyGains/godmode.git#v2.0.0`.

## Skills without the plugin

OpenCode also reads skills from `~/.agents/skills/` and `.agents/skills/`, so `npx skills add NoobyGains/godmode` installs the skills alone. Without the plugin the bootstrap is not injected: skills only trigger when the model picks them from their descriptions.

## Troubleshooting

- V1 logs: `opencode run --print-logs "hello" 2>&1 | grep -i godmode`
- V2 logs: `opencode run --standalone --print-logs "hello" 2>&1 | grep -i godmode`, or `~/.local/share/opencode/log/opencode.log` filtered for `role=server`.
- Some Windows OpenCode builds cannot install `git+https` specs. Install the package with npm (`npm install godmode@git+https://github.com/NoobyGains/godmode.git --prefix "$HOME\.config\opencode"`) and put the absolute package path in `opencode.json`; OpenCode does not expand `~`.

## Status

The plugin follows the pattern the superpowers project ships for OpenCode V1 and V2 (MIT). GodMode's own copy has been checked for syntax with Node but has not yet been exercised against a live OpenCode install; see the README's harness table for the current test status.
