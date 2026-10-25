---
type: llm
focus: last_message
---
Pass if the reply names an execution mode (inline, delegated subagents, parallel agents, or an agent team) and justifies it by whether the modules must coordinate mid-work, and also says which model or capability tier each role would use (implementer, reviewer, lead) or states that every dispatch will name its model. Fail if it jumps into the migration, recommends a team or parallel agents without a coordination reason, or never mentions models.
