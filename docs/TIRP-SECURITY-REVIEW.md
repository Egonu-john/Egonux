# EGONUX TIRP Security Review

**Review date:** 2026-10-20  
**Scope:** TIRP foundation PR, repository CI workflow, anonymous API smoke-test expectations, release provenance, and recovery validation.  
**Decision:** Keep production enforcement disabled until all release gates below are satisfied.

## Findings and actions

| Severity | Finding | Action / status |
|---|---|---|
| High | The prior smoke test expected HTTP 200 from `/api/anosa/context` without a founder session, conflicting with the route's authentication boundary. | Updated smoke coverage to expect HTTP 401 from protected ANOSA APIs when called anonymously. Full CI must pass on the current PR head before closure. |
| High | Source attestation was initially independent of the full application quality gate, so an archive could be attested even if unrelated application checks failed. | Moved attestation into the main CI workflow as a separate job with `needs: validate`; only push-to-main after the entire quality gate can attest source and build-output archives. |
| High | A SHA-256 manifest alone is not an authenticated trust anchor because both files and manifest could be replaced. | Added GitHub artifact attestation and a verifier that pins repository, signer workflow, and source ref. The attested item is a source archive, not the Vercel deployment artifact. |
| High | Automatic restoration or deletion could cause irreversible data loss or be triggered by an attacker. | Recovery CLI is read-only; validates listed files and never restores, overwrites or deletes. Actual restoration remains a separate approved provider-specific operation. |
| High | Repository branch-protection and required-status-check settings could not be read or changed through the connected GitHub integration. | Owner action required: configure branch protection/rulesets and required CI checks in GitHub Settings. Do not treat this PR's existence as a branch-protection guarantee. |
| Medium | Recovery verification cannot prove approval authenticity or backup independence by itself. | Documentation requires independent backup custody, authenticated approval, a second approver for critical/financial data, and audit evidence from the configured control plane. |
| Medium | The new attestations do not yet enforce what Vercel deploys. | Keep production enforcement disabled until the actual deployed artifact is attested and the deployment path verifies that attestation before promotion. |
| Low | Existing GitHub Actions use version tags and runner logs report Node 20 deprecation notices for some actions. | Follow-up: pin third-party actions to reviewed full commit SHAs and upgrade to supported action releases after verifying compatibility. |

## Current validation evidence

- TIRP integrity/release/recovery tests: 11 tests passed on commit `2c5283bfca9a1f23196aa2bc44b7cd9136924c96`. This run predates the final smoke-test-only commit.
- CodeQL passed on the earlier foundation commit; the current branch's CodeQL result must be checked separately.
- Full CI previously failed because the anonymous API smoke-test expectation was outdated. The test was corrected; the full quality gate on the latest commit must complete successfully before this finding can be closed.
- No production deployment, data restore, destructive action, or production enforcement was performed by this change.

## Production release gates

1. Current-head CI, TIRP tests, and CodeQL all pass.
2. Configure protected branches/rulesets, required status checks, and review requirements in GitHub.
3. Verify source attestation from the expected workflow and exact source ref.
4. Build and attest the actual deployable artifact; enforce verification before Vercel promotion.
5. Establish an independently protected backup destination and demonstrate a restore/reconciliation drill in an isolated environment.
6. Configure a protected recovery environment with designated approvers and independent audit retention.
7. Review monitoring, rollback and incident-response procedures before enabling production enforcement.

**No automatic core-data deletion is permitted.**
