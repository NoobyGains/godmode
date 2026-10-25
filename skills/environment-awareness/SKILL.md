---
name: environment-awareness
description: "Use when about to run the first shell command in a session or a new project, when installing dependencies, when a command fails with not found or not recognised, when writing platform-specific code or paths, or when entering a container, virtual machine, remote host or CI runner."
---

# Environment Awareness

Most wasted commands in an agent session come from a wrong guess about where the command runs: Unix syntax in PowerShell, npm in a pnpm project, a global Python instead of the project's virtual environment. You find out where you are with a few cheap probes and then write every command for that place. **Probe once, then act on what you saw, not on what is typical.**

## The Prime Directive

```
NO SHELL COMMAND UNTIL YOU KNOW THE OS, THE SHELL AND THE PACKAGE MANAGER
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- The first command of a session, and the first command after switching project, repository, container, VM or remote host.
- Before installing, upgrading or removing any dependency.
- When a command fails with "command not found", "is not recognized", exit code 127, or a path that does not exist.
- When writing code or scripts that touch paths, processes, line endings, permissions or the network.
- When giving the user a command to paste: it must fit the user's terminal, which may differ from yours.

**Skip:**
- You already probed this environment in this session and nothing has changed since (no new install, no new shell, no new directory tree).
- Pure reading and editing of files with no command execution.

## The Protocol

1. **Read what the harness already tells you.** Many harnesses state the platform, shell and working directory in the session context. Treat that as the first probe result, not as a guess, and note it. If it names two shells (for example a primary PowerShell and a POSIX shell for scripts), record which one each command will run in.

2. **Confirm the OS and shell with one probe** in the shell you will actually use. Pick the probe for that shell from [references/platform-commands.md](references/platform-commands.md). The evidence is the probe output, for example `MINGW64_NT-10.0` from `uname -s` (Git Bash on Windows) or a `PSVersion` of 7.x.

3. **Detect the package manager from the lockfile, never from habit.** List the project root and match lockfiles to managers with the table below. If two lockfiles disagree, stop and ask the user which one is authoritative; do not pick one.

4. **Detect pinned runtimes and active environments.** Look for version pins (`.nvmrc`, `.node-version`, `.python-version`, `.tool-versions`, `rust-toolchain.toml`, the `engines` or `packageManager` field in `package.json`, `requires-python` in `pyproject.toml`) and for a present or active virtual environment (a `.venv/` directory, the `VIRTUAL_ENV` or `CONDA_DEFAULT_ENV` variables). Probe a runtime's version only when you are about to use it.

5. **Check for a container or remote context** only when the project hints at one (a `Dockerfile`, a `.devcontainer/`, CI configuration) or when behaviour is unexpected. Probes are in the reference file.

6. **Write down the result in one line** and use it for every later command in the session:

   ```
   Env: Windows 11, Git Bash (MINGW64) for commands, user terminal PowerShell 7, pnpm (pnpm-lock.yaml), Node 24 (.nvmrc), Python via .venv
   ```

7. **Re-probe on change.** A new install, a new shell, moving into a different repository, or an unexplained failure invalidates the line. Probe again rather than patching commands by trial and error.

## Lockfiles and Managers

<!-- Verified 2026-10-25: bun.lock is the text default since Bun 1.2 (https://bun.sh/docs/install/lockfile); uv.lock and .venv (https://docs.astral.sh/uv/guides/projects/). -->

| File in project root | Use | Never |
|---|---|---|
| `bun.lock` (or legacy `bun.lockb`) | `bun` | npm, which ignores the lockfile and writes its own |
| `pnpm-lock.yaml` | `pnpm` | npm or yarn |
| `yarn.lock` | `yarn` | npm |
| `package-lock.json` | `npm` | another manager |
| `uv.lock` | `uv` (`uv sync`, `uv run`) | bare `pip install` into the venv |
| `poetry.lock` | `poetry` | pip |
| `Pipfile.lock` | `pipenv` | pip |
| `requirements*.txt` only | `pip` inside the project venv | the system interpreter |
| `go.sum` | `go` modules | |
| `Cargo.lock` | `cargo` | |
| `Gemfile.lock` | `bundle` | `gem install` for project dependencies |
| `composer.lock` | `composer` | |

No lockfile: read the `packageManager` field of `package.json`, then the README and CI configuration, then ask. Default to npm only for a brand-new project where the user has stated no preference.

<!-- Corepack is not distributed with Node.js from v25 (https://nodejs.org/dist/latest/docs/api/corepack.html). -->
The `packageManager` field pins a manager version through Corepack. Corepack is no longer bundled with Node.js 25 and later, so on those versions run `corepack --version` before relying on it; the user may need to install it or the manager directly.

## Windows Specifics

Windows is where guessing fails most often. Check these five facts every time.

1. **Three shells, three syntaxes.** cmd, PowerShell (Windows PowerShell 5.1 and PowerShell 7) and Git Bash (an MSYS2 bash) can all exist on one machine. Quoting, variables, redirection and chaining differ; the mapping table in the reference file shows how. PowerShell gained `&&` and `||` only in version 7, so a chained command that works in `pwsh` fails in Windows PowerShell 5.1.
   <!-- https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipeline_chain_operators -->

2. **The `bash` on PATH may be the WSL launcher.** Windows can carry a `bash.exe` that starts WSL (in `C:\Windows\System32` or under `WindowsApps`), and it can resolve before Git Bash. Calling it enters a different Linux environment without the user's tools, keys or files, or fails silently. Check which binary resolves with `where.exe bash`; call Git Bash by its full path (normally `C:\Program Files\Git\bin\bash.exe`); never start WSL unless the user asked for it.
   <!-- https://claudeissues.com/issue/23556-bug-windows-hook-sh-auto-detection-resolves-to-wsl-bash-exe-instead-of-git-bash ; https://github.com/gitpython-developers/GitPython/pull/2201 -->

3. **Paths have three forms.** `C:\Users\me` (Windows), `C:/Users/me` (mixed, accepted by most Windows programs and by Node, Python and Git) and `/c/Users/me` (Git Bash). Convert inside Git Bash with `cygpath -w`, `cygpath -m` or `cygpath -u`. Quote every path, because `Program Files` contains a space. In files you write for others, use forward slashes or the language's path API instead of hand-built backslashes.
   <!-- https://www.msys2.org/docs/filesystem-paths/ -->

4. **Git Bash rewrites arguments that start with `/`.** Passing `/opt/x`, or a flag such as `-L/regex/`, to a native Windows program turns it into a Windows path. Prefix the command with `MSYS_NO_PATHCONV=1`, or double the leading slash, when you need the literal text.
   <!-- https://github.com/git-for-windows/build-extra/blob/main/ReleaseNotes.md (Known issues) -->

5. **`python` and `python3` may be Store aliases.** On Windows these names can be app execution aliases that open the Microsoft Store instead of running Python. Use the `py` launcher or the project venv's `Scripts\python.exe`, and confirm with `--version` that a real interpreter answers.
   <!-- https://docs.python.org/3/using/windows.html -->

Also: virtual environments keep executables in `Scripts\` on Windows and `bin/` elsewhere; PowerShell may refuse to run `Activate.ps1` until the user allows local scripts; and activation is rarely needed, because calling the venv's interpreter by path is enough. `VIRTUAL_ENV` is set only by activation, so its absence does not prove there is no venv.
<!-- https://docs.python.org/3/library/venv.html -->

## When to Probe and When to Assume

| Fact | Action | Why |
|---|---|---|
| OS | Probe once per environment | Changes every command's syntax |
| Shell | Probe once per shell you use | Quoting, chaining and redirection differ |
| Package manager | Read the lockfile in every new project | The wrong manager rewrites or corrupts the lockfile |
| Runtime version | Probe on first use | Only matters when that runtime runs |
| Virtual environment | Check before any install or run | Installs land in the wrong interpreter otherwise |
| Container or remote | Probe when hinted or when behaviour is odd | Containers lack host tools and paths |
| Installed tools (databases, cloud CLIs, container tools) | Probe only the tools the task needs | A static site needs no database probe |

Inventory probes print versions and must not turn missing tools into red failures: send errors to the null device and end the chain with a command that succeeds (examples in the reference file). A missing tool is information, not an error. Report the inventory compactly:

```
Available: PostgreSQL 17, Docker 28, gh 2.80
Not found: Redis, AWS CLI
```

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It's probably Linux." | You have no evidence. The session context or one `uname -s` settles it in a second. |
| "The user said Windows, so PowerShell." | Windows has cmd, two PowerShells, Git Bash and WSL. Confirm the shell, not just the OS. |
| "npm is the default." | npm in a pnpm, yarn or bun project writes a second lockfile and breaks CI installs. |
| "I'll fix it if the command fails." | A destructive command with the wrong path syntax can succeed on the wrong target. Failed installs leave half-written state. |
| "`bash` is bash." | On Windows a bare `bash` can start WSL, in effect a different machine. Check which binary resolves. |
| "The venv is probably active." | Activation is optional and invisible to a fresh shell. Call the venv's interpreter by path, or check first. |
| "CI runs the same as my machine." | Runners differ in OS, shell, tool versions and file-system case sensitivity. Read the CI configuration. |
| "I probed an hour ago." | A new install, shell or directory makes the old result stale. Re-probe after any change. |

## Guardrails

**Never:**
- Run an install command before reading the project's lockfiles.
- Call a bare `bash` on Windows, or start WSL, without the user asking for it.
- Hand the user a command written for your shell when their terminal is a different one.
- Install into the system interpreter when the project has a virtual environment.
- Build Windows paths by string concatenation in code; use the language's path API.
- Assume GNU flags for `sed`, `grep` or `date` on macOS; check, or use portable forms.

**Always:**
- Record the one-line environment summary and reuse it.
- Quote paths, and use forward slashes in files meant for several platforms.
- Use the manager the lockfile names and the runtime version the pin names.
- Re-probe after an unexplained "not found" before changing the command again.
- Check exact command forms in [references/platform-commands.md](references/platform-commands.md) when crossing shells.

## Connections

- `godmode:project-bootstrap`: a new project needs this probe first, so the scaffold uses tools that exist here.
- `godmode:fault-diagnosis`: an environment mismatch is a common root cause; hand off when the probe does not explain a failure.
- `godmode:workspace-isolation`: worktrees and containers are new environments; probe inside them.
- `godmode:system-design`: the inventory of installed databases, container tools and cloud CLIs feeds hosting decisions.
- `godmode:grounding`: tool flags and versions that the probe does not show are verified against current documentation, not memory.
