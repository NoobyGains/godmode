---
name: security-protocol
description: Use when writing code that processes user input, manages authentication or authorization, constructs database queries, handles file operations, interacts with external data, exposes API endpoints, or manages secrets - any code that crosses a trust boundary
---

# Security Protocol

## Overview

Security is not a phase you bolt on. Every line of code is a security decision.

**Core principle:** Never trust data from outside your trust boundary. Validate at every boundary crossing.

**No exceptions. No workarounds. No shortcuts.**

## The Prime Directive

```
NO EXTERNAL DATA REACHES A SYSTEM CALL, QUERY, OR OUTPUT WITHOUT VALIDATION AND SANITIZATION
```

When data crosses a trust boundary, it must be validated before consumption. This is absolute.

## When to Use

**Mandatory when writing code that:**
- Accepts user input (forms, URLs, headers, uploaded files)
- Constructs database queries
- Renders user-supplied content
- Manages authentication or authorization
- Handles secrets or credentials
- Invokes external APIs
- Manipulates file paths
- Executes system commands
- Sets HTTP response headers
- Processes file uploads

**This is not discretionary.** Security awareness is woven into development, not applied afterward.

## The Entry Protocol

```
BEFORE shipping ANY code that handles external data:

1. IDENTIFY: Where does data enter the system? (Trust boundary)
2. VALIDATE: Is input validated at the boundary?
3. SANITIZE: Is output encoded for its target context?
4. AUTHORIZE: Is access control verified before the action?
5. PROTECT: Are secrets, tokens, and keys managed safely?

Omit any step = vulnerability shipped
```

## OWASP Top 10 Condensed Guide

### A01: Broken Access Control

**Every endpoint must verify: Can THIS user perform THIS action on THIS resource?**

```
# VULNERABLE: Checks authentication but not authorization
GET /api/accounts/456/profile  # User 123 views user 456's private data

# SECURE: Verify resource ownership
if resource.owner_id != authenticated_user.id:
    return 403 Forbidden
```

| Verification | Method |
|---|---|
| Authentication | Is the user who they claim to be? |
| Authorization | Is this user permitted to perform this action? |
| Resource ownership | Does this user own this specific resource? |
| Role enforcement | Server-side role check; never trust client-provided role claims |

**Default posture: deny.** If no explicit rule grants access, access is denied.

### A02: Cryptographic Failures

| Required Practice | Prohibited Practice |
|---|---|
| bcrypt/scrypt/argon2 for password hashing | MD5, SHA1, SHA256 for passwords |
| TLS everywhere (HTTPS) | HTTP for anything sensitive |
| Cryptographically secure RNG for tokens | Math.random() for security tokens |
| Encrypt sensitive data at rest | Store sensitive data in plaintext |
| Use established cryptographic libraries | Implement custom cryptography |

### A03: Injection

**Never concatenate external input into queries, commands, or templates.**

| Injection Vector | Prevention |
|---|---|
| SQL injection | Parameterized queries / prepared statements. Always. |
| NoSQL injection | Type-check inputs; use ODM query builders |
| Command injection | Avoid shell execution. If unavoidable: allowlist arguments, never interpolate |
| LDAP injection | Escape special characters; use parameterized queries |
| Template injection | Use auto-escaping template engines |

```sql
-- VULNERABLE: String concatenation
SELECT * FROM users WHERE email = '" + userInput + "'

-- SECURE: Parameterized query
SELECT * FROM users WHERE email = $1
```

This is non-negotiable. There is no scenario where string concatenation in queries is acceptable.

### A04: Insecure Design

- Enforce rate limiting on authentication endpoints
- Use CAPTCHA or proof-of-work for account creation
- Validate business logic constraints server-side (never client-side only)
- Design for abuse scenarios, not just intended usage

### A05: Security Misconfiguration

| Checkpoint | Action |
|---|---|
| Default credentials | Replace all defaults before deployment |
| Debug features | Disable debug mode, admin consoles, and verbose errors in production |
| Error verbosity | Never expose stack traces, SQL errors, or internal paths to users |
| Directory listing | Disable on all web servers |
| Security headers | Set them (see Security Headers section) |
| CORS policy | Restrict to specific origins; never `*` for credentialed requests |

### A06: Vulnerable Components

```
BEFORE adding any dependency:

1. Is it actively maintained? (Last commit within 6 months)
2. Are known vulnerabilities published? (npm audit, snyk, dependabot)
3. Is it widely adopted? (Download counts and stars are signals, not guarantees)
4. Is it actually necessary? (Do not add a dependency for a single utility function)
```

Execute `npm audit` / `pip audit` / `cargo audit` regularly. Remediate critical and high findings immediately.

### A07: Authentication Failures

| Requirement | Implementation |
|---|---|
| Password storage | bcrypt/scrypt/argon2 with unique salts |
| Session tokens | Cryptographically random, httpOnly, secure, sameSite flags |
| Brute-force protection | Lock account after 5-10 consecutive failures |
| Multi-factor authentication | Support TOTP minimum for sensitive applications |
| Password policy | Minimum 8 characters; cross-reference against breach databases |
| Session lifecycle | Expire sessions; invalidate on password change |

### A08: Data Integrity Failures

- Verify integrity of software updates and CI/CD pipelines
- Use signed artifacts and checksums
- Never auto-deserialize untrusted data (no `eval()`, no `pickle.loads()` on user input)

### A09: Logging and Monitoring Failures

| Log | Never Log |
|---|---|
| Authentication attempts (success and failure) | Passwords or authentication tokens |
| Authorization denials | Complete credit card numbers |
| Input validation failures | Personally identifiable information without purpose |
| System errors | Encryption keys or secrets |

### A10: Server-Side Request Forgery (SSRF)

- Validate and allowlist URLs before server-side requests
- Never allow users to control URLs for server-side fetches
- Block requests to internal networks (169.254.x.x, 10.x.x.x, 127.x.x.x, 192.168.x.x)

## Security Headers

Set these on every HTTP response:

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Begin restrictive and relax only when a specific requirement demands it.

## Secrets Management

```
NEVER:
- Embed secrets in source code
- Commit .env files to version control
- Write secrets to log output
- Transmit secrets in URL query parameters
- Store secrets in client-side code

ALWAYS:
- Use environment variables or dedicated secret managers
- Add .env to .gitignore BEFORE the first commit
- Rotate secrets on a defined schedule
- Use distinct secrets per environment
- Audit secret access
```

## Input Validation Checklist

For every input field:

- [ ] Type validated (string, number, email, URL)
- [ ] Length constrained (minimum and maximum)
- [ ] Format validated (regex for structured data)
- [ ] Range checked (numbers, dates)
- [ ] Allowlisted where possible (enum values, known options)
- [ ] Sanitized for output context (HTML, SQL, shell)
- [ ] File uploads: type verified by content inspection (not extension), size limited

## Cognitive Traps

| Rationalization | Truth |
|---|---|
| "Internal tool, no attacker" | Internal tools get compromised. Internal users make mistakes. Insider threats are real. |
| "We will add security later" | Security is not a feature. Retrofitting it costs 10x more than building it in. |
| "The framework handles it" | Frameworks have escape hatches. Know exactly what your framework does and does not protect. |
| "Input validation is excessive" | Every injection attack in history started with unvalidated input. |
| "It is just a prototype" | Prototypes become production systems. Secure from the beginning. |
| "Too complicated, slows development" | Data breaches slow development permanently. |
| "Nobody would do that" | Attackers do exactly that. Assume all input is hostile. |

## Guardrails -- HALT and Fix

- String concatenation in SQL queries
- `eval()` or `exec()` on user-provided data
- Secrets in source code or committed configuration files
- Missing authorization checks on endpoints
- User input rendered without encoding
- Wildcard `*` CORS policy with credentials
- HTTP for anything involving authentication or sensitive data
- Client-side-only validation without server-side counterpart
- Disabled CSRF protection
- Default credentials in deployed environments

**Every item on this list is a security vulnerability. Remediate before shipping.**

## Integration

**Complementary skills:**
- **godmode:system-design** -- Authentication strategy and data flow design
- **godmode:quality-enforcement** -- Security checks as automated quality gates
- **godmode:completion-gate** -- Security verification before shipping
- **godmode:test-first** -- Write security-focused test cases

## The Bottom Line

```
Trust boundary crossed -> validate input, sanitize output, verify authorization
```

No exceptions. No "we will add it later." Security ships with the code or the code does not ship.
