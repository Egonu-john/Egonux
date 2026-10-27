# EGONUX Security, RLS and Permanent Data Baseline

**Status:** Initial repository inspection; not a certification  
**Inspection date:** 2026-10-27  
**Repository:** `Egonu-john/Egonux`  
**Inspection base:** `feature/egonux-auth-security-hardening` (commit `25d7565e8fa838ddfcb315f2a1e2dbe630c75c73`)

## Scope

This baseline records only findings verified from the repository files inspected so far. It does not claim that every API, collection, database, backup, or production environment has been audited.

## Executive summary

1. The current Firestore rules implement document-level authorization using authenticated UID ownership and role claims, with a deny-by-default catch-all.
2. The rules protect selected audit and ANOSA evidence collections from client writes. Trusted server-side writers still need independent authorization and audit review because Firebase Admin SDK operations bypass Firestore Security Rules.
3. The Firestore rules test suite contains five tests covering profile creation, role assignment rejection, client writes to audit/consent, audit reads, and selected ANOSA evidence access.
4. The existing recovery harness is not sufficient evidence of permanent data durability: it accepts HTTP 404 as a successful health check and checks telemetry response shape rather than verifying that a known persisted record survives a restart.
5. The `main` branch version of `lib/auth/rbac.ts` contains a hard-coded JWT secret. The authentication-hardening PR replaces that implementation with configured-secret enforcement and strict legacy-role validation. Until that PR is merged, the default branch retains the older implementation.
6. A full persistence inventory, backup configuration review, restore drill, server-side access review, and tenant-isolation audit remain outstanding.

## Verified findings

### F-01 — Firestore rules are deny-by-default

**Evidence:** `firestore.rules`

- `signedIn()` requires an authenticated request.
- `owns(uid)` binds user profile access to `request.auth.uid == uid`.
- User profile creation uses an allow-list of fields and requires onboarding status `started`.
- Profile updates restrict the affected field set.
- User profile deletion is denied.
- Client writes to consent, audit and the listed ANOSA evidence collections are denied.
- A final recursive match denies all other reads and writes unless an earlier matching rule allows them.

**Risk / limitation:** Firestore rules are not a complete platform authorization boundary if trusted server code uses Admin SDK privileges. Every server-side read/write path must perform its own authentication, authorization, tenant scoping and input validation.

### F-02 — Current rules tests are useful but narrow

**Evidence:** `tests/firestore.rules.test.mjs`

Five tests cover:
- A member creating and reading an allowed profile.
- Rejection of a profile that attempts to assign a role.
- Rejection of client writes to audit and consent records.
- Founder versus member access to audit events.
- Founder readability and client immutability for selected ANOSA evidence.

**Outstanding tests:** cross-user reads/updates, role-claim spoofing boundaries, tenant/organization isolation, query-level access patterns, operator least privilege, delete and field mutation cases, and all actual collections discovered in server code. The current tests do not exercise Admin SDK bypass paths.

### F-03 — Authentication hardening is in a separate PR

**Evidence:** `lib/auth/rbac.ts` on `main` versus the authentication-hardening branch.

- The inspected `main` implementation hard-codes `JWT_SECRET` as a source-code constant and accepts a `SUPER_ADMIN` role.
- The authentication-hardening branch requires a configured secret of at least 32 characters, validates legacy roles, verifies HMAC signatures using timing-safe comparison, rejects malformed/non-canonical tokens and expired tokens, and does not map `SUPER_ADMIN` into the legacy role set.
- The associated PR is #41: https://github.com/Egonu-john/Egonux/pull/41

**Release gate:** do not treat the authentication fix as deployed until the PR is merged and the production deployment is verified. At initial review, the two GitHub Actions workflows had succeeded, one Vercel status had succeeded, and another Vercel status was pending.

### F-04 — Firestore configuration and indexes exist

**Evidence:** `firebase.json`, `firestore.indexes.json`

- Firebase configuration points to `firestore.rules` and `firestore.indexes.json`.
- A Firestore emulator is configured on localhost port 8080.
- Composite indexes exist for selected ANOSA and audit collections.

**Outstanding:** verify deployed project/rules/index state against repository state; inspect actual query patterns and production configuration. Repository configuration alone does not prove deployment parity.

### F-05 — Existing recovery harness does not prove durable persistence

**Evidence:** `scripts/test-day8-recovery-resilience.mjs`

- The harness terminates a process on port 3100 and starts a Next.js server.
- It treats HTTP 200 **or 404** from `/api/health` as success.
- It checks that a pilot-observability response contains a release version.
- It does not write a known record to the persistent store before shutdown and verify the same record after restart.

**Required replacement/extension:** use an isolated test project or emulator, write a uniquely identified test record through the actual persistence layer, close/restart the service, read the record back, verify integrity and authorization, then clean up the test fixture. Do not run destructive recovery tests against production.

### F-06 — Ledger test harness covers invariants but persistence remains unproven

**Evidence:** `scripts/test-ch12-ledger.mjs`

The harness checks a balanced double-entry transaction, rejects an imbalanced transaction, and rejects a duplicate idempotency key. This does not, by itself, establish that ledger entries are durably stored, append-only in production, transactionally consistent under concurrency, recoverable from backups, or reconciled against provider statements.

## Workstream status

| Workstream | Status | Next evidence required |
|---|---|---|
| 1. Authentication and authorization | Partial | Complete PR #41 release gate; inventory every protected API and role mapping |
| 2. RLS/document isolation | Partial | Map every collection and every client/server access path; expand emulator tests |
| 3. Secrets and credential history | Partial | Complete repository/history secret scan and validate rotation/remediation without printing secrets |
| 4. API trust boundaries | Not yet inspected comprehensively | Inventory route handlers and Admin SDK usage |
| 5. Permanent data inventory | Not yet complete | Identify canonical stores, temporary/mock/in-memory state, schemas and write paths |
| 6. Ledger integrity | Partial | Inspect ledger engine/storage adapter and persistence/concurrency behavior |
| 7. Backup and restore | Not verified | Inspect backup/export policy and execute isolated restore drill |
| 8. Data governance/audit | Partial | Map consent, audit, retention, export and deletion flows |
| 9–15. Integrations and operations | Not yet inspected comprehensively | Begin after foundational inventory and risk triage |

## Next inspection sequence

1. Inventory repository files and route handlers that initialize Firebase Admin or access Firestore.
2. Trace data flows for user identity, consent, wallet, ledger, marketplace orders, payment callbacks and ANOSA evidence.
3. Classify each data path as persistent, ephemeral, derived/cache, mock/test-only, or unknown.
4. Map each operation to its authorization check and tenant/owner boundary.
5. Inspect deployed backup/retention settings and design an isolated restore drill.
6. Add focused tests for the highest-risk gaps before broad implementation.

## Acceptance criteria for closing the baseline phase

- Every critical collection and persistence adapter has an owner, schema, access path and retention classification.
- Every server-side privileged data path has a documented authorization control.
- Cross-user and cross-tenant denial tests pass.
- A known test record survives a controlled restart and a tested backup restore.
- Ledger persistence and idempotency are verified against the actual storage implementation.
- CI results and deployment configuration are recorded without exposing credentials.
- Findings are marked verified only when supported by reproducible evidence.
