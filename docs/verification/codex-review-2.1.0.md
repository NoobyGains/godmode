# Codex review of the 2.1.0 release diff

One headless round, 2026-10-25: `codex exec --skip-git-repo-check -s read-only -m gpt-6.1-sol -o <file>` with the brief inlined (eight numbered checks over `git diff v2.0.0..v2.1.0`, read-only, no sub-agents, no web). Codex CLI 0.163. Verdict returned: **FAIL** (two Important findings, five Minor). All seven were real; all are fixed in 2.1.1.

| # | Finding (Codex) | Severity | Resolution |
|---|---|---|---|
| 1 | `scripts/validate.js`: the 20,000-byte cap and the 8,000-byte protocol position counted UTF-16 characters (`content.length`), so a skill with multi-byte text passed over the limit | Important | Both measured with `Buffer.byteLength(..., 'utf8')`; probe: a skill padded with 10,001 `é` fails at 23,622 bytes |
| 2 | `scripts/validate.js`: a missing `## The Protocol` heading returned `-1` and passed the position check; the section was not in the required list | Important | `protoIdx < 0` is now an error ("missing section"); probe: renaming the heading in one skill fails the run |
| 3 | `intent-discovery` step 9 batches the builder-check questions while the guardrail forbids more than one question per message | Minor | Guardrail names the builder-check round as the one exception |
| 4 | `intent-discovery` graph sent every design through the builder check; step 9 says projects only | Minor | Graph gained a `small change` edge straight to approval |
| 5 | `tests/acceptance/claude-code-stop-check.sh`: the substring check on the last 60 characters would reject a refusal that quotes the sentence at the end | Minor | Check now requires the message to end with the sentence as its own statement; a preceding quote mark exempts it |
| 6 | CHANGELOG said "every task carries an Interfaces block"; the skill requires it only when another task consumes or produces the names | Minor | Wording corrected |
| 7 | CHANGELOG and the reference said the reviewer agent is "read-only by its tool list" while `Bash` is in the list | Minor | Wording now says what is true: the list is `Read, Grep, Glob, Bash` (git commands), the prose forbids writes |

Codex's own checks that passed: completion-gate frontmatter shape; task-planning internal consistency after the "decisions, not transcripts" change; the builder-check reference resolves; the Codex manifest shape, version, skills path, absent hooks and marketplace `./`; nested `hooks` flattens safely in the validator; both acceptance scripts pass `bash -n` with no CRLF and clean temp-dir traps; the reviewer agent's YAML list; the three spot-checked changelog claims exist in the diff.

Codex could not write its report file because the sandbox was read-only; the `-o` copy was used.
