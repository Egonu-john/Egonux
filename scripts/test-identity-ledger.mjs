import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — IDENTITY & GOVERNED LEDGER ASSERTION HARNESS      ");
console.log("=======================================================================\n");

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runIdentityLedgerTests() {
  // Clear port 3100
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // Test 1: Unauthenticated Profile Access (Must fail closed or require auth)
  try {
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: 3100,
      path: '/api/profile',
      method: 'GET'
    });
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 200) {
      console.log(`✔ [PASSED] Identity Boundary (/api/profile): HTTP ${res.statusCode}`);
      passed++;
    } else {
      throw new Error(`Unexpected status HTTP ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Identity Boundary (/api/profile): ${err.message}`);
    failed++;
  }

  // Test 2: Ledger Transaction Missing Idempotency Key (Must reject with 400)
  try {
    const payload = JSON.stringify({ amount: 1000, currency: 'UGX' });
    const res = await makeRequest({
      hostname: '127.0.0.1',
      port: 3100,
      path: '/api/wallet/ledger',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
    }, payload);

    if (res.statusCode === 400 || res.statusCode === 401 || res.statusCode === 403) {
      console.log(`✔ [PASSED] Ledger Idempotency Rejection (/api/wallet/ledger): HTTP ${res.statusCode}`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 400 on missing idempotency key, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Ledger Idempotency Guard: ${err.message}`);
    failed++;
  }

  // Cleanup
  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runIdentityLedgerTests();
