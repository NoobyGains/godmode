# Cross-platform hooks: how GodMode's SessionStart hook runs everywhere

Claude Code, Cursor and Copilot CLI inject GodMode's bootstrap through a session-start hook that runs a shell command and reads JSON from its stdout. The command has to work on macOS, Linux and Windows, including Windows machines where the only `bash` on PATH is the Windows Subsystem for Linux stub.

## The pieces

```
hooks/
├── hooks.json          # Claude Code: SessionStart → run-hook.cmd session-start
├── hooks-cursor.json   # Cursor: sessionStart → run-hook.cmd session-start
├── run-hook.cmd        # polyglot wrapper, valid as a cmd.exe batch file and as a bash script
├── session-start       # the hook itself (bash, no file extension)
└── doctor              # install self-check, run the same way
```

### hooks.json

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd\" session-start",
            "async": false
          }
        ]
      }
    ]
  }
}
```

The plugin root is **double-quoted**. GodMode 1.0 single-quoted it, and single quotes stop every POSIX shell from expanding the variable, so the hook tried to run a file literally named `${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd` and failed on every operating system (issues #1, #2, #4). Double quotes expand the variable and still survive a path with spaces such as `C:\Program Files\...`.

### run-hook.cmd

A polyglot: the first line `: << 'CMDBLOCK'` is a comment-like label to cmd.exe and the start of a heredoc to bash.

- **cmd.exe** runs the batch half: it looks for Git for Windows bash in `C:\Program Files\Git`, `C:\Program Files (x86)\Git` and the per-user `%LOCALAPPDATA%\Programs\Git`, then for a `bash.exe` on PATH while skipping the WSL launchers in `System32`, `Sysnative` and the Store alias in `WindowsApps` (those fail when no Linux distribution is installed). With no bash found it exits 0 silently: the plugin still loads, only the bootstrap is missing, and `hooks/doctor` reports it.
- **bash** skips the heredoc and runs the named script with `${BASH:-bash}`, bash's own path, so it works even when the harness spawns the hook with an empty PATH.

Hook scripts have no `.sh` extension on purpose: Claude Code on Windows prepends `bash` to any command containing `.sh`, which would bypass the wrapper.

### session-start

Reads `skills/using-godmode/SKILL.md` with the bash builtin `$(<file)`, escapes it for JSON with parameter expansion (no `sed`, no `jq`, no `cat` needed), and prints exactly one output shape:

| Harness | Detected by | Output |
|---|---|---|
| Cursor | `CURSOR_PLUGIN_ROOT` set | `{"additional_context": "..."}` |
| Claude Code | `CLAUDE_PLUGIN_ROOT` set, `COPILOT_CLI` unset | `{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "..."}}` |
| Copilot CLI and others | otherwise | `{"additionalContext": "..."}` |

Only one shape is printed because Claude Code reads both of its candidate fields without deduplicating. `printf` is piped through `cat` when `cat` exists so that a harness closing stdout early on Windows produces no "write error" diagnostic.

## Requirements the repository enforces

- `hooks/run-hook.cmd`, `hooks/session-start` and `hooks/doctor` are committed with mode `100755`. Without the executable bit the shell refuses to run them (exit 126) and the hook silently never fires. `scripts/validate.js` and `tests/test-hooks.sh` check the git index.
- All hook files are LF-only (`.gitattributes`: `hooks/* text eol=lf`). A CRLF in the polyglot breaks both halves.

## Testing

```bash
bash tests/test-hooks.sh           # POSIX sh invocation, each output shape, empty PATH
pwsh tests/test-hooks-windows.ps1  # the cmd.exe half, Windows only
```

Or from inside a session: `/godmode:doctor`.
