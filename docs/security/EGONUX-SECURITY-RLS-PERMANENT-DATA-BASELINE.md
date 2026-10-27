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

At baseline, five tests covered:
- A member creating and reading an allowed profile.
- Rejection of a profile that attempts to assign a role.
- Rejection of client writes to audit and consent records.
- Founder versus member access to audit events.
- Founder readability and client immutability for selected ANOSA evidence.

**Additional tests added on the audit branch and executed locally:** cross-user profile read/update denial, post-creation role escalation and protected email mutation denial, and unknown-collection read/write denial. The expanded suite has eight test cases. On commit `bb490e277cf80371a51fe82fa2c2a74a4540a2bc`, the Firestore emulator test command exited successfully with `fail 0`, `cancelled 0`, `skipped 0`, and `todo 0` (duration approximately 6.8 seconds). This is local emulator evidence only; it does not establish GitHub Actions success or deployed production-rule parity.

**Still outstanding:** role-claim spoofing boundaries, tenant/organization isolation, query-level access patterns, operator least privilege, broader delete and field mutation cases, and all actual collections discovered in server code. The tests do not exercise Admin SDK bypass paths. GitHub Actions validation for this PR is still unconfirmed.

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

### F-07 — Core ledger engine uses process-local state and a local JSON audit file

**Evidence:** `lib/ledger/engine.ts` on the inspected authentication-hardening branch.

- `transactionStore` is a process-local `Map`; `idempotencyStore` is a process-local `Set`. Both reset when the process restarts and are not shared across server instances.
- Ledger audit records are appended to `data/audit.json` under `process.cwd()`. That path may be ephemeral or unavailable in a deployed/serverless runtime and must not be treated as durable storage without environment-specific proof.
- The audit hash chain's `lastKnownHash` is held in memory and starts from a fixed zero hash after process restart. It is not reconstructed from the file before new records are written.
- Audit write errors are logged and swallowed; the transaction can still return successfully even if audit persistence fails.
- The in-memory idempotency check and write sequence is not a cross-instance atomic operation.

**Risk:** this implementation is not suitable as the authoritative permanent ledger for production funds. Keep real-money processing disabled until an approved durable transactional store, atomic idempotency enforcement, audit-write failure policy, reconciliation, and recovery tests are implemented and verified.

### F-08 — Wallet ledger API returns simulated settlement data without a demonstrated trust boundary

**Evidence:** `app/api/wallet/ledger/route.ts` on the inspected branch.

- The route keeps idempotency records in a process-local `Map`.
- The POST handler does not demonstrate authentication or authorization before accepting a state-changing request.
- Missing amounts default to 50,000 UGX, missing account IDs default to a primary account, and the response reports `SETTLED` / `reconciled: true` with a fabricated transaction identifier and audit signature.
- The GET response reports hard-coded health/invariant claims rather than querying authoritative ledger state.

**Risk:** if this route is reachable in a deployed environment, its behavior could misrepresent a simulated action as a settled transaction. Confirm route exposure and callers; then explicitly label it sandbox-only or replace it with authenticated, authorized, durable transaction processing. Do not connect it to real-money providers in its current form.

### F-09 — Ecosystem endpoint uses marker-string checks and static module data

**Evidence:** `app/api/os/ecosystem/route.ts` on the inspected branch.

- Authentication is inferred from whether the Authorization header contains `Bearer egx_` or the cookie contains `egx_session=`; the endpoint does not verify a token or session through the shown logic.
- The response includes a hard-coded ADMIN role, wallet balance, marketplace counts, learning progress, tournament prize pool and community metrics.

**Risk:** these values must be treated as demonstration data, not authoritative user or financial state. Any sensitive action or personalized disclosure must use verified authentication and server-side authorization; production financial values must come from the authoritative ledger.

## Workstream status

| Workstream | Status | Next evidence required |
|---|---|---|
| 1. Authentication and authorization | Partial | Complete PR #41 release gate; inventory every protected API and role mapping |
| 2. RLS/document isolation | Expanded local emulator suite passed; CI and deployment parity unconfirmed | Obtain PR CI result; map collections and client/server access paths; test tenant boundaries |
| 3. Secrets and credential history | Partial | Complete repository/history secret scan and validate rotation/remediation without printing secrets |
| 4. API trust boundaries | High-risk findings identified | Inventory remaining routes; enforce verified auth, authorization and schema validation |
| 5. Permanent data inventory | High-risk findings identified; inventory incomplete | Trace all critical data paths and select an approved durable source of truth |
| 6. Ledger integrity | High-risk findings identified | Replace process-local authority with durable transactional persistence and atomic idempotency |
| 7. Backup and restore | Not verified | Inspect backup/export policy and execute isolated restore drill |
| 8. Data governance/audit | Partial | Map consent, audit, retention, export and deletion flows |
| 9–15. Integrations and operations | Not yet inspected comprehensively | Begin after foundational inventory and risk triage |

## Next inspection sequence

1. Inventory repository files and route handlers that initialize Firebase Admin or access Firestore.
2. Trace data flows for user identity, consent, wallet, ledger, marketplace orders, payment callbacks and ANOSA evidence.
3. Classify each data path as persistent, ephemeral, derived/cache, mock/test-only, or unknown; ledger Map/Set state and the local audit JSON file are not yet acceptable proof of durable ledger persistence.
4. Map each operation to its authorization check and tenant/owner boundary.
5. Inspect deployed backup/retention settings and design an isolated restore drill.
6. Run the expanded Firestore emulator suite; do not count the three newly authored tests as passed until an actual test run confirms the exit code.

## Acceptance criteria for closing the baseline phase

- Every critical collection and persistence adapter has an owner, schema, access path and retention classification.
- Every server-side privileged data path has a documented authorization control.
- Cross-user and cross-tenant denial tests pass.
- A known test record survives a controlled restart and a tested backup restore.
- Ledger persistence and idempotency are verified against the actual storage implementation.
- CI results and deployment configuration are recorded without exposing credentials.
- Findings are marked verified only when supported by reproducible evidence.
