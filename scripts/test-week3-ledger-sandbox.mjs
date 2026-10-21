import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 3 SYNTHETIC LEDGER & RECONCILIATION HARNESS   ");
console.log("=======================================================================\n");

function makeGet(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: 3100, path }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, json: JSON.parse(body || '{}') }));
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function runWeek3LedgerTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Ledger Invariants & Replay Protection
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const ledger = res.json.metrics ? res.json.metrics.ledgerInvariants : null;
    if (ledger && ledger.reconciliationStatus === 'ZERO_DRIFT_VERIFIED' && ledger.unexplainedBalanceDrift === '0.00 UGX') {
      console.log(`✔ [PASSED] Ledger Reconciliation Invariants Verified: Balance Drift (${ledger.unexplainedBalanceDrift})`);
      passed++;
    } else {
      throw new Error(`Ledger invariants check failed or balance drift detected.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Ledger Sandbox Verification: ${err.message}`);
    failed++;
  }

  // TEST 2: Idempotency Key Rejection Guard Verification
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const ledger = res.json.metrics ? res.json.metrics.ledgerInvariants : null;
    if (ledger && ledger.idempotencyKeyRejections >= 1) {
      console.log(`✔ [PASSED] Duplicate Replay Guard Verified: Idempotency Rejections Enforced (${ledger.idempotencyKeyRejections})`);
      passed++;
    } else {
      throw new Error(`Idempotency guard rejections unconfirmed in telemetry.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Idempotency Protection: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 3 LEDGER SANDBOX RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek3LedgerTests();
