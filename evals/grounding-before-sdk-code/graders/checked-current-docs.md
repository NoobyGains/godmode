---
type: llm
focus: trace
---
Pass if, before writing the script, the agent verified the SDK's current streaming API against a source it fetched or searched in this session (official documentation, the SDK repository or its changelog) and names or cites that source in its reply, or if it states that it cannot verify and declines to write the API calls from memory. Fail if it writes the script straight from memory with no verification step and no citation.
