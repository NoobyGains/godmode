# OWASP Top 10:2025, condensed

The current edition is **OWASP Top 10:2025** (checked 2026-10-25 at https://top10.owasp.org/2025/). Before relying on this file, confirm the edition is still the latest; OWASP revises the list every few years.

Contents: changes from 2021, then one section per category with what it is, what to do, and what to check in review. Password-hashing parameters are in A04 and A07.

## What changed from 2021

- **A01 Broken Access Control** stays first and now includes **Server-Side Request Forgery** (2021's A10).
- **A02 Security Misconfiguration** rises from fifth.
- **A03 Software Supply Chain Failures** is new: an expansion of 2021's "Vulnerable and Outdated Components" to dependencies, build systems and distribution.
- **A07** is renamed **Authentication Failures** (was "Identification and Authentication Failures").
- **A09** is renamed **Security Logging & Alerting Failures** (was "... Monitoring Failures"): logs without alerts do little.
- **A10 Mishandling of Exceptional Conditions** is new: improper error handling, logic errors and failing open.

## A01:2025 Broken Access Control

Users act outside their intended permissions: viewing or editing another user's data, calling admin functions, or making the server fetch internal URLs (SSRF).

**Do:** check on the server, for every request, that this user may perform this action on this resource; deny by default; derive the user from the session, never from a client field; use unguessable identifiers but never rely on them as the control; for outbound requests to user-supplied URLs, allowlist schemes and hosts, resolve the address and block private, loopback, link-local and cloud metadata ranges, and re-check after redirects.

**Review:** an endpoint taking a resource ID without an ownership check; role checks in the front end only; CORS that reflects any origin; a fetch of a URL taken from input.

## A02:2025 Security Misconfiguration

Insecure defaults, debug modes, verbose errors, open storage buckets, unnecessary features, missing headers, permissive CORS, XML parsers with external entities enabled.

**Do:** a repeatable, minimal configuration per environment; debug and admin consoles off in production; generic error pages; security headers set (table in the skill body); default accounts and sample apps removed; XML external entity resolution disabled.

**Review:** `DEBUG=true` or equivalent reachable in production; stack traces in responses; wildcard CORS with credentials; default credentials anywhere.

## A03:2025 Software Supply Chain Failures

Compromise through third-party code, build tools, CI pipelines or distribution: vulnerable or malicious packages, hijacked maintainers, unpinned CI actions, tampered artifacts.

**Do:** keep an inventory (lockfiles, and an SBOM where needed); add dependencies deliberately and few; install with frozen lockfiles; run the ecosystem's audit in CI; pin CI actions to commit SHAs and give workflow tokens minimum permissions; review install scripts; take updates in small, reviewed steps.

**Review:** a new dependency without justification; `latest` or floating versions in production manifests; CI actions referenced by mutable tags in sensitive workflows; a lockfile change that the PR does not explain.

## A04:2025 Cryptographic Failures

Sensitive data exposed through missing or weak cryptography: plaintext transport or storage, weak algorithms, home-grown crypto, predictable randomness, hard-coded keys.

**Do:** TLS for all traffic; encrypt sensitive data at rest with a maintained library; keys in a secret manager, rotated; a cryptographically secure random source for tokens; hash passwords as in A07.

**Review:** MD5 or SHA-1 for anything security-related; general-purpose random functions for tokens; keys in source; HTTP links for anything authenticated.

## A05:2025 Injection

Untrusted data interpreted as code or commands: SQL, NoSQL, OS command, LDAP, expression-language and template injection, and cross-site scripting.

**Do:** parameterised queries or a query builder; argument arrays instead of a shell; auto-escaping templates and context-aware output encoding; allowlist validation of input; a Content Security Policy as a second layer against XSS.

**Review:** any string concatenation or interpolation that reaches a query, command, template, `eval` or raw HTML sink.

## A06:2025 Insecure Design

Flaws in the design itself, which a perfect implementation cannot fix: missing rate limits, business rules enforced only in the client, no abuse cases, trust in the wrong component.

**Do:** threat-model new features (who could abuse this, and how); write abuse cases as tests; enforce business limits on the server (quantities, prices, sequences of steps); rate-limit expensive and enumerable operations; separate tenants by design.

**Review:** a flow that can be replayed, skipped or reordered; prices or totals taken from the client; no limit on attempts.

## A07:2025 Authentication Failures

Weak login, session and credential handling: credential stuffing, brute force, weak or default passwords, poor password storage, sessions that never expire or are not rotated.

**Do:** use an established authentication library or provider; support multi-factor authentication; check new passwords against breached-password lists and allow long passwords; throttle and lock out after repeated failures; rotate the session ID on login and invalidate sessions on logout and password change; cookies `HttpOnly`, `Secure`, `SameSite`.

**Password storage** (OWASP Password Storage Cheat Sheet, fetched 2026-10-25, https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html):

| Algorithm | Minimum parameters | When |
|---|---|---|
| Argon2id | m = 19 MiB, t = 2, p = 1 | First choice |
| scrypt | N = 2^17 (128 MiB), r = 8, p = 1 | When Argon2id is unavailable |
| bcrypt | work factor 10 or more; enforce a 72-byte maximum input | Legacy systems only |
| PBKDF2-HMAC-SHA-256 | 600,000 iterations | When FIPS-140 compliance is required |

**Review:** custom session tokens; password hashing with a fast hash; no throttling on login or reset; session ID unchanged after login.

## A08:2025 Software or Data Integrity Failures

Code or data trusted without verifying its integrity, at a lower level than A03: insecure deserialisation, unsigned updates, auto-update without signature checks, CI pipelines that run untrusted code with secrets.

**Do:** never deserialise untrusted data with native object formats; use data formats with a schema; verify signatures or checksums of downloaded artifacts and updates; keep untrusted pull-request code away from secrets in CI.

**Review:** `pickle`, Java native serialisation, or YAML loaders that build objects, applied to external input; downloads executed without verification.

## A09:2025 Security Logging & Alerting Failures

Attacks that go unnoticed because security events are not logged, logs are not monitored, or nobody is alerted.

**Do:** log authentication successes and failures, access-control denials, input validation failures and high-value transactions, with user, time and source; protect logs from tampering; alert on patterns (bursts of failures, privilege changes); never log secrets, tokens, passwords or unnecessary personal data; encode log entries so input cannot forge lines.

**Review:** security-relevant branches with no log line; logs that contain tokens or passwords; no alert anyone would see.

## A10:2025 Mishandling of Exceptional Conditions

Programs that fail to prevent, detect or respond to unusual conditions: unhandled exceptions, failing open, leaking details in errors, inconsistent state after a partial failure, resource exhaustion.

**Do:** fail closed (an error in a security check denies); catch exceptions where you can handle them and roll back partial work (transactions); release resources on every path; return generic errors to users and detailed ones to logs; set limits and timeouts on input size, recursion and external calls; test the error paths.

**Review:** `catch` blocks that swallow errors and continue; default branches that allow; error responses with stack traces; missing timeouts.

## Sources

- OWASP Top 10:2025 list and introduction: https://top10.owasp.org/2025/ and https://top10.owasp.org/2025/0x00_2025-Introduction/
- Category pages: https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/ (and the A02 to A10 pages linked from the list)
- Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- HTTP Headers Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
