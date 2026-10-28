import assert from "node:assert/strict";
import { POST as postLedger, GET as getLedger } from "../app/api/wallet/ledger/route.ts";
import { POST as postDecision, GET as getDecisions } from "../app/api/anosa/decisions/route.ts";

process.env.EGONUX_AUTH_REQUIRED = "true";
process.env.EGONUX_SANDBOX_MODE = "true";

const jsonHeaders = {
  "content-type": "application/json",
  origin: "http://localhost:3000",
};

const ledgerWrite = await postLedger(new Request("http://localhost:3000/api/wallet/ledger", {
  method: "POST",
  headers: jsonHeaders,
  body: JSON.stringify({
    idempotencyKey: "security-test-0001",
    amount: 1000,
    currency: "UGX",
  }),
}));
assert.equal(ledgerWrite.status, 401, "ledger writes must reject unauthenticated callers");

const decisionWrite = await postDecision(new Request("http://localhost:3000/api/anosa/decisions", {
  method: "POST",
  headers: jsonHeaders,
  body: JSON.stringify({
    title: "Test proposal",
    rationale: "A synthetic test proposal with enough rationale.",
  }),
}));
assert.equal(decisionWrite.status, 401, "ANOSA proposals must reject unauthenticated callers");

const ledgerStatus = await getLedger();
assert.equal(ledgerStatus.status, 200);
const ledgerBody = await ledgerStatus.json();
assert.equal(ledgerBody.invariants.duplicateEventsPrevented, 0, "rejected requests must not mutate ledger state");
assert.equal(ledgerBody.externalExecution, "disabled");
assert.equal(ledgerBody.status, "SANDBOX_ONLY");

const decisionRead = await getDecisions();
assert.equal(decisionRead.status, 200);
const decisionBody = await decisionRead.json();
assert.equal(decisionBody.decisions[0].status, "DEMO_ONLY_NOT_APPROVED");
assert.equal(decisionBody.decisions[0].approver, null);

console.log("PASS: unauthenticated wallet-ledger write rejected (401)");
console.log("PASS: unauthenticated ANOSA proposal rejected (401)");
console.log("PASS: rejected wallet request did not mutate sandbox state");
console.log("PASS: ledger reports sandbox-only and external execution disabled");
console.log("PASS: demo ANOSA decision is explicitly not approved");
