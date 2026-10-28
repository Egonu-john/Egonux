# EGONUX Sovereign Hybrid Security Programme — v1.0

**Status:** Baseline and implementation plan; not a certification or assertion that controls are implemented.  
**Owner:** Founder & CEO, EGONUX  
**Sovereignty target:** Level 1 — sovereign hybrid  
**Priority:** Cybersecurity, ownership, access control  
**Delivery model:** Phased, low-cost/high-impact first  
**Baseline reviewed:** GitHub `main` at `9579f1f40618524946e4a7bd2b301fd2c2e3eff2` (2026-10-23). Reconfirm the baseline before each implementation change.

## 1. Mission and non-goals

EGONUX retains control of its source, application policy, identity and authorization design, data governance, key-management policy, release approval, security evidence, and recovery procedures. External hosting, identity verification, payment rails, DNS, communications, and security intelligence remain replaceable dependencies where practical.

This programme does not claim absolute independence from hardware, telecommunications, power, internet access, regulated payment networks, or upstream software maintainers. It does not authorize real-money activity or bypass licensing, privacy, AML/KYC, or provider obligations.

**Evidence before claims:** a control is only marked implemented after its behavior is demonstrated against a recorded commit or environment and evidence is retained.

## 2. Verified scope and preliminary observations

The repository's default branch is `main`. The inspected README describes a Next.js/Node.js application, Firebase/Firestore, sandbox financial flows, GitHub Actions CI, CodeQL, and a separate ANOSA workspace. These descriptions are project documentation, not independent proof of production behavior.

At the recorded baseline, `lib/auth/rbac.ts` contains a source-coded HMAC secret and a custom token format. Treat the value as exposed; determine all callers, deployed usage, and historical occurrences. If it has been used outside isolated tests, assess revocation/rotation and token invalidation. Do not assume changing the latest file removes historical exposure.

An open pull request, [#41](https://github.com/Egonu-john/Egonux/pull/41), proposes stricter validation and environment-sourced `JWT_SECRET`. It must be reviewed for compatibility, comprehensive unit tests, required CI results, and production secret readiness before merge. The PR is not itself proof of production remediation.

The main CI workflow runs install, lint, type checking, selected security harnesses, build, and smoke tests. CodeQL is configured for JavaScript/TypeScript and GitHub Actions. A workflow file's presence does not prove a successful result for every commit. Repository metadata showed the reviewed feature branch's protection as disabled; verify and configure rules for `main` in GitHub settings.

## 3. Target architecture

### 3.1 Application and policy boundaries
- Retain Next.js, Node.js, TypeScript, and Firebase/Firestore initially where the audit confirms they fit.
- Authenticate through a maintained, standards-based identity mechanism. Prefer phishing-resistant passkeys for privileged users where supported.
- Enforce authorization server-side at each API, service, database, and privileged-operation boundary. UI visibility is not authorization.
- Separate customer identity, staff/admin identity, service identities, deployment authority, and recovery authority.
- Keep payment, ledger, KYC, marketplace, learning, community, and ANOSA modules behind explicit service contracts and least-privilege policies.

### 3.2 Secrets and cryptographic authority
- Keep secrets out of source, build artifacts, logs, issue comments, and client bundles.
- Maintain an inventory of secret purpose, owner, consumers, storage, exposure status, rotation/revocation procedure, and last review.
- Use managed secret storage initially; restrict read access and audit secret access. Keep production secrets separate from preview and development.
- Prefer hardware-backed/non-exportable keys for high-impact signing and encryption when operationally justified.
- Never design a home-grown cryptographic algorithm. Document algorithm choices, key lifetimes, rotation, recovery, and compromise response.

### 3.3 Data and audit integrity
- Classify data and minimize collection and retention.
- Keep financial posting logic server-side with double-entry invariants, idempotency, concurrency controls, reconciliation, and explicit sandbox/production separation.
- Treat Firestore Security Rules and server-side IAM as separate enforcement layers. Admin SDK access must have explicit authorization and least privilege.
- Restrict client writes to audit, consent, governance, and financial evidence records. Keep security events attributable and independently retained; never log credentials or payment secrets.

### 3.4 Delivery and infrastructure
- Require reviewed pull requests and passing checks before merge. Production deployment requires a separate approval and recoverable artifact.
- Use pinned dependencies/lockfiles, dependency review, secret scanning, static analysis, SBOM generation where practical, and signed build provenance as maturity increases.
- Store deployment configuration as code and document a provider exit path. Do not migrate hosting solely for the appearance of sovereignty.
- Maintain encrypted backups under separately controlled access, with immutable/offline copies where feasible and periodic restoration exercises.

### 3.5 Monitoring and recovery
- Record authentication failures, authorization denials, role/permission changes, secret rotation, releases, and incident actions.
- Define incident severity, response owner, containment authority, evidence preservation, communications, and post-incident review.
- Set measurable RTO/RPO targets for identity, ledger, core application, and evidence storage. Verify them through exercises.

## 4. Access-control baseline

- Deny by default; grant the minimum permissions required for each task.
- Do not allow users to assign their own roles or trust client-supplied role claims.
- Separate developer, production operator, security reviewer, business approver, and recovery responsibilities.
- Require independent approval for high-impact production changes and key recovery where feasible.
- Break-glass access must be separately protected, time-limited, logged, and reviewed after use.
- Founder authority is preserved through explicit approval workflows, not through unaudited bypasses or unrestricted shared credentials.

## 5. Implementation phases and gates

### Phase 0 — Read-only baseline
Capture commit, branch, staged/unstaged/untracked state, repository permissions, branch protections, workflow status, dependency manifests, authentication call graph, secrets findings (redacted), and current test results. Do not alter source, deploy, rotate secrets, or rewrite history during baseline capture.

**Gate:** findings are reproducible, prioritized, and tied to the exact baseline SHA.

### Phase 1 — Critical identity and secret remediation
Review PR #41 and all token consumers. Confirm no production use of the hard-coded key, establish secret provisioning, reject malformed/expired/tampered tokens, use timing-safe signature comparison, test role boundaries, and plan revocation/rotation if exposure is confirmed.

**Gate:** no unresolved critical authentication finding affecting enabled production paths; focused tests and full required CI pass.

### Phase 2 — Authorization and repository governance
Map each privileged route and database operation to a server-side policy. Add negative tests. Enable protected `main`, required checks, pull-request review, least-privilege GitHub Actions permissions, and controlled production deployment.

**Gate:** unauthorized requests are denied in tests; branch rules and required checks are verified from GitHub settings.

### Phase 3 — Detection and release integrity
Run secret and dependency scanning, CodeQL, build checks, and security regression tests. Produce an SBOM and provenance/signing controls when they can be verified end-to-end. Establish audit-event retention and alert ownership.

**Gate:** findings are triaged and release artifacts are attributable to reviewed commits.

### Phase 4 — Independent recovery and portability
Create separately controlled encrypted backups, test restoration, document DNS/repository/provider recovery, and deploy a non-production instance in a second compatible environment.

**Gate:** restore and alternate deployment succeed with recorded RTO/RPO and data-integrity checks.

### Phase 5 — Independent assessment and production approval
Conduct risk-based penetration testing, validate financial invariants, review privacy/licensing/provider obligations, and close or formally contain release-blocking findings.

**Gate:** evidence package and named approval exist for each enabled production capability. A successful build alone is not launch approval.

## 6. Required engineering evidence

For every change, record: requirement ID, risk addressed, reviewed commit SHA, files changed, test command and exit code, CI run URL, reviewer/approver, deployment target if any, rollback/recovery procedure, and remaining risks. Redact secrets and personal data.

A status of `Pass` requires evidence from the exact commit or environment under review. Otherwise use `Not assessed`, `Fail`, or `Blocked`.

## 7. Acceptance criteria

1. No hard-coded production authentication or signing secrets remain in active code paths.
2. Exposed credentials are assessed for revocation/rotation; Git-history cleanup is not treated as revocation.
3. Authentication and authorization tests cover valid, missing, malformed, expired, tampered, wrong-role, and privilege-escalation cases.
4. Protected operations deny by default and are tested independently of the UI.
5. `main` requires reviewed changes and successful mandatory checks before merge.
6. Security workflows use least privilege and do not expose secrets in logs or artifacts.
7. Audit records are attributable and protected from ordinary client modification.
8. Encrypted backups restore successfully in an isolated environment.
9. A non-production alternate deployment and data-export procedure are demonstrated.
10. Real-money functions remain disabled until technical, operational, provider, and regulatory release gates are met.

## 8. Standards and reference baseline

Use the stable [OWASP Application Security Verification Standard 5.0.0](https://asvs.owasp.org/) for application control verification and [NIST Cybersecurity Framework 2.0](https://www.nist.gov/cyberframework) for governance, identification, protection, detection, response, and recovery. Map requirements to specific control identifiers as each control is implemented. Do not claim certification or compliance solely from referencing these frameworks.

## 9. Immediate next actions

1. Review and test open PR #41; do not merge on the basis of CodeQL alone.
2. Capture current local working state before syncing or modifying files.
3. Review the authentication call graph and any use of the legacy token format.
4. Verify branch protection and required checks for `main`.
5. Produce a redacted historical secret-scan report and rotate confirmed live exposures.
6. Add targeted tests, then run CI against the exact proposed commit.
7. Keep changes in small pull requests; no production enforcement until the corresponding gate is evidenced.
