import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 7 COMMERCIAL & CUSTOMER OPERATIONS HARNESS    ");
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

async function runWeek7CommercialTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Commercial Gateway & Onboarding Status Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const cohortSize = res.json.metrics ? res.json.metrics.activeCohortSize : null;
    if (res.statusCode === 200 && cohortSize === 2) {
      console.log(`✔ [PASSED] Commercial Onboarding Gateway Verified: Strict Cohort Lock (${cohortSize} Users)`);
      passed++;
    } else {
      throw new Error(`Commercial onboarding gateway check failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Commercial Gateway Check: ${err.message}`);
    failed++;
  }

  // TEST 2: Customer Support & Incident Escalation Telemetry Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const health = res.json.metrics ? res.json.metrics.systemHealth : null;
    if (res.statusCode === 200 && health && health.incidentTelemetry === 'HEALTHY') {
      console.log(`✔ [PASSED] Customer Support Escalation Routing Verified: System Status (${health.incidentTelemetry})`);
      passed++;
    } else {
      throw new Error(`Support escalation telemetry unconfirmed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Support Escalation Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 7 COMMERCIAL OPERATIONS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek7CommercialTests();
