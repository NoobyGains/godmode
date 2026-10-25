# Cross-model review brief template

Copy this file to a scratch or git-ignored path (for example `review/brief-<short-sha>.md`), fill in every `{PLACEHOLDER}`, delete the guidance lines in italics, and send the reviewer the path to the filled-in file.

---

# Review brief: {CHANGE_TITLE}

You are reviewing a change written by a model from a different family than yours. Your job is to answer the questions below from the code. You have one round.

## Rules

1. **Read-only.** Do not edit, create or delete files in the repository. Do not stage, commit, check out, reset, push or run commands that change state. Running the test suite or a read-only script is allowed only if a question asks for it.
2. **No sub-agents.** Do the whole review yourself. Do not start helpers, sub-agents or a second reviewer.
3. **Stay in scope.** Read the files listed below and whatever they directly call or are called by. Do not review the rest of the repository.
4. **No web browsing** unless a question says it needs a current external fact; if it does, cite the URL.
5. **Evidence for every finding:** `file:line`, the input or sequence that triggers it, and what happens.
6. **One round.** Write the report to the path below and stop. Do not wait for replies.

## The change

- Repository: {REPO_PATH}
- Range: `{BASE}..{HEAD}`
- Diff: `{DIFF_FILE}` *(write it with `git diff {BASE} {HEAD} > {DIFF_FILE}`)*
- What it does: {TWO_SENTENCE_SUMMARY}
- Requirements: {REQUIREMENTS_OR_PATH}

## Files to read

| File | Why it matters |
|---|---|
| `{path/one}` | {one line} |
| `{path/two}` | {one line} |

*Keep this to the files the questions need, usually two to ten.*

## Questions

1. {exact, checkable question}
2. {exact, checkable question}
3. {exact, checkable question}

*Three to seven questions. Each names a function, path, input or condition. Aim at unstated assumptions, error paths, concurrency, untrusted input and behaviour the requirements do not mention.*

Last question, always included: **What is the most likely way this change breaks in production that none of the questions above covers?** Answer in at most five lines.

## Report

Write the report to `{REPORT_PATH}` in this format:

```markdown
# Cross-model review report: {CHANGE_TITLE}
Reviewer: <family and model>   Date: <date>

## Answers
### Q1
Answer: <yes / no / partly, then the explanation>
Evidence: <file:line, trigger, result>
(one section per question)

## Findings
| # | Severity (critical / important / minor) | file:line | What happens | Trigger |

## Not checked
<anything you could not answer, and why>
```
