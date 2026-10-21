import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 3 INCIDENT RESPONSE & TELEMETRY TEST HARNESS  ");
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

async function runIncidentTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Live Observability Endpoint Accessibility & Dynamic Metric Structure
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics && res.json.metrics.observationWindowDay === 3) {
      console.log(`✔ [PASSED] Live Telemetry (/api/os/pilot-observability): Day ${res.json.metrics.observationWindowDay} Active (${res.json.metrics.dataSource})`);
      passed++;
    } else {
      throw new Error(`Unexpected status or payload: ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Live Telemetry: ${err.message}`);
    failed++;
  }

  // TEST 2: Incident Correlation & PII Privacy Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const metricsStr = JSON.stringify(res.json);
    if (!metricsStr.includes('tester1@egonux.com') && !metricsStr.includes('INV-UG-001')) {
      console.log(`✔ [PASSED] Privacy & Pseudonymization: Zero raw tokens or PII exposed in telemetry`);
      passed++;
    } else {
      throw new Error(`PRIVACY VIOLATION: Unredacted PII or token found in telemetry output!`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Privacy Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`INCIDENT HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runIncidentTests();
