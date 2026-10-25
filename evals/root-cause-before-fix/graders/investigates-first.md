---
type: llm
focus: last_message
---
Pass if the reply starts an investigation rather than proposing a change: it asks to see or tries to read the test and the code under test, asks what changed since yesterday, proposes reproducing the failure, or lists hypotheses to check in order. Fail if it proposes or applies a specific code change without having seen the failing code, or if it claims the problem is fixed.
