#!/usr/bin/env bash
# Hook tests: run the SessionStart hook the way each harness runs it and
# check that valid JSON with the bootstrap comes back.
#
#   bash tests/test-hooks.sh
#
# Needs bash and python3 (for JSON parsing). Runs on Linux, macOS and
# Windows Git Bash; CI runs it on all three.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PY="${PYTHON:-python3}"
command -v "$PY" >/dev/null 2>&1 || PY=python
fails=0
pass() { printf '  [PASS] %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; fails=$((fails + 1)); }

check_json() {   # $1 label, $2 json text, $3 python expression that must be truthy
  if printf '%s' "$2" | "$PY" -c "import json,sys; d=json.load(sys.stdin); sys.exit(0 if ($3) else 1)" 2>/dev/null; then
    pass "$1"
  else
    fail "$1"
    printf '%s\n' "$2" | head -c 400; echo
  fi
}

echo "hooks.json"
if grep -q "'\${CLAUDE_PLUGIN_ROOT}" "$ROOT/hooks/hooks.json"; then fail "plugin root is single-quoted (never expands)"; else pass "plugin root is double-quoted"; fi
if "$PY" -c "import json; json.load(open('$ROOT/hooks/hooks.json'))" 2>/dev/null; then pass "valid JSON"; else fail "hooks.json is not valid JSON"; fi

echo "executable bits (git index)"
for f in hooks/run-hook.cmd hooks/session-start; do
  mode="$(cd "$ROOT" && git ls-files -s -- "$f" 2>/dev/null | awk '{print $1}')"
  if [ "$mode" = "100755" ]; then pass "$f is 100755"; elif [ -z "$mode" ]; then fail "$f is not tracked"; else fail "$f is $mode"; fi
done

echo "line endings"
for f in hooks/run-hook.cmd hooks/session-start; do
  if grep -q $'\r' "$ROOT/$f"; then fail "$f has CRLF"; else pass "$f is LF"; fi
done

echo "Claude Code shape (sh -c with CLAUDE_PLUGIN_ROOT, as the harness does)"
out="$(CLAUDE_PLUGIN_ROOT="$ROOT" sh -c '"${CLAUDE_PLUGIN_ROOT}/hooks/run-hook.cmd" session-start' 2>&1)"; rc=$?
[ $rc -eq 0 ] && pass "exit 0" || fail "exit $rc"
check_json "hookSpecificOutput.additionalContext present" "$out" "'EXTREMELY_IMPORTANT' in d['hookSpecificOutput']['additionalContext'] and d['hookSpecificOutput']['hookEventName']=='SessionStart'"
check_json "only the Claude shape is emitted" "$out" "set(d)=={'hookSpecificOutput'}"
check_json "bootstrap carries the using-godmode skill" "$out" "'godmode:using-godmode' in d['hookSpecificOutput']['additionalContext'] and len(d['hookSpecificOutput']['additionalContext'])>2000"

echo "Cursor shape (CURSOR_PLUGIN_ROOT)"
out="$(CURSOR_PLUGIN_ROOT="$ROOT" CLAUDE_PLUGIN_ROOT="$ROOT" bash "$ROOT/hooks/session-start" 2>&1)"
check_json "additional_context only" "$out" "set(d)=={'additional_context'} and 'You have GodMode' in d['additional_context']"

echo "SDK shape (Copilot CLI and others)"
out="$(COPILOT_CLI=1 CLAUDE_PLUGIN_ROOT="$ROOT" bash "$ROOT/hooks/session-start" 2>&1)"
check_json "additionalContext only" "$out" "set(d)=={'additionalContext'}"

echo "empty PATH (startup hooks can run before PATH is repaired)"
out="$(env -i CLAUDE_PLUGIN_ROOT="$ROOT" PATH= "$BASH" "$ROOT/hooks/run-hook.cmd" session-start 2>&1)"
check_json "still valid JSON with no PATH" "$out" "'hookSpecificOutput' in d"

echo
if [ $fails -eq 0 ]; then echo "hooks: all tests passed"; else echo "hooks: $fails failure(s)"; exit 1; fi
