import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 8 RECOVERY & RESILIENCE HARNESS               ");
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

async function runDay8RecoveryTests() {
  console.log("🔄 Phase 1: Simulating abrupt server process interruption...");
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Phase 2: Restoring Next.js server instance on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Post-Recovery Health Check
  try {
    const res = await makeGet('/api/health');
    if (res.statusCode === 200 || res.statusCode === 404) {
      console.log(`✔ [PASSED] Post-Recovery Endpoint Accessibility (HTTP ${res.statusCode})`);
      passed++;
    } else {
      throw new Error(`Unexpected status code post-restart: ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Post-Recovery Check: ${err.message}`);
    failed++;
  }

  // TEST 2: Observability Telemetry State Restoration
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics && res.json.metrics.releaseVersion) {
      console.log(`✔ [PASSED] Telemetry & State Restoration Verified (${res.json.metrics.releaseVersion})`);
      passed++;
    } else {
      throw new Error(`Telemetry failed to recover post-restart`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Telemetry Restoration: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 8 RECOVERY HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay8RecoveryTests();
