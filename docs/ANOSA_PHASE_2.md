# ANOSA Phase 2 — Secure Founder Operating Layer

## Activated gates

1. **Live workflow verification** — UI, API, source, proposal, decision, and response boundaries are covered by production smoke tests.
2. **Step-up security** — decision writes require a verified founder email and an authentication event no older than 15 minutes. Stale sessions return `STEP_UP_REQUIRED` and route the founder through sign-in again.
3. **Governed source registry** — every source declares its owner, purpose, freshness, status, classification, location, and verification date.
4. **Founder daily brief** — ANOSA can prepare a grounded briefing and up to three priority proposals from the governed registry.
5. **Private notifications** — pending-decision and security notices are displayed inside the authenticated founder workspace without sensitive lock-screen payloads.
6. **Controlled draft actions** — ANOSA may prepare an exact email, task, GitHub-change, or brief preview. Approval records intent only; it never sends or applies the draft.
7. **GCP-ready architecture** — the connector contract is ready to move behind Cloud Run, ground analytics in BigQuery, use Vertex AI for governed inference, sign sensitive evidence with Cloud KMS, and export telemetry to Cloud Monitoring.

## Execution boundary

Phase 2 does not send messages, create external tasks, mutate GitHub, transfer funds, change access, publish content, or alter production. Those actions require a separate policy-enforced execution service with idempotency, dual control, step-up authentication, connector-specific consent, and complete audit evidence.

## Target architecture

| Layer | Current controlled implementation | Planned enterprise service |
| --- | --- | --- |
| Identity | Firebase ID token and founder role | Azure AD SAML to Firebase custom claims, phishing-resistant MFA |
| Intelligence | Vercel AI Gateway with grounded continuity mode | Vertex AI governed inference |
| Operational data | Allowlisted source registry | BigQuery authorized views |
| Connectors | Read-only server adapters | Private Cloud Run services |
| Evidence | Firestore create-only decision and audit records | Firestore plus Cloud KMS signatures and retention policy |
| Monitoring | Structured Vercel runtime logs and Speed Insights | Cloud Monitoring, Logging, alerting, and trace export |

## Release acceptance

- Sensitive approvals require recent verified authentication.
- Every source exposes governance metadata.
- Every draft is clearly labeled as preview-only.
- No Phase 2 endpoint performs external execution.
- Private API responses use `no-store`.
- Lint, TypeScript, production build, smoke tests, production deployment, and post-deploy error scan pass.
