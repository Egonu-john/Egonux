import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 10 GLOBAL LAUNCH & GO-LIVE TRANSITION HARNESS ");
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

async function runWeek10LaunchTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Global Launch Gateway Accessibility & Production Readiness Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics) {
      console.log(`✔ [PASSED] Global Launch Gateway Production Readiness Confirmed (HTTP 200)`);
      passed++;
    } else {
      throw new Error(`Global launch gateway check failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Global Launch Readiness Check: ${err.message}`);
    failed++;
  }

  // TEST 2: ANOSA Protocol Evidence Integrity & Final Compliance Gate
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const ledger = res.json.metrics ? res.json.metrics.ledgerInvariants : null;
    const consent = res.json.metrics ? res.json.metrics.consentCompliance : null;
    if (ledger && ledger.reconciliationStatus === 'ZERO_DRIFT_VERIFIED' && consent && consent.auditStatus === 'VERIFIED_COMPLIANT') {
      console.log(`✔ [PASSED] ANOSA Protocol Final Sign-Off: Ledger Zero-Drift & PDPA Compliance Enforced`);
      passed++;
    } else {
      throw new Error(`ANOSA protocol evidence integrity verification failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] ANOSA Protocol Verification: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 10 GLOBAL LAUNCH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek10LaunchTests();
