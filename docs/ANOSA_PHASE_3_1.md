# ANOSA Phase 3.1 — Permanent Cloud Evidence

Phase 3.1 promotes founder decisions, controlled-execution intents, and activation canaries from integrity-hashed device receipts to an append-only Firestore ledger. External execution remains disabled.

## Security contract

- Server writes use create-only Firestore batches; clients cannot create, update, or delete evidence.
- Every record contains a SHA-256 content hash, schema version, actor, server receipt time, immutable marker, and permanent retention class.
- Each business record and its audit event are committed atomically.
- Vercel Functions supply a short-lived OIDC token in the protected request context; the server exchanges it through Google Workload Identity Federation. No Google service-account key is stored in GitHub or Vercel.
- Production stays on the device ledger unless `ANOSA_FIRESTORE_LEDGER_ENABLED=true` and the identity configuration is complete.
- `/api/anosa/evidence-health` exposes only boolean readiness. Its step-up-protected POST performs a create/read canary and retains the canary as evidence.

## Activation sequence

1. Confirm Firestore exists in the `egonux-wealth-central-hub` Google Cloud project and choose its permanent region.
2. From an authenticated Google Cloud shell, export `GCP_PROJECT_ID`, `GCP_PROJECT_NUMBER`, `VERCEL_TEAM_SLUG`, and `VERCEL_PROJECT_NAME`, review `infra/gcp/phase-3-1/provision.sh`, then run it once.
3. Add the emitted `GCP_WIF_AUDIENCE` and `GCP_SERVICE_ACCOUNT_EMAIL` to Vercel Production. Do not create or upload a service-account JSON key.
4. Deploy Firestore rules and indexes: `firebase deploy --only firestore:rules,firestore:indexes --project egonux-wealth-central-hub`.
5. Enable Vercel OIDC and redeploy so `VERCEL_OIDC_TOKEN` is available at runtime.
6. Set `ANOSA_FIRESTORE_LEDGER_ENABLED=true`, redeploy, sign in recently as Founder, and POST `/api/anosa/evidence-health`.
7. Promote only when the response is `201`, `verified=true`, and `persistence=firestore`. If it fails, immediately set the ledger flag to false and redeploy; device receipts continue and external execution remains disabled.

## Retention and recovery

Evidence has no TTL and must not be bulk-deleted. Before production activation, enable Firestore point-in-time recovery or scheduled backups under an approved billing and retention policy. Recovery is performed into a separate database/project, validated by content hashes, and never overwrites the primary ledger in place. Place legal holds and export requirements under compliance ownership.

## Promotion gate

Phase 3.1 is active only when all are true: production-only identity condition, least-privilege service account, rules and indexes deployed, canary write/read verified, no credentials committed, and rollback tested. The canary proves evidence storage only; it never authorizes email, GitHub, task, financial, identity, or production changes.
