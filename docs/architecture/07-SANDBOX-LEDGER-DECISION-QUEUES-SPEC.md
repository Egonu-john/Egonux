# EGONUX Design #7 — Runtime Sandbox Wallet Ledger Adapter & ANOSA Decision Queues

**Repository Module:** `EGONUX-SANDBOX-LEDGER-DECISION-QUEUES`  
**System Version:** `v3.4.0`  
**Governing Rule:** "Simulate first. Prove correctness. Reconcile. Obtain approval. Only then consider production financial integrations."  

---

## 1. Sandbox Wallet Ledger Rules

1. **Double-Entry Mandate:** Every posted transaction MUST consist of balanced debit and credit entries ($\sum \text{Debits} = \sum \text{Credits}$).
2. **Integer Arithmetic:** All currency amounts MUST be represented as integer minor units (e.g., $10.00 \text{ UGX} \rightarrow 1000$ minor units); binary floating-point representation for monetary values is strictly prohibited.
3. **Idempotency Guarantee:** Repeating a request with an existing `idempotencyKey` returns the stored result without duplicate debits or credits.
4. **State Machine Transitions:** State transitions are strictly restricted to: `created` $\rightarrow$ `pending` $\rightarrow$ `posted` $\mid$ `failed` $\mid$ `reversed` $\mid$ `reconciliation_required`.
5. **Fail-Closed Execution:** Real-money mobile money adapters remain hard-blocked until explicit Gate 4 Founder authorization and regulatory sign-off.

---

## 2. ANOSA Decision Queue & Governance Rules

1. **Exception Isolation:** Any ledger reconciliation discrepancy automatically triggers a `reconciliation_exception` and isolates the account.
2. **Founder Approval Gateway:** High-impact intents (such as limits adjustment, credential modifications, or code releases) are queued in `anosa_decisions` awaiting explicit Founder approval.
3. **Evidence Requirement:** No decision or task may be marked as resolved without linking to verifiable test outputs, logs, or audit records (`auditEvents`).

---

## 3. Data Entities

- `wallet_accounts`: Owner UID, currency, account type, and status.
- `ledger_transactions`: Transaction ID, idempotency key, state, and timestamp.
- `ledger_entries`: Immutable debits and credits.
- `idempotency_records`: Request fingerprints and cached responses.
- `reconciliation_exceptions`: Quarantined discrepancies for review.
- `anosa_decisions`: Proposals, evidence references, status, and approval sign-off.
