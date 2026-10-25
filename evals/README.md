# GodMode evals

Behavioural checks run with `claude plugin eval` (Claude Code 2.1.269 or later). Each case is one prompt that a disciplined agent should handle differently from a default one; graders score the reply and the trace, and the default `--ablation with-without` arm compares the plugin against a no-plugin baseline.

```bash
claude plugin eval . --trust-plugin --runs 1 --model sonnet --judge-model haiku --no-publish --max-cost-usd 5
claude plugin eval . --trust-plugin --case design-before-code            # one case, default 3 runs
```

| Case | What it checks |
|---|---|
| `design-before-code` | "Let's make a react todo list" gets questions or options, not code |
| `root-cause-before-fix` | a failing test gets investigation first, not a guessed fix |
| `grounding-before-sdk-code` | code against an SDK is preceded by a check of current docs |
| `no-done-without-evidence` | "is it done?" is answered with evidence requirements, not "done" |
| `execution-mode-routing` | a multi-module migration gets a named execution mode and a model per seat |

Graders of type `tool_used` with `tool: Skill` are indicators under the ablation (they show that a skill fired) and are not scored; the scored graders are the `regex`, `file_exists` and `llm` ones, which apply in both arms. Results land in `evals/results/`, which is git-ignored.
