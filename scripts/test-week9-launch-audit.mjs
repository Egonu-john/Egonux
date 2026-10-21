import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 9 FINAL LAUNCH AUDIT & GOVERNANCE HARNESS      ");
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

async function runWeek9AuditTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Statutory Compliance & PDPA 2019 Audit Verification
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const consent = res.json.metrics ? res.json.metrics.consentCompliance : null;
    if (res.statusCode === 200 && consent && consent.auditStatus === 'VERIFIED_COMPLIANT') {
      console.log(`✔ [PASSED] Pre-Launch Legal Audit Verified: Uganda PDPA 2019 (${consent.auditStatus})`);
      passed++;
    } else {
      throw new Error(`Statutory audit verification failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Pre-Launch Audit Check: ${err.message}`);
    failed++;
  }

  // TEST 2: Evidence Integrity & Cohort Safety Sign-Off
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const cohort = res.json.metrics ? res.json.metrics.activeCohortSize : null;
    const ledger = res.json.metrics ? res.json.metrics.ledgerInvariants : null;
    if (cohort === 2 && ledger && ledger.unexplainedBalanceDrift === '0.00 UGX') {
      console.log(`✔ [PASSED] Evidence Integrity Confirmed: Cohort Locked (${cohort}) & Balance Drift (0.00 UGX)`);
      passed++;
    } else {
      throw new Error(`Evidence integrity or cohort safety guardrail failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Evidence Integrity Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 9 LAUNCH AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek9AuditTests();
