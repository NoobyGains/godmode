---
name: security-protocol
description: "Use when writing or changing code that handles user input, uploaded files, authentication, sessions, authorisation, database queries, shell commands, file paths, outbound requests to user-supplied URLs, HTTP responses and headers, secrets or credentials, deserialisation, or new third-party dependencies."
---

# Security Protocol

Every point where data enters your code from outside is a trust boundary: request bodies, headers, cookies, URLs, files, environment, message queues, third-party API responses, and model output. Data that crosses one is hostile until it has been validated for what it claims to be and encoded for where it is going. **Validate on the way in, encode on the way out, authorise every action, and keep secrets out of code.**

## The Prime Directive

```
NO EXTERNAL DATA REACHES A SYSTEM CALL, QUERY OR OUTPUT WITHOUT VALIDATION
```

No exceptions. No workarounds. No shortcuts.

"System call" includes shell commands, file-system paths, outbound HTTP requests, deserialisers and `eval`-like functions. "Query" includes SQL, NoSQL, LDAP, XPath and search engines. "Output" includes HTML, JSON sent to browsers, logs, headers and prompts sent to a model.

## When to Use

**Required:**
- Code that reads any request data, uploaded file, webhook, queue message or third-party response.
- Login, sign-up, password reset, sessions, tokens, API keys, roles or permissions.
- Building a query, a shell command, a file path or an outbound URL from anything not hard-coded.
- Rendering user-supplied content, setting response headers or configuring CORS.
- Adding, upgrading or vendoring a dependency, a CI action or a build tool.
- Error handling on any path that touches the above (failing open is a vulnerability).

**Skip:**
- Code with no external input and no privileged action, such as a pure function over trusted constants. If you are unsure whether data is external, it is.

## The Protocol

1. **Map the boundaries.** For the change in front of you, list every input source and every sink it reaches (database, shell, file system, network, browser, log). Write the list in the plan or PR description; it is the scope of the rest of this protocol.

2. **Validate at the boundary, with an allowlist.** Parse input into a typed shape with a schema at the point it enters: type, length, format, range, and an explicit set of allowed values where one exists. Reject what does not fit; do not try to repair it. Validation runs on the server even when the client also validates. Work through the checklist below.

3. **Use the safe API for each sink.**
   - Queries: parameterised statements or a query builder, never string concatenation.
   - Shell: avoid the shell; call the program with an argument array. If a shell is unavoidable, allowlist every argument.
   - Paths: resolve the final path and check it stays inside the intended directory; never pass user input straight to file APIs.
   - Outbound requests to user-supplied URLs: allowlist schemes and hosts, resolve the address and block private, loopback and link-local ranges, and do not follow redirects blindly.
   - HTML: an auto-escaping template engine or framework; sanitise with a maintained library when rich text is required.
   - Deserialisation: data formats only (JSON with a schema), never native object deserialisers on untrusted input.

4. **Authorise every action on the server.** For each endpoint or command, check that this user may perform this action on this specific resource. Deny by default. Never trust a role, user ID or price sent by the client.

5. **Handle authentication and passwords with established libraries.** Never write your own crypto, session or token scheme. Hash passwords with the algorithm the current OWASP guidance recommends (Argon2id first; parameters in the reference file). Session cookies are `HttpOnly`, `Secure` and `SameSite`; sessions rotate on login and expire.

6. **Keep secrets out of code, logs and URLs.** See Secrets Management below.

7. **Fail closed.** Errors in validation, authorisation or an external call must deny the action, release resources and return a generic message. Stack traces, SQL errors and internal paths never reach the user; they go to the server log without secrets.

8. **Set the security headers** for any HTTP response (table below).

9. **Govern the supply chain.** Before adding a dependency or CI action, check maintenance, known vulnerabilities and install scripts; commit lockfiles; pin CI actions to commit SHAs; run the ecosystem's audit (`npm audit`, `pip-audit`, `cargo audit`, `govulncheck ./...`) and a secret scanner (for example `gitleaks git`) in CI.

10. **Test the abuse cases.** Write failing tests first (`godmode:test-first`) for at least: another user's resource ID, an oversized and a malformed input, an injection payload for each sink, and an expired or missing token. Record the run as evidence.

11. **Check against the current OWASP Top 10** in [references/owasp-top-10.md](references/owasp-top-10.md) before you call security work done. The list is revised every few years; confirm the edition is still current (`godmode:grounding`).

## Input Validation Checklist

For every input field and parameter:

- [ ] Type is enforced by parsing, not by casting (a string that should be an integer is parsed and rejected if it fails).
- [ ] Length has a minimum and a maximum, including for arrays and nested objects.
- [ ] Format is checked with a strict pattern or a dedicated parser (emails, URLs, dates, UUIDs), anchored at both ends.
- [ ] Numbers and dates have a range.
- [ ] Enumerations are checked against an allowlist.
- [ ] Unknown fields are rejected or stripped, so a client cannot set `isAdmin` by adding it (mass assignment).
- [ ] Text is normalised (Unicode, case, whitespace) before comparison or uniqueness checks.
- [ ] Files: size limit, type checked from content not from the extension or the client's content type, stored outside the web root under a generated name, never executed.
- [ ] Output is encoded for its context (HTML body, attribute, URL, JavaScript, CSS, SQL, shell, log line).
- [ ] Rate limits exist on authentication, password reset, and any expensive or enumerable endpoint.

## Secrets Management

**Never:**
- Put a secret in source code, a committed config file, a container image, a client bundle or a URL query string.
- Log a secret, token, password, session ID or full card number, including in error messages and debug output.
- Reuse one secret across environments or services.

**Always:**
- Add `.env` and its variants to `.gitignore` before the first commit, and commit only `.env.example` with placeholders.
- Load secrets from the environment or a secret manager at start-up, and fail fast if one is missing.
- Give each environment and service its own credential with the least privilege it needs.
- Rotate on a schedule, and immediately when a secret may have leaked.
- Treat a committed secret as compromised: rotate it first, then remove it from history. Deleting the file in a later commit does not remove it.

## Security Headers

<!-- Values from the OWASP HTTP Headers Cheat Sheet, fetched 2026-10-25: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html -->

| Header | Starting value | Note |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'; frame-ancestors 'none'; object-src 'none'` | Build up from restrictive; avoid `unsafe-inline` for scripts. `frame-ancestors` replaces `X-Frame-Options` in supporting browsers. |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS-only sites. Read the preload requirements before adding `preload`. |
| `X-Content-Type-Options` | `nosniff` | Send correct `Content-Type` headers too. |
| `X-Frame-Options` | `DENY` | For older browsers, alongside `frame-ancestors`. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Set explicitly rather than relying on browser defaults. |
| `Permissions-Policy` | `geolocation=(), camera=(), microphone=()` | Disable every feature the site does not use. |
| `Cross-Origin-Opener-Policy` | `same-origin` | Isolates the browsing context. |
| `X-XSS-Protection` | `0`, or omit | The old filter can create vulnerabilities; rely on CSP. |
| `Server`, `X-Powered-By` | remove | They advertise the stack. |

CORS: allow specific origins only; never reflect the request origin or use `*` together with credentials.

## Cognitive Traps

| Rationalisation | Truth |
|---|---|
| "It's an internal tool." | Internal networks get breached and internal users make mistakes. The boundary is the code, not the firewall. |
| "The framework handles it." | Frameworks have escape hatches (raw queries, unescaped output, disabled CSRF). Know which ones this code uses. |
| "The front end validates it." | Anyone can call the API directly. Only server-side checks count. |
| "Nobody would send that." | Attackers send exactly that, automatically, at scale. |
| "We'll add security later." | Later means rewriting the data flow. It is cheapest while the code is being written. |
| "It's only a prototype." | Prototypes ship. A secret committed today stays in history. |
| "This dependency is popular, so it's safe." | Popular packages are the most attractive supply-chain targets. Check it and pin it. |
| "An error here is harmless." | Failing open on an exception skips the check that would have denied the request. |

## Guardrails

**Never:**
- Concatenate external input into a query, command, path, URL, template or `eval`.
- Ship an endpoint that checks authentication but not authorisation on the specific resource.
- Implement your own cryptography, password hashing or token format.
- Commit, log or put in a URL any secret.
- Catch an exception in a security check and continue as if it passed.
- Disable CSRF protection, certificate verification or output escaping to make something work.

**Always:**
- Map boundaries and sinks before writing the code.
- Validate with an allowlist schema on the server, and encode for the output context.
- Deny by default and fail closed.
- Run the dependency audit and secret scan, and write the abuse-case tests.
- Check the change against the current OWASP Top 10 reference.

## Connections

- `godmode:system-design`: authentication strategy, data flow and trust zones are design decisions; settle them there first.
- `godmode:test-first`: abuse cases are written as failing tests before the fix or feature.
- `godmode:quality-gates`: dependency audit, secret scanning and static analysis run as machine-enforced gates.
- `godmode:grounding`: OWASP guidance, library APIs and header behaviour are verified against current sources.
- `godmode:code-review`: reviewers check the boundary map and the sinks list.
- `godmode:completion-gate`: security work is done only with the test and scan output in hand.
