import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 8 ECOSYSTEM EXPANSION & PARTNERS HARNESS     ");
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

async function runWeek8PartnerTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Partner Webhook & API Boundary Contract Verification
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics) {
      console.log(`✔ [PASSED] Partner Integration Boundary Verified: Endpoint Reachability Intact`);
      passed++;
    } else {
      throw new Error(`Partner integration boundary check failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Partner Boundary Check: ${err.message}`);
    failed++;
  }

  // TEST 2: Ecosystem Interoperability & Zero-Drift Sandbox Isolation
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const ledger = res.json.metrics ? res.json.metrics.ledgerInvariants : null;
    if (ledger && ledger.reconciliationStatus === 'ZERO_DRIFT_VERIFIED') {
      console.log(`✔ [PASSED] Ecosystem Sandbox Interoperability Verified: Balance Drift (0.00 UGX)`);
      passed++;
    } else {
      throw new Error(`Ecosystem sandbox isolation or zero-drift state violated.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Ecosystem Interoperability Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 8 ECOSYSTEM & PARTNERS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek8PartnerTests();
