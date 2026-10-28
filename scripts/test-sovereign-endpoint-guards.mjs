import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = 3101;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["next", "dev", "-p", String(port)], {
  stdio: "ignore",
  env: {
    ...process.env,
    PORT: String(port),
    EGONUX_AUTH_REQUIRED: "true",
    EGONUX_SANDBOX_MODE: "true",
  },
});

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch(`${baseUrl}/api/os/pilot-observability`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Next.js test server did not start in time.");
}

async function post(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: baseUrl,
    },
    body: JSON.stringify(body),
  });
}

try {
  await waitForServer();

  const ledger = await post("/api/wallet/ledger", {
    idempotencyKey: "security-test-0001",
    amount: 1000,
    currency: "UGX",
  });
  assert.equal(ledger.status, 401, "ledger writes must reject unauthenticated callers");

  const decisions = await post("/api/anosa/decisions", {
    title: "Test proposal",
    rationale: "A synthetic test proposal with enough rationale.",
  });
  assert.equal(decisions.status, 401, "ANOSA proposals must reject unauthenticated callers");

  const ledgerStatus = await fetch(`${baseUrl}/api/wallet/ledger`);
  assert.equal(ledgerStatus.status, 200);
  const ledgerBody = await ledgerStatus.json();
  assert.equal(ledgerBody.invariants.duplicateEventsPrevented, 0, "rejected requests must not mutate ledger state");
  assert.equal(ledgerBody.externalExecution, "disabled");

  console.log("PASS: unauthenticated wallet-ledger write rejected (401)");
  console.log("PASS: unauthenticated ANOSA decision proposal rejected (401)");
  console.log("PASS: rejected wallet request did not mutate sandbox state");
  console.log("PASS: ledger route explicitly reports sandbox-only / external execution disabled");
} finally {
  server.kill("SIGTERM");
}
