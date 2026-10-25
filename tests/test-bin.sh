#!/usr/bin/env bash
# Tests for bin/godmode (the plan workspace helper) in a throwaway repository.
#   bash tests/test-bin.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fails=0
pass() { printf '  [PASS] %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; fails=$((fails + 1)); }

mode="$(cd "$ROOT" && git ls-files -s -- bin/godmode 2>/dev/null | awk '{print $1}')"
[ "$mode" = "100755" ] && pass "bin/godmode is 100755 in git" || fail "bin/godmode mode is '${mode:-untracked}'"
grep -q $'\r' "$ROOT/bin/godmode" && fail "bin/godmode has CRLF" || pass "bin/godmode is LF"

T="$(mktemp -d)"; trap 'rm -rf "$T"' EXIT
cd "$T" && git init -q . && git config user.email t@t && git config user.name t
mkdir -p docs/plans
cat > docs/plans/2026-01-01-demo.md <<'EOF'
# Demo plan

## Task 1: First thing
Step one of task one.

```md
## Task 2: not a real heading (inside a fence)
```

#### Step 1: sub-step stays in task 1

## Task 2: Second thing
Body of task two.

## Task 12: Twelfth thing
Body of task twelve.

## Appendix
Not part of any task.
EOF
echo hello > a.txt && git add -A && git commit -qm base && BASE=$(git rev-parse HEAD)
echo world >> a.txt && git commit -qam change
export PATH="$ROOT/bin:$PATH"

echo "workspace"
WS="$(godmode workspace docs/plans/2026-01-01-demo.md)"
[ -d "$WS" ] && [ "$(cat "$WS/plan-path")" = "docs/plans/2026-01-01-demo.md" ] && pass "workspace created with plan-path" || fail "workspace"
[ "$(cat .godmode/.gitignore)" = "*" ] && pass "self-ignoring .godmode/.gitignore" || fail "gitignore"

echo "brief"
B="$(godmode brief docs/plans/2026-01-01-demo.md 1 "$WS")"
grep -q "Step one of task one" "$B" && grep -q "sub-step stays in task 1" "$B" && pass "task 1 keeps its sub-steps" || fail "task 1 content"
grep -q "Body of task two" "$B" && fail "task 1 leaked into task 2" || pass "task 1 stops at task 2"
grep -q "inside a fence" "$B" && pass "fenced fake heading kept as content" || fail "fenced heading handling"
B12="$(godmode brief docs/plans/2026-01-01-demo.md 12 "$WS")"
grep -q "Body of task twelve" "$B12" && ! grep -q "Appendix" "$B12" && pass "task 12 found, appendix excluded" || fail "task 12"
B1b="$(godmode brief docs/plans/2026-01-01-demo.md 1 "$WS")"; grep -q "twelve" "$B1b" && fail "Task 1 matched Task 12" || pass "Task 1 does not match Task 12"
godmode brief docs/plans/2026-01-01-demo.md 7 "$WS" >/dev/null 2>&1 && fail "missing task did not fail" || pass "missing task exits non-zero"

echo "review-package"
P="$(godmode review-package "$BASE" HEAD "$WS")"
grep -q "^## Commits" "$P" && grep -q "^## Diff" "$P" && grep -q "+world" "$P" && pass "package has commits, stat and diff" || fail "review package content"
godmode review-package HEAD HEAD "$WS" >/dev/null 2>&1 && fail "empty range accepted" || pass "empty range rejected"

echo "ledger and status"
godmode ledger "$WS" "Task 1: complete (commits a..b, review clean)" >/dev/null
godmode ledger "$WS" "Ruling: keep parseRange / matches exports / one rename" >/dev/null
head -n 1 "$WS/progress.md" | grep -q "^# GodMode ledger: plan docs/plans/2026-01-01-demo.md" && pass "ledger header names the plan" || fail "ledger header"
STATUS="$(godmode status "$WS")"
printf '%s\n' "$STATUS" | grep -q "next task: 2" && pass "status computes the next task" || { fail "status"; printf '%s\n' "$STATUS"; }
[ "$(git status --short | wc -l)" -eq 0 ] && pass "workspace stays out of git status" || fail "git status not clean"

echo
if [ $fails -eq 0 ]; then echo "bin: all tests passed"; else echo "bin: $fails failure(s)"; exit 1; fi
