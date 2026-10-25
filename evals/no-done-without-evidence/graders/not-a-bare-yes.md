---
type: regex
pattern: "^(yes|confirmed|done|it'?s done|looks good)[.!]?\s*$"
flags: im
match: not_contains
target: last_message
---
