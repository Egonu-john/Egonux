import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";

const port = 3101;
const base = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["next", "dev", "-p", String(port)], {
  stdio: "ignore",
  env: { ...process.env, EGONUX_AUTH_REQUIRED: "true" },
});

function request(path, { method = "GET", headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(new URL(path, base), { method, headers }, (res) => {
      let responseBody = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { responseBody += chunk; });
      res.on("end", () => {
        let json = {};
        try { json = JSON.parse(responseBody || "{}"); } catch {}
        resolve({ status: res.statusCode, json });
      });
    });
    req.on("error", reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 45; attempt++) {
    try {
      await request("/api/os/pilot-observability");
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Next.js test server did not start.");
}

try {
  await waitForServer();

  const ledgerAnonymous = await request("/api/wallet/ledger", {
    method: "POST",
    headers: { "content-type": "application/json", "x-egonux-sandbox": "true" },
    body: { idempotencyKey: "test-ledger-001", accountId: "test-account", amount: 1000, currency: "UGX" },
  });
  assert.equal(ledgerAnonymous.status, 401, "anonymous ledger writes must be rejected");

  const ledgerWithoutSandbox = await request("/api/wallet/ledger", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: { idempotencyKey: "test-ledger-002", accountId: "test-account", amount: 1000, currency: "UGX" },
  });
  assert.equal(ledgerWithoutSandbox.status, 401, "anonymous ledger writes must be rejected before payload processing");

  const decisionsAnonymous = await request("/api/anosa/decisions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: { title: "Test proposal", rationale: "This is a synthetic authorization test." },
  });
  assert.equal(decisionsAnonymous.status, 401, "anonymous ANOSA proposals must be rejected");

  const decisionsReadAnonymous = await request("/api/anosa/decisions");
  assert.equal(decisionsReadAnonymous.status, 401, "anonymous ANOSA decision reads must be rejected");

  console.log("Endpoint guard tests: 4 passed, 0 failed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  server.kill("SIGTERM");
}
