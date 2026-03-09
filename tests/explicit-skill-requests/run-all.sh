#!/bin/bash
# Run all explicit skill request tests
# Usage: ./run-all.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROMPTS_DIR="$SCRIPT_DIR/prompts"

echo "=== Running All Explicit Skill Request Tests ==="
echo ""

PASSED=0
FAILED=0
RESULTS=""

# Test: delegated-execution, please
echo ">>> Test 1: delegated-execution-please"
if "$SCRIPT_DIR/run-test.sh" "delegated-execution" "$PROMPTS_DIR/delegated-execution-please.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS="$RESULTS\nPASS: delegated-execution-please"
else
    FAILED=$((FAILED + 1))
    RESULTS="$RESULTS\nFAIL: delegated-execution-please"
fi
echo ""

# Test: use fault-diagnosis
echo ">>> Test 2: use-fault-diagnosis"
if "$SCRIPT_DIR/run-test.sh" "fault-diagnosis" "$PROMPTS_DIR/use-fault-diagnosis.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS="$RESULTS\nPASS: use-fault-diagnosis"
else
    FAILED=$((FAILED + 1))
    RESULTS="$RESULTS\nFAIL: use-fault-diagnosis"
fi
echo ""

# Test: please use intent-discovery
echo ">>> Test 3: please-use-intent-discovery"
if "$SCRIPT_DIR/run-test.sh" "intent-discovery" "$PROMPTS_DIR/please-use-intent-discovery.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS="$RESULTS\nPASS: please-use-intent-discovery"
else
    FAILED=$((FAILED + 1))
    RESULTS="$RESULTS\nFAIL: please-use-intent-discovery"
fi
echo ""

# Test: mid-conversation execute plan
echo ">>> Test 4: mid-conversation-execute-plan"
if "$SCRIPT_DIR/run-test.sh" "delegated-execution" "$PROMPTS_DIR/mid-conversation-execute-plan.txt"; then
    PASSED=$((PASSED + 1))
    RESULTS="$RESULTS\nPASS: mid-conversation-execute-plan"
else
    FAILED=$((FAILED + 1))
    RESULTS="$RESULTS\nFAIL: mid-conversation-execute-plan"
fi
echo ""

echo "=== Summary ==="
echo -e "$RESULTS"
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

if [ "$FAILED" -gt 0 ]; then
    exit 1
fi
