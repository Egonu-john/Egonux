# ANOSA Phase 4.1 — Work-Package Registry

Phase 4.1 turns the Phase 4.0 release sequence into an accountable registry of thirteen MVP work packages.

## Controls

- Each package has an owner, risk level, status, dependencies, and acceptance evidence.
- KYC/AML and customer profiles is the only package in `planned` state.
- Wallet, payments, commerce, learning, community, ANOSA, and production certification remain dependency-gated.
- Recording requires a verified Phase 4.0 release simulation and recent founder step-up authentication.
- Registry snapshots are deterministic, idempotent, append-only, and permanently audited.
- Client writes are denied by Firestore rules.
- Recording the registry does not authorize implementation, deployment, messaging, access mutation, or money movement.

## Next gate

Phase 4.2 may evaluate dependency evidence for the KYC/AML work package. Until then, it remains planning-only.
