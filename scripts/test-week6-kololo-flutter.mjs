import http from 'http';
import fs from 'fs';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.4 — WEEK 6 KOLOLO OPERATING BASE & FLUTTER HARNESS     ");
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

async function runWeek6KololoTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Flutter Cross-Platform Workspace Project Structure Verification
  try {
    const pubspecExists = fs.existsSync('apps/mobile/pubspec.yaml');
    const mainDartExists = fs.existsSync('apps/mobile/lib/main.dart');
    if (pubspecExists && mainDartExists) {
      console.log(`✔ [PASSED] Flutter Cross-Platform Mobile Project Structure Verified (apps/mobile)`);
      passed++;
    } else {
      throw new Error(`Flutter mobile project manifest or entrypoint missing.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Flutter Mobile Workspace Check: ${err.message}`);
    failed++;
  }

  // TEST 2: Kololo Operating Base Regulatory & Compliance Readiness Check
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const consent = res.json.metrics ? res.json.metrics.consentCompliance : null;
    if (res.statusCode === 200 && consent && consent.jurisdiction === 'Uganda PDPA 2019') {
      console.log(`✔ [PASSED] Kololo Operating Base Legal Compliance Verified: (${consent.jurisdiction})`);
      passed++;
    } else {
      throw new Error(`Jurisdiction check for Kololo compliance failed.`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Kololo Compliance Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`WEEK 6 KOLOLO & FLUTTER RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runWeek6KololoTests();
