# Platform Command Reference

Exact probes and command forms per shell. Load this when you cross from one shell to another or write a command for the user's terminal.

Contents: 1. Identify the shell and OS. 2. Command mappings. 3. Quoting and variables. 4. Containers, WSL and CI. 5. Inventory probes. 6. Sources.

## 1. Identify the shell and OS

| You are in | Probe | Typical answer |
|---|---|---|
| Any POSIX shell (bash, zsh, sh, Git Bash) | `uname -s; echo "$0"` | `Linux`, `Darwin`, `MINGW64_NT-10.0-26100` (Git Bash on Windows) |
| PowerShell 7 or Windows PowerShell | `$PSVersionTable.PSVersion; $IsWindows` | `7.5.x` and `True`; 5.1 prints no `$IsWindows` value |
| cmd | `ver & echo %COMSPEC%` | `Microsoft Windows [Version 10.0.x]` |
| Unsure which shell runs your command | `echo $0 $PSVersionTable` | The part that expands tells you the shell |

Architecture: `uname -m` (POSIX) or `$env:PROCESSOR_ARCHITECTURE` (PowerShell). Which binary a name resolves to: `command -v name` (POSIX), `Get-Command name` (PowerShell), `where.exe name` (any Windows shell, lists every match in PATH order).

## 2. Command mappings

| Task | bash / zsh / Git Bash | PowerShell | cmd |
|---|---|---|---|
| List files, including hidden | `ls -la` | `Get-ChildItem -Force` | `dir /a` |
| Find files by name | `find . -name '*.ts'` | `Get-ChildItem -Recurse -Filter *.ts` | `dir /s /b *.ts` |
| Search text | `grep -rn 'x' .` (or `rg 'x'`) | `Select-String -Path *.ts -Pattern 'x'` | `findstr /s /n "x" *.ts` |
| Show a file | `cat f` | `Get-Content f` | `type f` |
| First / last lines | `head -n 20 f` / `tail -n 20 f` | `Get-Content f -TotalCount 20` / `-Tail 20` | none built in |
| Delete file / tree | `rm f` / `rm -rf d` | `Remove-Item f` / `Remove-Item -Recurse -Force d` | `del f` / `rmdir /s /q d` |
| Make directory with parents | `mkdir -p a/b` | `New-Item -ItemType Directory -Force a/b` | `mkdir a\b` |
| Set variable for this session | `export X=1` | `$env:X = '1'` | `set X=1` |
| Set variable for one command | `X=1 cmd` | `$env:X='1'; cmd` (persists after) | `set "X=1" && cmd` (persists after) |
| Read variable | `"$X"` | `$env:X` | `%X%` |
| Null device | `/dev/null` | `$null` | `NUL` |
| Run next only if previous succeeded | `a && b` | `a && b` (PowerShell 7 only); 5.1: `a; if ($?) { b }` | `a && b` |
| PATH separator | `:` | `;` | `;` |
| Processes | `ps aux` | `Get-Process` | `tasklist` |
| Who listens on a port | `lsof -i :3000` (macOS/Linux) | `Get-NetTCPConnection -LocalPort 3000` | `netstat -ano \| findstr :3000` |
| Exit code of last command | `$?` | `$LASTEXITCODE` (native), `$?` (success flag) | `%ERRORLEVEL%` |

Git Bash on Windows supports the POSIX column, but `lsof` and `/proc` do not exist there; use `netstat -ano` and Windows tools.

## 3. Quoting and variables

- **POSIX:** single quotes are literal; double quotes expand `$VAR` and `$(...)`. Quote every path.
- **PowerShell:** single quotes are literal; double quotes expand `$var` and `$(...)`. The backtick is the escape character. A here-string closes with `'@` at column 0. Native executables receive arguments after PowerShell's own parsing, so arguments containing `@`, `{` or `--%` may need the stop-parsing token `--%`.
- **cmd:** only double quotes group; `%` and `^` are special; `%%` inside batch files.
- **Line endings:** shell scripts run by bash need LF. Enforce with `.gitattributes` (`*.sh text eol=lf`) rather than by editor settings.
- **Case:** Windows and default macOS file systems are case-insensitive; Linux CI is case-sensitive. An import that works locally with the wrong case fails in CI.

## 4. Containers, WSL and CI

| Question | Probe (POSIX shell) |
|---|---|
| Inside Docker? | `test -f /.dockerenv && echo docker` |
| Inside some container? | `grep -qaE 'docker\|containerd\|kubepods' /proc/1/cgroup 2>/dev/null && echo container` |
| Inside a Kubernetes pod? | `test -n "$KUBERNETES_SERVICE_HOST" && echo k8s` |
| Inside WSL? | `grep -qi microsoft /proc/version 2>/dev/null && echo wsl` (WSL also sets `WSL_DISTRO_NAME`) |
| In CI? | `test -n "$CI" && echo ci` (GitHub Actions also sets `GITHUB_ACTIONS=true`) |

Containers and CI runners usually lack the host's tools, credentials and caches. Read the Dockerfile or the CI workflow to learn what is installed rather than probing at random.

## 5. Inventory probes

Probe only the tools the task needs, and make missing tools quiet:

```bash
# POSIX: errors to /dev/null, and `true` keeps the exit code at 0
git --version 2>/dev/null; gh --version 2>/dev/null | head -1; docker --version 2>/dev/null; psql --version 2>/dev/null; true
```

```powershell
# PowerShell: report presence without throwing
foreach ($t in 'git','gh','docker','psql') { $c = Get-Command $t -ErrorAction SilentlyContinue; if ($c) { "$t found: $($c.Source)" } else { "$t not found" } }
```

Common probes by category (each prints a version when present):

| Category | Probes |
|---|---|
| Version control | `git --version`, `gh --version` |
| Containers | `docker --version`, `docker compose version`, `podman --version` |
| Databases | `psql --version`, `mysql --version`, `sqlite3 --version`, `mongosh --version`, `redis-cli --version` |
| Cloud and hosting | `aws --version`, `gcloud --version`, `az --version`, `vercel --version`, `fly version`, `netlify --version` |
| Data and media | `jq --version`, `curl --version`, `ffmpeg -version` |
| Runtimes | `node --version`, `python3 --version` (POSIX) or `py --version` (Windows), `go version`, `rustc --version`, `java --version` |

## 6. Sources

Fetched 2026-10-25.

- PowerShell pipeline chain operators (`&&`, `||` from PowerShell 7): https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_pipeline_chain_operators
- MSYS2 path forms and `cygpath`: https://www.msys2.org/docs/filesystem-paths/
- Git for Windows path conversion and `MSYS_NO_PATHCONV`: https://github.com/git-for-windows/build-extra/blob/main/ReleaseNotes.md
- Python on Windows (`py` launcher, Store aliases): https://docs.python.org/3/using/windows.html
- Python `venv` (activation per shell, `VIRTUAL_ENV`): https://docs.python.org/3/library/venv.html
- WSL `bash.exe` resolving before Git Bash (field reports): https://claudeissues.com/issue/23556-bug-windows-hook-sh-auto-detection-resolves-to-wsl-bash-exe-instead-of-git-bash and https://github.com/gitpython-developers/GitPython/pull/2201
