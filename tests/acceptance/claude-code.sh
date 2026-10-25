#!/usr/bin/env bash
# Acceptance test on Claude Code: load the plugin from this directory for one
# headless session and check that a design skill fires before any code.
#
#   bash tests/acceptance/claude-code.sh            # default prompt and model
#   MODEL=sonnet PROMPT="add a settings page" bash tests/acceptance/claude-code.sh
#
# Costs one short model session on your own credentials. Writes the raw
# stream-json transcript to docs/verification/claude-code-<date>.jsonl.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROMPT="${PROMPT:-Let's make a react todo list}"
MODEL="${MODEL:-sonnet}"
MAX_TURNS="${MAX_TURNS:-6}"
OUT_DIR="$ROOT/docs/verification"
mkdir -p "$OUT_DIR"
STAMP="$(date +%Y-%m-%d-%H%M%S)"
TRANSCRIPT="$OUT_DIR/claude-code-$STAMP.jsonl"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK" && git init -q . 2>/dev/null

echo "plugin dir: $ROOT"
echo "work dir:   $WORK"
echo "prompt:     $PROMPT"
claude -p "$PROMPT" \
  --plugin-dir "$ROOT" \
  --model "$MODEL" \
  --max-turns "$MAX_TURNS" \
  --permission-mode plan \
  --output-format stream-json --verbose \
  > "$TRANSCRIPT" 2> "$OUT_DIR/claude-code-$STAMP.stderr.log"
rc=$?
echo "exit: $rc; transcript: $TRANSCRIPT"

PY="${PYTHON:-python3}"; command -v "$PY" >/dev/null 2>&1 || PY=python
"$PY" - "$TRANSCRIPT" <<'EOF'
import json, sys
path = sys.argv[1]
skills, writes, texts = [], [], []
for line in open(path, encoding="utf-8", errors="replace"):
    line = line.strip()
    if not line:
        continue
    try:
        ev = json.loads(line)
    except ValueError:
        continue
    msg = ev.get("message") or {}
    for block in msg.get("content") or []:
        if not isinstance(block, dict):
            continue
        if block.get("type") == "tool_use":
            name = block.get("name", "")
            inp = block.get("input") or {}
            if name == "Skill":
                skills.append(inp.get("skill") or inp.get("name") or json.dumps(inp)[:80])
            elif name in ("Write", "Edit", "MultiEdit", "NotebookEdit"):
                writes.append(inp.get("file_path", "?"))
        elif block.get("type") == "text":
            texts.append(block.get("text", ""))
    if ev.get("type") == "system" and ev.get("subtype") == "init":
        print("session init: plugins/skills visible:", len(ev.get("skills", []) or []), "skills,", len(ev.get("plugins", []) or []), "plugins")
print("skills invoked:", skills or "none")
print("files written:", writes or "none")
blob = " ".join(texts).lower()
mentions = [s for s in ("godmode", "rationale", "intent-discovery", "using-godmode") if s in blob]
print("bootstrap words in replies:", mentions or "none")
design_first = any(s.startswith("godmode:") and s.split(":")[1] in ("rationale", "intent-discovery") for s in skills)
if design_first and not writes:
    print("PASS: a design skill fired and no file was written")
    sys.exit(0)
if design_first:
    print("PARTIAL: a design skill fired but files were written first; inspect the transcript")
    sys.exit(1)
print("FAIL: no design skill was invoked")
sys.exit(1)
EOF
