---
name: doctor
description: "Use when GodMode skills do not seem to trigger, when the user asks whether GodMode is installed or working, or after installing or updating the plugin on any harness"
disable-model-invocation: true
---

# Doctor

Checks the GodMode installation from inside the running harness and reports what it finds. **The bootstrap that makes skills trigger is injected at session start; when it is missing, every other skill is inert, so this check comes first.**

## The Prime Directive

```
DIAGNOSE THE INSTALL BEFORE BLAMING THE SKILLS
```

No exceptions. No workarounds. No shortcuts.

## When to Use

**Required:**
- The user asks "is GodMode working?", "why didn't GodMode activate?", or runs the doctor command
- Right after installing or updating GodMode on a new harness or machine
- Skills that should have fired (design before code, verification before "done") did not

**Skip:**
- Everything else; this skill only inspects the install

## The Protocol

1. **Locate the install root.** It is the directory that contains the `skills/` folder holding this file. Do not guess a path from memory; derive it from where this skill was loaded.
2. **Run the doctor script** with the shell: `<install-root>/hooks/run-hook.cmd doctor`. On Windows without Git Bash the wrapper exits silently with no output; say so and point the user at installing Git for Windows.
3. **Read every line of the output.** `ok` lines pass, `FAIL` lines are the problem, `info` lines describe the environment (harness, platform, version).
4. **Report** the harness and version detected, each failure with the fix the script printed, and whether a fresh session is needed (the bootstrap only injects at session start).
5. If the script itself cannot run, report the exact error and the install root you derived. Do not claim the install is healthy without the script's output.

## What the script checks

| Check | Why it matters |
|---|---|
| `skills/using-godmode/SKILL.md` readable | The session-start hook injects this file; without it nothing triggers |
| Skill count above 20 | A partial install or a wrong root |
| Hook scripts executable and LF-terminated | GodMode 1.0 shipped without the executable bit, so the hook never ran (issues #1, #2, #4) |
| `hooks.json` quotes the plugin root | Single quotes stop the variable from expanding |
| `session-start` prints the Claude Code JSON shape | The hook's output is what the harness reads |

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "Skills exist on disk, so GodMode is installed" | Files on disk do nothing until the bootstrap reaches the model |
| "The hook probably ran" | Run the script; its output is the only evidence |
| "I remember the install path" | Paths differ per harness and version folder; derive it from this file |
| "It worked last session" | Plugin updates change the install folder; recheck after every update |
| "No output means no problem" | No output means the wrapper could not find bash; that is a failure to report |

## Guardrails

**Never:**
- Declare the install healthy without the script's output in this session
- Edit the user's harness settings to "fix" things; report and let the user decide
- Guess a harness from the prompt text; read the `info harness` line

**Always:**
- Run the script from the derived install root
- Quote failures verbatim with the printed fix
- Say whether a new session is needed

## Connections

- `godmode:using-godmode`: the bootstrap this skill verifies is present
- `godmode:environment-awareness`: when the failure is a shell or platform problem rather than an install problem
