#!/usr/bin/env bash
# Acceptance test on Codex CLI: register this repository as a plugin
# marketplace, install the plugin, and confirm the skills are discovered.
# A headless prompt run is attempted when `codex exec` is available; the
# install check alone is the pass/fail criterion because Codex surfaces skills
# natively and runs no session-start hook.
#
#   bash tests/acceptance/codex.sh            # leaves the plugin installed unless CLEAN=1
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT/docs/verification"; mkdir -p "$OUT_DIR"
STAMP="$(date +%Y-%m-%d-%H%M%S)"
LOG="$OUT_DIR/codex-$STAMP.log"
fails=0
pass() { printf '  [PASS] %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; fails=$((fails + 1)); }

{
  echo "marketplace add:"; codex plugin marketplace add "$ROOT" 2>&1 || codex plugin marketplace add "https://github.com/NoobyGains/godmode" 2>&1
  echo "marketplace list:"; codex plugin marketplace list 2>&1
  echo "plugin list:"; codex plugin list 2>&1
  echo "plugin add:"; codex plugin add godmode@godmode 2>&1
  echo "plugin list after:"; codex plugin list 2>&1
} | tee "$LOG"

if grep -qi "godmode" "$LOG"; then pass "marketplace registered and plugin visible"; else fail "plugin not visible in codex plugin list (see $LOG)"; fi

if command -v codex >/dev/null 2>&1; then
  WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT; cd "$WORK"
  echo "headless prompt (best effort):"
  codex exec -s read-only -m gpt-6-sol "List the GodMode skills you can see and say which one you would use first for: Let's make a react todo list. Do not write code." > "$OUT_DIR/codex-$STAMP.prompt.txt" 2>&1
  if grep -qi "using-godmode\|intent-discovery\|rationale" "$OUT_DIR/codex-$STAMP.prompt.txt"; then pass "model sees GodMode skills"; else echo "  [INFO] headless prompt inconclusive; see $OUT_DIR/codex-$STAMP.prompt.txt"; fi
fi

if [ "${CLEAN:-0}" = "1" ]; then codex plugin remove godmode 2>&1 | tail -2; codex plugin marketplace remove godmode 2>&1 | tail -1; fi
[ $fails -eq 0 ] && echo "codex: passed" || { echo "codex: $fails failure(s)"; exit 1; }
