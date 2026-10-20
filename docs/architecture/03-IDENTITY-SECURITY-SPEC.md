# EGONUX Identity & Security — Legacy-Grade Authentication Blueprint

**Repository Module:** `EGONUX-IDENTITY-SECURITY`  
**System Version:** `v3.4.0`  
**Security Governance:** OWASP ASVS v4.0 / NIST SP 800-63B Compliant  
**Governing Rule:** "One Identity. One Trust Standard. Controlled Access. Verifiable Actions."  

---

## 1. Non-Negotiable Security Policies

1. **Production Fail-Closed:** Missing or invalid environment configurations MUST fail closed. No synthetic `founder-preview` principals allowed in production.
2. **Server-Side Enforcement:** UI component hiding is not authorization. Every API handler and database query must independently verify permissions.
3. **Cookie Security:** Session cookies (`egonux_session`) must be `HttpOnly`, `Secure`, `SameSite=Strict`, and cryptographically signed.
4. **Authoritative Roles:** Roles are assigned exclusively via trusted server processes or claim verifiers, never from editable request bodies or client profile fields.
5. **No Secret Leakage:** Audit events and server logs MUST NEVER store plain-text passwords, raw session cookies, access tokens, or recovery secrets.

---

## 2. Controlled Role Catalog (RBAC)

| Role | Operational Scope & Permissions |
| :--- | :--- |
| **`member`** | Access to personal profile, own consents, and general platform modules. |
| **`agent`** | Authorized agent operations, client onboarding, and field transactions. |
| **`support`** | Bounded user-support tooling without direct access to private credentials or ledger state. |
| **`reviewer`** | Assigned review tasks, compliance audits, and evidence verification. |
| **`admin`** | Operational system administration, platform configuration, and user management. |
| **`founder`** | Platform-level governance and oversight. (Requires step-up MFA for destructive actions). |

---

## 3. Implementation Checklist

- [ ] **A. Session Normalization:** Unify session cookie creation and lifetime checks (`lib/auth/session.ts` vs `pages/api/auth/session.ts`).
- [ ] **B. Explicit Revocation:** Implement true server-side token invalidation upon sign-out.
- [ ] **C. ANOSA Security Guard:** Eliminate `founder-preview` fallback when `EGONUX_AUTH_REQUIRED="true"`.
- [ ] **D. Audit Persistence:** Make mandatory audit event logging durable and fail-safe.
- [ ] **E. Rule Suite Validation:** Verify Firestore security rules using local emulator suites (`npm run test:rules`).
