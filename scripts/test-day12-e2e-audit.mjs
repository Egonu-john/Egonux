import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3.14 — BETA READINESS & EVIDENCE INTEGRITY HARNESS     ");
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

async function runDay12AuditTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: End-to-End Dynamic Observability Telemetry Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics && res.json.metrics.activeCohortSize === 2) {
      console.log(`✔ [PASSED] Dynamic Observability Verified: Active Cohort Size (${res.json.metrics.activeCohortSize})`);
      passed++;
    } else {
      throw new Error(`Observability telemetry response invalid or cohort cap unverified.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Telemetry Verification: ${err.message}`);
    failed++;
  }

  // TEST 2: ANOSA Evidence Integrity & Prerequisite Validation
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const m = res.json.metrics;

    // Validate that indicators are dynamic/verifiable and not degraded/unknown
    if (
      m.dataSource === 'VERIFIED_APPLICATION_MEMORY' &&
      m.ledgerInvariants.reconciliationStatus === 'ZERO_DRIFT_VERIFIED' &&
      m.consentCompliance.jurisdiction === 'Uganda PDPA 2019' &&
      m.systemHealth.incidentTelemetry === 'HEALTHY'
    ) {
      console.log(`✔ [PASSED] ANOSA Prerequisites Verified: Ledger Zero-Drift & PDPA 2019 Dynamic Evidence Confirmed`);
      passed++;
    } else {
      throw new Error(`Prerequisite check failed: Telemetry source or compliance indicators reported UNKNOWN/DEGRADED state.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] ANOSA Gate Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`BETA READINESS HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay12AuditTests();
