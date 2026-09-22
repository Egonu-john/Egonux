# ANOSA Phase 3.9 — Containment and Recovery Drill

Phase 3.9 adds a founder-controlled, simulation-only resilience drill on top of the Phase 3.8 integrity incident ledger.

## Controls

- Requires founder access and a recent verified sign-in.
- Requires the Phase 3.7 review ledger to be verified before a drill can start.
- Simulates containment as isolated and recovery as verified.
- Creates an immutable, append-only Firestore receipt and audit event.
- Uses request identifiers for replay-safe idempotency.
- Keeps connectors and every external side effect disabled.
- Fails closed when identity, cloud evidence, or integrity verification is unavailable.

## Firestore records

- `anosaRecoveryDrills`: permanent drill receipts.
- `auditEvents`: permanent `anosa.recovery.drill.completed` evidence.

Client applications may read these records only with founder or compliance authority and can never write them directly.
