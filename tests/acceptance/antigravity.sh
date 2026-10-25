#!/usr/bin/env bash
# Acceptance test on the Antigravity CLI (agy): install this directory as a
# plugin, run one headless prompt, and check that the bootstrap and a design
# skill were loaded before any code. Uninstalls the plugin afterwards unless
# KEEP=1.
#
#   bash tests/acceptance/antigravity.sh
#   MODEL=gemini-3.8-flash-medium PROMPT="add a settings page" bash tests/acceptance/antigravity.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DEFAULT_PROMPT=$'Let\'s make a react todo list'
PROMPT="${PROMPT:-$DEFAULT_PROMPT}"
MODEL="${MODEL:-gemini-3.8-flash-medium}"
OUT_DIR="$ROOT/docs/verification"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y-%m-%d-%H%M%S)"
OUT="$OUT_DIR/antigravity-$STAMP.json"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "validate:" && agy plugin validate "$ROOT" || { echo "validation failed"; exit 1; }
echo "install:" && agy plugin install "$ROOT" || { echo "install failed"; exit 1; }
agy plugin list | grep -i -A2 "godmode"

cd "$WORK"
echo "prompt: $PROMPT (model $MODEL)"
agy -p "$PROMPT" --model "$MODEL" --output-format json --print-timeout 5m --add-dir "$WORK" > "$OUT" 2> "$OUT_DIR/antigravity-$STAMP.stderr.log"
rc=$?
echo "exit: $rc; output: $OUT"

PY="${PYTHON:-python3}"; command -v "$PY" >/dev/null 2>&1 || PY=python
"$PY" - "$OUT" "$WORK" <<'EOF'
import json, os, sys
path, work = sys.argv[1], sys.argv[2]
raw = open(path, encoding="utf-8", errors="replace").read()
try:
    data = json.loads(raw)
    text = json.dumps(data)
except ValueError:
    text = raw
low = text.lower()
hits = [w for w in ("using-godmode", "intent-discovery", "rationale", "godmode") if w in low]
created = [f for f in os.listdir(work)] if os.path.isdir(work) else []
print("bootstrap/design words in output:", hits or "none")
print("files created in the work dir:", created or "none")
code_files = [f for f in created if f.endswith((".js", ".ts", ".tsx", ".jsx", ".py", ".html", ".css"))]
if ("intent-discovery" in low or "rationale" in low) and not code_files:
    print("PASS: a design skill is referenced and no code file was created"); sys.exit(0)
print("FAIL or INCONCLUSIVE: inspect", path); sys.exit(1)
EOF
result=$?
if [ "${KEEP:-0}" != "1" ]; then echo "uninstall:" && agy plugin uninstall godmode; fi
exit $result
