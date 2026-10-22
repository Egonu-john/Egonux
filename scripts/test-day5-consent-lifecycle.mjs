import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 5 INVITATION & CONSENT LIFECYCLE HARNESS     ");
console.log("=======================================================================\n");

function makePost(path, body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3100,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, json: JSON.parse(responseBody || '{}') }));
    });
    req.on('error', err => reject(err));
    req.write(data);
    req.end();
  });
}

async function runDay5ConsentTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Missing Consent Rejection
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-001', consentAccepted: false });
    if (res.statusCode === 400 && res.json.error === 'CONSENT_REQUIRED') {
      console.log(`✔ [PASSED] Missing Consent Guard: HTTP 400 (CONSENT_REQUIRED)`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 400 CONSENT_REQUIRED, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Missing Consent Guard: ${err.message}`);
    failed++;
  }

  // TEST 2: Valid Token Redemption with PDPA 2019 Timestamp & Notice Capture
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-001', consentAccepted: true, participantId: 'PARTICIPANT_UG_001' });
    if (res.statusCode === 200 && res.json.consentCaptured === true) {
      console.log(`✔ [PASSED] Valid Redemption & PDPA 2019 Consent Timestamp Captured`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 200 with consentCaptured, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Valid Token Redemption: ${err.message}`);
    failed++;
  }

  // TEST 3: Single-Use Token Reuse Guard
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-001', consentAccepted: true, participantId: 'PARTICIPANT_UG_001' });
    if (res.statusCode === 400 && res.json.error === 'TOKEN_ALREADY_USED') {
      console.log(`✔ [PASSED] Single-Use Reuse Guard: HTTP 400 (TOKEN_ALREADY_USED)`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 400 TOKEN_ALREADY_USED, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Single-Use Guard: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 5 CONSENT LIFECYCLE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay5ConsentTests();
