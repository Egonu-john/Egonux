# ANOSA Phase 3.8 — Evidence Monitoring and Incident Response

Phase 3.8 converts review-ledger verification into a controlled operational monitoring workflow without enabling external execution.

## Controls

- Founder-triggered, server-side review-ledger integrity checks.
- Healthy checks are read-only and do not create unnecessary records.
- Detected anomalies create deterministic, replay-safe incident records.
- Incidents classify broken receipts as high severity and state mismatches as medium severity.
- Incident evidence is immutable, permanently retained, and paired with an append-only audit event.
- Client writes to incident records are denied by Firestore rules.
- Founder-authenticated JSON integrity reports are downloadable for compliance review.
- No automatic evidence repair, connector action, or external execution is permitted.

## Validation

Run `npm run check`, `npm audit`, and `npm run test:rules` when the Firebase emulator is available.

Cloud KMS signing remains independently gated by Google Cloud billing and workload identity configuration.
