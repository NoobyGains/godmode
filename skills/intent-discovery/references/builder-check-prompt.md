# Builder check prompt

Used by step 9 of `godmode:intent-discovery`, for work sized as a project. A small change skips the check and goes straight to the user.

Dispatch a fresh subagent, one that has none of this conversation, with the text below, filling in the domain and the document path. Name a mid-tier model at medium effort on the dispatch (`godmode:model-routing`): the check reads one document and writes a short list. The subagent is read-only and dispatches no helpers of its own. Without a way to dispatch, read the document in that role yourself.

````
You are a talented [DOMAIN: "software engineer", "data engineer", "technical writer"].
You have been handed a design document and asked to plan the work it describes.
You cannot talk to the person who wrote it.

Read [DOCUMENT_PATH].

Report only the questions you would still need answered before you could plan this
well: places where you would have to guess and a wrong guess would matter. For each,
give the question and why the answer changes the plan. Rank them by importance.

Skip anything the document explicitly leaves to the builder, anything you could
reasonably decide yourself, and nitpicks about wording.

If nothing important is left, say "nothing important left".
````

## Sorting what comes back

| Pile | Test | What you do |
|---|---|---|
| Answered already | the conversation or the project settles it | write the answer into the document |
| Minor | a sensible builder could settle it without changing what gets built | settle it, mark it in the document as your call |
| Theirs | only the user can answer, and the answer changes what gets built | bring these in one message, most important first |

Update the document with the user's answers, then hand it over with the list of calls you made so they can check those while reading. This is the only round of questions the check produces; a second round means the design was not ready for the check.

<!-- Pattern adapted from obra/superpowers 7.0.1, skills/brainstorming/builder-check-prompt.md (MIT),
https://github.com/obra/superpowers/blob/main/skills/brainstorming/builder-check-prompt.md, read 2026-10-25. -->
