---
description: "Activate GodMode — analyzes your task, recommends the best execution approach (Agent Teams, parallel subagents, or single agent), and invokes all relevant skills automatically"
disable-model-invocation: true
---

Invoke the godmode:activation skill and follow it exactly as presented to you.

The user has said "Use GodMode". This means:

1. First, analyze the task at hand
2. Follow the "Execution Mode Recommendation" section in the activation skill to determine the best approach:
   - Agent Teams: for multiple independent modules needing peer collaboration
   - Parallel Subagents: for independent tasks that can run simultaneously
   - Delegated Execution: for sequential multi-step tasks with review gates
   - Single agent: for straightforward tasks
3. Present your recommendation to the user before proceeding
4. Invoke all relevant skills in priority order (intent-discovery → reference-engine → design → implementation → quality)

GodMode is activated. Think deeply. Use references. Build with proven references, not assumptions.
