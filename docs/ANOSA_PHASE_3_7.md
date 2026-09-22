# ANOSA Phase 3.7 — Review Audit Integrity

Phase 3.7 adds founder-only administrative verification for the complete human-review ledger without enabling external execution.

## Controls

- Recomputes every review receipt hash from its authoritative payload.
- Confirms deterministic receipt IDs and immutable permanent-evidence envelopes.
- Requires a matching append-only audit event for each receipt.
- Verifies escalated-to-terminal transition links through `previousReviewId`.
- Confirms each current review state points to a matching receipt.
- Returns a read-only integrity summary; verification never mutates evidence.
- External execution remains disabled.

## Validation

Run `npm run check`, `npm audit`, and `npm run test:rules` when the Firebase emulator is available.

Cloud KMS signing remains independently gated by Google Cloud billing and workload identity configuration.
