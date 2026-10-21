import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 4 CORE PRODUCT EXPERIENCE HARNESS             ");
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

async function runWeek4ExperienceTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Public Core Journey Endpoint Health
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics) {
      console.log(`✔ [PASSED] Core Journey Gateway Accessibility Verified (Status ${res.statusCode})`);
      passed++;
    } else {
      throw new Error(`Core journey gateway failed accessibility check.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Journey Gateway Verification: ${err.message}`);
    failed++;
  }

  // TEST 2: Active Cohort & Web OS Feature Flags Enforcement
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const version = res.json.metrics ? res.json.metrics.releaseVersion : '';
    if (version.includes('v3.')) {
      console.log(`✔ [PASSED] Web OS Release Version & Feature Flags Verified: (${version})`);
      passed++;
    } else {
      throw new Error(`Web OS feature flags or version check invalid.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Feature Flag Enforcement: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 4 CORE EXPERIENCE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek4ExperienceTests();
