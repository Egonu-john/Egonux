import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — REDEMPTION CONTROL & PRIVACY ASSERTION SUITE      ");
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

async function runRedemptionTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

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
      console.log(`✔ [PASSED] Missing Consent Rejection: HTTP 400 (${res.json.error})`);
      passed++;
    } else throw new Error(`Expected HTTP 400 CONSENT_REQUIRED, got ${res.statusCode}`);
  } catch (err) { console.error(`❌ [FAILED] Missing Consent: ${err.message}`); failed++; }

  // TEST 2: Valid Token Redemption
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-001', consentAccepted: true, participantId: 'PARTICIPANT_UG_001' });
    if (res.statusCode === 200 && res.json.consentCaptured === true) {
      console.log(`✔ [PASSED] Valid Token Redemption: HTTP 200 (Participant: ${res.json.participantId})`);
      passed++;
    } else throw new Error(`Expected HTTP 200, got ${res.statusCode}`);
  } catch (err) { console.error(`❌ [FAILED] Valid Redemption: ${err.message}`); failed++; }

  // TEST 3: Duplicate Reuse Rejection
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-001', consentAccepted: true });
    if (res.statusCode === 400 && res.json.error === 'TOKEN_ALREADY_USED') {
      console.log(`✔ [PASSED] Single-Use Reuse Guard: HTTP 400 (${res.json.error})`);
      passed++;
    } else throw new Error(`Expected HTTP 400 TOKEN_ALREADY_USED, got ${res.statusCode}`);
  } catch (err) { console.error(`❌ [FAILED] Single-Use Reuse Guard: ${err.message}`); failed++; }

  // TEST 4: Expired Token Rejection
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-EXPIRED', consentAccepted: true });
    if (res.statusCode === 400 && res.json.error === 'TOKEN_EXPIRED') {
      console.log(`✔ [PASSED] Expired Token Guard: HTTP 400 (${res.json.error})`);
      passed++;
    } else throw new Error(`Expected HTTP 400 TOKEN_EXPIRED, got ${res.statusCode}`);
  } catch (err) { console.error(`❌ [FAILED] Expired Token Guard: ${err.message}`); failed++; }

  // TEST 5: Revoked Token Rejection
  try {
    const res = await makePost('/api/auth/invitation', { action: 'redeem', token: 'TEST-INV-UG-REVOKED', consentAccepted: true });
    if (res.statusCode === 403 && res.json.error === 'TOKEN_REVOKED') {
      console.log(`✔ [PASSED] Revoked Token Guard: HTTP 403 (${res.json.error})`);
      passed++;
    } else throw new Error(`Expected HTTP 403 TOKEN_REVOKED, got ${res.statusCode}`);
  } catch (err) { console.error(`❌ [FAILED] Revoked Token Guard: ${err.message}`); failed++; }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`REDEMPTION HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runRedemptionTests();
