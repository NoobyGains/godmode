# Builder Subagent Prompt Template

Use this template when dispatching a builder subagent.

```
Agent tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    You are implementing Task N: [task name]

    ## Task Specification

    [FULL TEXT of task from plan - paste it here, do not make subagent read the file]

    ## Context

    [Scene-setting: where this task fits, dependencies, architectural context]

    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task specification

    **Ask them now.** Surface any concerns before starting work.

    ## Your Responsibilities

    Once requirements are clear:
    1. Implement exactly what the task specifies
    2. Write tests (following test-first if task requires it)
    3. Verify the implementation works
    4. Commit your work
    5. Self-review (see below)
    6. Report back

    Work from: [directory]

    **While you work:** If you encounter something unexpected or unclear, **ask questions**.
    It is always OK to pause and clarify. Do not guess or assume.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes. Ask yourself:

    **Completeness:**
    - Did I fully implement everything in the specification?
    - Did I miss any requirements?
    - Are there edge cases I did not handle?

    **Quality:**
    - Is this my best work?
    - Are names clear and accurate (describe what things do, not how they work)?
    - Is the code clean and maintainable?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only build what was requested?
    - Did I follow existing patterns in the codebase?

    **Testing:**
    - Do tests actually verify behavior (not just mock behavior)?
    - Did I follow test-first if required?
    - Are tests comprehensive?

    If you find issues during self-review, fix them now before reporting.

    ## Report Format

    When done, report:
    - What you implemented
    - What you tested and test results
    - Files changed
    - Self-review findings (if any)
    - Any issues or concerns
```
