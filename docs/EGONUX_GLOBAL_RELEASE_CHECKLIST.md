# EGONUX OS — Global Release Checklist

Use this checklist for the 23 November 2026 readiness review and the 4 January 2027 release horizon. Dates are planning targets, not evidence of readiness.

## Evidence record

For every gate, record: commit SHA, command or test, environment, pass/fail, evidence link, owner, timestamp, and accepted exception. Do not mark a gate complete from an unverified claim.

## Repository and supply chain
- [ ] Environment files containing runtime configuration are removed from tracked source; only a sanitized `.env.example` remains.
- [ ] Secret scan covers the current tree and Git history; rotate any exposed credentials before production.
- [ ] CI uses `npm ci` and fails on dependency installation errors.
- [ ] Dependency review and CodeQL findings are triaged; no unresolved critical/high risk without documented approval.
- [ ] Production branch requires review and passing CI; release artifacts are traceable to a commit.

## Identity, privacy and authorization
- [ ] Authentication and session revocation work in production configuration.
- [ ] Server-side RBAC/ownership checks cover every privileged route and data mutation.
- [ ] Firestore rules tests cover unauthenticated, cross-user, cross-tenant, and privilege-escalation attempts.
- [ ] Consent is purpose-specific, auditable, revocable, and tied to a retention policy.
- [ ] Privacy/legal review covers Uganda requirements and every additional launch jurisdiction.

## Wallet and money movement
- [ ] Double-entry journal balances for every transaction; currency precision is defined.
- [ ] Idempotency, retries, concurrent writes, reversals, disputes and reconciliation are tested.
- [ ] Client input cannot set authoritative balances or bypass server-side checks.
- [ ] MTN MoMo/Airtel integrations are sandboxed until provider credentials, contracts, webhook verification, reconciliation and approvals are verified.
- [ ] No real-money staking, yield, escrow custody, tokenization or cross-border settlement without a specific legal/security release.

## Product and interface
- [ ] Obsidian/gold/emerald tokens are centralized and consistently applied.
- [ ] No prohibited white/light translucent container surfaces are introduced.
- [ ] Every user-facing interactive action follows the `( ACTION )` label convention.
- [ ] Keyboard navigation, focus visibility, contrast, mobile responsiveness and reduced-motion behavior are checked.
- [ ] Every domain is clearly labelled implemented, sandboxed, planned, blocked, or externally dependent.

## ANOSA and operational safety
- [ ] Read, Prepare, Approve and Execute permissions are distinct and audited.
- [ ] Execution remains disabled unless separately approved after threat modelling and control testing.
- [ ] Audit evidence excludes secrets and unnecessary personal data.
- [ ] Incident runbooks, owner escalation, key rotation, backups, restore tests and rollback are rehearsed.
- [ ] Monitoring verifies actual availability/error/latency; no SLA is claimed without measured evidence.

## Release gate
- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test:buttons`
- [ ] `npm run test:rules`
- [ ] Relevant identity, ledger, consent, API security, recovery and audit suites
- [ ] `npm run build`
- [ ] `npm run test:smoke` in production-like configuration
- [ ] Preview URL, production-like route checks, health checks and rollback verified
- [ ] Release owner approves the exact commit SHA

A passing CI run is necessary but not sufficient for production release. Unverified provider, legal, privacy, resilience or operational gates remain blockers.
