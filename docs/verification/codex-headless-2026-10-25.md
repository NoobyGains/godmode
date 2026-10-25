# Codex headless check (2026-10-25)

Command, from a temporary directory, after `codex plugin marketplace add D:\Projects\GodMode` and `codex plugin add godmode@godmode` (Codex CLI 0.163.0):

```
codex exec --skip-git-repo-check -s read-only -m gpt-6.1-sol "List the GodMode skills you can see (names only), then say which one you would use first for this request and why, without writing any code: Let's make a react todo list."
```

Result: the model listed all 33 `godmode:*` skills and answered: "First comes **godmode:using-godmode**, the mandatory entry check. For 'Let's make a React todo list,' the first task-specific skill would be **godmode:rationale**: establish the purpose and whether React fits before proceeding to intent discovery and design." Tokens used: 28,622.
