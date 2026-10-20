# EGONUX TIRP Release Signing and Recovery Controls

## Release provenance and signing

The source snapshot is attested only by the `attest-source` job in `.github/workflows/ci.yml`, after the full quality gate succeeds on a push to `main`. Pull requests cannot mint this attestation. GitHub Actions OIDC and GitHub artifact attestations provide keyless cryptographic provenance; no long-lived private signing key is stored in the repository.

The attested subject is a source archive of the exact validated commit. It is **not** the deployed Vercel build artifact and does not prove the application is vulnerability-free. Production deployment must remain disabled until a deployment integration verifies the actual artifact being deployed.

### Verify a source archive

Requirements: GitHub CLI (`gh`) installed and authenticated with permission to read repository attestations.

```sh
git archive --format=tar.gz --output=egonux-source.tar.gz <COMMIT_SHA>
node scripts/tirp-release.mjs verify \
  --artifact egonux-source.tar.gz \
  --repo Egonu-john/Egonux \
  --workflow .github/workflows/ci.yml \
  --source-ref refs/heads/main
```

Use the exact source ref and signer workflow that produced the attestation. Verification fails closed if GitHub CLI is missing, the attestation is absent/invalid, or repository/workflow/ref policy does not match. The CLI verifies a local artifact against the attestation fetched from GitHub; it does not deploy it.

## Recovery bundle validation

A recovery bundle should contain an independently protected SHA-256 manifest and every listed file. Verify it before any restoration:

```sh
node scripts/tirp-recovery.mjs verify \
  --root /secure/path/to/recovery-bundle \
  --manifest tirp-manifest.json
```

The command is read-only. It rejects missing, changed, unsafe-path and symlinked files. It never restores, overwrites or deletes files. A matching hash proves only that the files match the supplied manifest; it does not prove the manifest is authentic or that restoration is authorized. Store the expected manifest in an independently protected location.

## Required recovery approval and custody controls

Before restoring production data:
1. Create an incident/change ticket and identify the exact environment and dataset in scope.
2. Obtain authenticated approval from the designated recovery authority; use a separately authorized second approver for critical or financial data.
3. Confirm that the backup and its expected manifest are protected from the compromised production credentials.
4. Validate the bundle in an isolated clean environment and reconcile data-specific invariants.
5. Record approvers, backup identifier, source release, hashes, test evidence, and recovery outcome in an independent audit destination.
6. Restore only through the approved provider-specific procedure. Verify application health and reconciliation before reopening access.

A recovery approval must not be accepted solely because a JSON field, typed name or signature image says that someone approved it. Approval evidence must come from the configured access-control and audit system.

## Controls not yet enabled

- No production deployment is gated by attestation yet.
- No live database or cloud backup provider is read/written by the recovery CLI.
- No production data is restored by this code.
- GitHub branch protection and required status checks could not be configured through the available integration. The repository owner must enable them in GitHub Settings before merging or production release.
- Configure a protected GitHub Environment for recovery operations, with designated required reviewers, before any future automation is allowed to perform restoration.
