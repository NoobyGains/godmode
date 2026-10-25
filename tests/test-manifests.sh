#!/usr/bin/env bash
# Manifest tests: every harness manifest exists, parses, shares one version,
# and the harness validators that are installed on this machine pass.
#
#   bash tests/test-manifests.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
fails=0
pass() { printf '  [PASS] %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; fails=$((fails + 1)); }

echo "repository validator"
if node scripts/validate.js --ci --quiet; then pass "node scripts/validate.js"; else fail "node scripts/validate.js (run it for details)"; fi

echo "manifests parse"
for f in package.json .claude-plugin/plugin.json .claude-plugin/marketplace.json .antigravity-plugin/plugin.json .codex-plugin/plugin.json .agents/plugins/marketplace.json .cursor-plugin/plugin.json hooks/hooks-cursor.json scripts/version-files.json; do
  if [ -f "$f" ] && node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null; then pass "$f"; else fail "$f missing or invalid"; fi
done

echo "harness validators present on this machine"
if command -v claude >/dev/null 2>&1; then
  if claude plugin validate . >/tmp/godmode-claude-validate.txt 2>&1 && ! grep -q "ICON_MISSING" /tmp/godmode-claude-validate.txt; then pass "claude plugin validate ."; else fail "claude plugin validate . (see /tmp/godmode-claude-validate.txt)"; fi
else echo "  [SKIP] claude not installed"; fi
if command -v agy >/dev/null 2>&1; then
  # Not --strict: a multi-harness repo always carries files agy does not load
  # (root AGENTS.md for contributors, hooks/hooks.json
  # for Claude Code) and agy warns about each. Errors must be zero.
  if agy plugin validate . >/tmp/godmode-agy-validate.txt 2>&1; then pass "agy plugin validate . (warnings about Claude Code files are expected)"; else fail "agy plugin validate . (see /tmp/godmode-agy-validate.txt)"; fi
else echo "  [SKIP] agy not installed"; fi

echo
if [ $fails -eq 0 ]; then echo "manifests: all tests passed"; else echo "manifests: $fails failure(s)"; exit 1; fi
