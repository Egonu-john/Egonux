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
- Deliberate approval confirmation and visible decision state.
- A local pause control and permanent v1 execution lock.
- A dedicated web app manifest for adding ANOSA to an Android home screen.
- Preview mode when authentication is disabled, clearly marked as non-live.

Prototype interactions use in-memory demonstration data and reset when the page reloads. They are not an audit log.

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
5. On Android Chrome, open the browser menu and choose **Add to Home screen** or **Install app**.

Do not activate live data connectors until server-side authorization, source-level consent, retention rules, audit storage, and incident controls have been reviewed.

## Next approved build gates

1. **Persistent approval ledger** — append-only records, timestamps, actor identity, scope hash, and revocation state.
2. **Source registry** — allowlisted connectors with owner, purpose, fields, freshness, and consent metadata.
3. **Grounded answer service** — citations for every operational claim and visible uncertainty.
4. **Step-up authentication** — recent authentication and MFA before sensitive approvals.
5. **Notification layer** — private founder alerts with no sensitive content on the lock screen.
6. **Execution service** — remains a separate future system; requires policy evaluation, dual controls, idempotency, audit evidence, and explicit founder authorization.

## Acceptance criteria for this milestone

- `/anosa` renders at 360 px width without horizontal overflow.
- An unauthenticated request redirects to sign-in when authentication is required.
- A signed-in non-founder cannot enter the route.
- Every screen presents the execution boundary truthfully.
- Approval requires an explicit checkbox and never invokes an external action.
- The official EGONUX logo is loaded from `/public/brand/egonux-primary-logo.png` without alteration.
- Lint, TypeScript, production build, and smoke checks pass.
