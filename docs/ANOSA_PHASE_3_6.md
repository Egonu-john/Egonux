# ANOSA Phase 3.6 — Review Policy Hardening

Phase 3.6 strengthens the Phase 3.5 human evidence-review lifecycle without enabling external execution.

## Controls

- Controlled review tests are registered by the server before they enter the queue.
- Cloud reviews must reference evidence owned by the authenticated founder.
- Review request IDs produce deterministic receipt IDs and safe replay behavior.
- Approved and rejected reviews are terminal.
- Escalated reviews may be resolved once as approved or rejected.
- Review state is maintained server-side; client writes remain denied by Firestore rules.
- Every receipt and transition remains append-only and external execution remains disabled.

## Validation

Run `npm run check`, `npm audit`, and `npm run test:rules` when the Firebase emulator is available.

Cloud KMS signing remains independently gated by Google Cloud billing and workload identity configuration.
