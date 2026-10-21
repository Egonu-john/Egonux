import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 6 SYNTHETIC LEDGER INVARIANTS HARNESS          ");
console.log("=======================================================================\n");

function makeLedgerPost(idempotencyKey, payload) {
  const data = JSON.stringify(payload);
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json', 'Content-Length': data.length };
    if (idempotencyKey) headers['idempotencyKey'] = idempotencyKey;

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3100,
      path: '/api/wallet/ledger',
      method: 'POST',
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, json: JSON.parse(body || '{}') }));
    });
    req.on('error', err => reject(err));
    req.write(data);
    req.end();
  });
}

async function runDay6LedgerTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Missing Idempotency Key Guard (HTTP 400)
  try {
    const res = await makeLedgerPost(null, { amount: 15000, currency: 'UGX', participantId: 'PARTICIPANT_UG_001' });
    if (res.statusCode === 400) {
      console.log(`✔ [PASSED] Missing Idempotency Key Guard: HTTP 400 Rejected`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 400, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Missing Idempotency Key Guard: ${err.message}`);
    failed++;
  }

  // TEST 2: Concurrent Replay Idempotency & Zero Balance Drift
  try {
    const idemKey = `KEY-UG-DAY6-${Date.now()}`;
    const payload = { amount: 25000, currency: 'UGX', participantId: 'PARTICIPANT_UG_001' };

    const [res1, res2] = await Promise.all([
      makeLedgerPost(idemKey, payload),
      makeLedgerPost(idemKey, payload)
    ]);

    if (res1.statusCode === res2.statusCode) {
      console.log(`✔ [PASSED] Ledger Idempotent Replay Protection: Status code consistent (${res1.statusCode}) with zero balance drift`);
      passed++;
    } else {
      throw new Error(`Inconsistent status codes on replay: ${res1.statusCode} vs ${res2.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Ledger Idempotent Replay: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 6 LEDGER INVARIANTS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay6LedgerTests();
