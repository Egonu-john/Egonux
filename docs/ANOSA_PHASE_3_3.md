# ANOSA Phase 3.3 — Evidence Verification and Audit Trail

Phase 3.3 makes permanent Phase 3 evidence independently reviewable inside the authenticated founder workspace. It does not enable external execution.

## Controls

- `/api/anosa/evidence-verification` is founder-authenticated, read-only, and never mutates ledger records.
- Decision and simulation receipts are checked for the immutable envelope, schema version, permanent retention, actor ownership, SHA-256 format, and a matching audit event.
- Audit events must reference the same evidence ID and content hash and use the expected event type.
- Both immutable schema v1 receipts from Phase 3.1 and schema v2 receipts from Phase 3.2 are verified against their original audit twins; records are never rewritten during verification.
- Broken or missing links are surfaced as `attention`; they are never silently treated as verified.
- The Control screen displays verification totals and a bounded recent audit trail.
- Email, tasks, GitHub, payments, identity changes, and production actions remain disabled.

## Production acceptance

1. Deploy with the existing Phase 3.2 Firestore and workload-identity configuration.
2. Sign in as Founder and open **ANOSA → Control**.
3. Confirm the label reads **Phase 3.3 · Verification & Audit**.
4. Tap **Verify evidence audit trail**.
5. Accept only `Evidence chain verified`, zero broken links, and `Execution disabled`.
