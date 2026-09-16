# ANOSA Personal Mobile v1

ANOSA is the private founder interface for EGONUX. Version 1 establishes a narrow authority model:

| Capability | v1 behavior | Boundary |
| --- | --- | --- |
| Read | Summarize approved EGONUX sources | No unrestricted browsing or hidden sources |
| Prepare | Draft briefs, recommendations, and proposed work | Drafts do not leave the workspace |
| Approve | Record an explicit founder decision after review | Approval is not execution |
| Execute | Unavailable | No money movement, publishing, messaging, trading, or production mutation |

## What is implemented

- A phone-first `/anosa` workspace using the official unchanged EGONUX logo.
- Founder-only server authorization when `EGONUX_AUTH_REQUIRED=true`.
- Today, Ask, Approval, and Security views.
- Vercel AI Gateway intelligence with a grounded deterministic continuity mode.
- Four allowlisted source summaries covering the enterprise MVP, ANOSA specification, security policy, and reviewed GitHub main branch.
- Structured proposals showing purpose, sources, impact, risk, and the execution boundary.
- Approve, reject, and request-changes decisions with explicit confirmation.
- A server-only Firestore decision ledger using create-only records, actor identity, timestamps, and a SHA-256 content hash.
- A corresponding append-only security audit event for each production decision.
- A local pause control and permanent v1 execution lock.
- A dedicated web app manifest, icons, safe asset-only service worker, and in-app installation control.
- Preview mode when authentication is disabled, clearly marked as non-live.

The device keeps a convenience copy of proposals and recent decisions. In founder-authenticated production, the server ledger is authoritative. Protected HTML, API responses, and founder data are never added to the service-worker cache.

## Founder review path

1. Run `npm ci` and `npm run dev`.
2. Open `http://localhost:3000/anosa` on a desktop or a phone on the same development network.
3. Review each tab and the full approval confirmation flow.
4. Confirm the copy, information hierarchy, and authority boundaries.
5. Approve the v1 product direction before any live source adapter or persistent approval ledger is added.

## Private activation

For a deployed founder-only review environment:

1. Configure the Firebase client values and approved Firebase Admin credentials.
2. Set `EGONUX_AUTH_REQUIRED=true` and configure `EGONUX_ALLOWED_ORIGINS` to the exact HTTPS origin.
3. During sandbox activation, set `EGONUX_FOUNDER_EMAILS` to the exact Firebase founder email. Production should replace the allowlist with the Firebase custom claim `roles: ['founder']` through an audited administrative process.
4. Revoke existing sessions after changing claims, then sign in at `/login?next=/anosa`.
5. Set `ANOSA_AI_MODEL` if overriding the approved default. Vercel deployments use AI Gateway OIDC; local development may use `AI_GATEWAY_API_KEY`.
6. On Android Chrome, tap **Install ANOSA on this phone**, or use **Add to Home screen** from the browser menu.

Do not activate customer, payment, messaging, identity-document, or financial connectors until source-level consent, retention rules, step-up authentication, audit storage, and incident controls have been reviewed.

## Future execution gates

1. **Step-up authentication** — recent authentication and phishing-resistant MFA before sensitive approvals.
2. **Connector governance** — owner, purpose, fields, freshness, consent, and retention metadata for each future data connector.
3. **Notification layer** — private founder alerts with no sensitive content on the lock screen.
4. **Execution service** — remains a separate future system and requires policy evaluation, dual controls, idempotency, audit evidence, and explicit founder authorization.

## Acceptance criteria for this milestone

- `/anosa` renders at 360 px width without horizontal overflow.
- An unauthenticated request redirects to sign-in when authentication is required.
- A signed-in non-founder cannot enter the route.
- Every screen presents the execution boundary truthfully.
- Approval requires an explicit checkbox and never invokes an external action.
- Each prepared answer identifies its intelligence engine, confidence, and approved sources.
- Production decisions are create-only, hashed, attributed, and mirrored into the audit stream.
- The app is installable without caching authenticated HTML or private API data.
- The official EGONUX logo is loaded from `/public/brand/egonux-primary-logo.png` without alteration.
- Lint, TypeScript, production build, and smoke checks pass.
