# ANOSA Phase 3.4 — Google Cloud KMS Evidence Signing

Phase 3.4 adds asymmetric signatures to new ANOSA evidence records. The signing key is non-exportable in Cloud KMS, Vercel uses short-lived workload identity, and external execution remains disabled.

## Security boundary

- New signed records use evidence schema v3; historical schema v1/v2 records remain immutable and verifiable as legacy hashes.
- ANOSA sends only a SHA-256 digest of the content hash to Cloud KMS.
- The private key never enters the application, Vercel, GitHub, environment variables, or the founder device.
- Evidence and its audit twin carry the same KMS signature.
- Verification retrieves the public key and validates every schema-v3 signature.
- When `ANOSA_KMS_SIGNING_ENABLED=true`, signing failure aborts the evidence write. There is no unsigned fallback.

## Activation

1. Run `infra/gcp/phase-3-4/provision.sh` with `GCP_PROJECT_ID` and `GCP_SERVICE_ACCOUNT_EMAIL` set.
2. Add the printed `ANOSA_KMS_KEY_VERSION` and `ANOSA_KMS_SIGNING_ENABLED` values to Vercel Production only.
3. Redeploy production and confirm **Cloud KMS signatures — Ready**.
4. Run the permanent evidence canary. It must report a Cloud KMS signature.
5. Create one new approved simulation and run **Verify evidence audit trail**.
6. Accept only a verified schema-v3 entry marked **KMS signed**, zero broken links, and execution disabled.
