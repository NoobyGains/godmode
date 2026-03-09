# Code Quality Auditor Prompt Template

Use this template when dispatching a code quality auditor subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance audit passes.**

```
Dispatch the code-reviewer agent (agents/code-reviewer.md) using the Agent tool:
  Use template at quality-gate/code-reviewer.md

  WHAT_WAS_IMPLEMENTED: [from builder's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**Code quality auditor returns:** Strengths, Issues (Critical/Important/Minor), Assessment
