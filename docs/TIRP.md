# EGONUX Trust Integrity & Recovery Protocol (TIRP)

**Owner:** EGONUX WEALTH CENTRAL HUB  
**Accountable authority:** Founder & CEO  
**Status:** Foundation implementation; deployment enforcement not yet enabled  
**Version:** 1.0

## Purpose

TIRP provides a controlled foundation for software integrity, release provenance, incident evidence and recovery. Its governing rule is **fail closed for untrusted releases, preserve evidence, and recover rather than destroy core data**.

This document describes implemented foundation controls and planned controls separately. A documented control is not evidence that a production environment enforces it.

## Non-negotiable safety rules

1. Never automatically delete source code, user records, financial records, consent records, audit evidence or backups in response to a suspected compromise.
2. Block or quarantine untrusted build artifacts at a defined trust boundary; do not assume a file-hash check inside a compromised process is sufficient.
3. Keep signing credentials outside the repository and outside application runtime access.
4. Keep audit evidence and recovery credentials independently protected from the workload being protected.
5. ANOSA may analyze, recommend and prepare evidence. Consequential actions require authenticated approval under the approved governance policy.
6. Emergency containment may be automated only within explicit, tested and least-privilege boundaries.
7. Do not describe a release as signed, verified, protected or production-enforced unless the relevant verification evidence exists.

## Trust boundaries

- **Source control:** branch rules, reviewed changes, least-privilege repository access and protected workflow definitions.
- **Build pipeline:** locked dependencies, tests, build output, provenance and narrowly scoped workflow permissions.
- **Release artifact:** a stable artifact digest tied to its source commit and build workflow.
- **Runtime and data:** authorization checks, secret isolation, audit records, and separate backup/recovery access.
- **Recovery plane:** clean environment, independent credentials, verified release, data reconciliation and recorded approval.

## Implemented foundation in this change

- A dependency-free Node.js CLI creates and verifies SHA-256 manifests for explicitly selected regular files.
- Verification rejects missing files, changed contents, malformed manifests, duplicate entries, symlinks and unsafe relative paths.
- Automated tests exercise successful verification and negative/tampering cases.
- The dedicated TIRP workflow runs integrity, release-policy and recovery validation tests on pull requests and pushes to `main`.
- The main quality-gate workflow creates a source archive attestation only after lint, type-check, Firestore rules tests, TIRP tests, production build and smoke tests all pass on a push to `main`.
- `scripts/tirp-release.mjs` verifies an archive's GitHub artifact attestation against the expected repository, signer workflow and source ref.
- `scripts/tirp-recovery.mjs` validates recovery-bundle file hashes in read-only mode and never restores, overwrites or deletes data.

The manifest CLI is a drift detector, not a signature system. A party able to replace both a file and its manifest can produce a matching pair. Keep the expected manifest in a separately protected location. GitHub artifact attestations provide keyless cryptographic provenance for the source archive; no long-lived private signing key is committed to the repository. This attestation does not, by itself, prove that a Vercel deployment is enforcing integrity or that the application build is safe.

## CLI

Create a manifest for a deliberate list of files:

```sh
node scripts/tirp-integrity.mjs create --root . --output .tirp/manifest.json --files README.md package.json scripts/tirp-integrity.mjs
```

Verify those files later against that manifest:

```sh
node scripts/tirp-integrity.mjs verify --root . --manifest .tirp/manifest.json
```

Treat the manifest as a sensitive release record. Do not commit secrets or private keys into it. Do not use a manifest generated from the same untrusted state as the only production trust decision.

## Trust-state response policy

- **UNVERIFIED:** no authorization claim has yet been established; do not release.
- **VERIFIED:** required artifact, provenance and policy checks pass.
- **SUSPICIOUS:** anomaly needs further verification; preserve evidence and alert.
- **QUARANTINED:** reject the release or isolate the affected component.
- **RECOVERY:** restore a known-good artifact and, if needed, data from a trusted backup.
- **RESTORED:** integrity and reconciliation checks pass and the authorized release decision is recorded.

Only transition to a trusted state after the relevant checks pass. An alert alone must never trigger destructive data actions.

## Incident evidence

The future operational audit event should include: event ID, UTC timestamp, environment, actor/service identity, action, affected release or resource, expected and observed digest where applicable, verification result, severity, containment outcome, approval reference, and recovery outcome. Avoid secrets and unnecessary personal data in logs. Store production audit records in a separately controlled destination with restricted write access and retention policies.

## Recovery policy

- Revoke affected sessions and credentials using approved procedures.
- Preserve logs, relevant snapshots and incident metadata.
- Restore the application into a clean environment from a verified release.
- Restore data only from an independently protected backup; validate integrity and reconcile important records.
- Record approver, backup/version used, test evidence and final status.
- Test recovery periodically and document recovery time and recovery point objectives before claiming they are met.

## Not yet implemented / production gates

This foundation does **not** yet configure GitHub branch protection, independent immutable production audit storage, a backup vault, automatic runtime isolation, deployment-time attestation enforcement, Vercel rollback automation or production data restoration. These require separate configuration, credentials, provider permissions and end-to-end tests. GitHub branch-protection settings were not accessible to the integration, so the repository owner must configure required checks and review rules in GitHub Settings. The workflow does not automatically deploy or change production.

## Acceptance criteria

- Valid manifest passes.
- Modified or missing protected file fails verification.
- Invalid schema, unsafe path, duplicate path and symlink fail closed.
- CI runs the TIRP tests on pull requests and main pushes.
- Source provenance attestation is attempted only after successful validation on a push to main.
- No automated response deletes core data.
- Production adoption remains blocked until a trusted release policy, independent recovery controls and a tested deployment integration are reviewed.
