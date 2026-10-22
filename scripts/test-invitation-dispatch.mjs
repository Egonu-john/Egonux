import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — CONTROLLED ALPHA INVITATION & CONSENT HARNESS     ");
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

async function runInvitationTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // Test 1: Dispatch Controlled Initial Batch (Max 2 Testers)
  try {
    const res = await makePost('/api/auth/invitation', { action: 'dispatch_initial_test' });
    if (res.statusCode === 200 && res.json.batchSize === 2) {
      console.log(`✔ [PASSED] Invitation Dispatch: Initial 2-user batch generated successfully (${res.json.invitations[0].id}, ${res.json.invitations[1].id})`);
      passed++;
    } else {
      throw new Error(`Batch size mismatch or error status: ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Invitation Dispatch: ${err.message}`);
    failed++;
  }

  // Test 2: Token Redemption with Explicit Consent (PDPA 2019)
  try {
    const res = await makePost('/api/auth/invitation', { 
      action: 'redeem', 
      token: 'TEST-INV-UG-002', 
      consentAccepted: true, 
      participantId: 'PARTICIPANT_UG_002' 
    });
    if (res.statusCode === 200 && res.json.consentCaptured === true) {
      console.log(`✔ [PASSED] Token Redemption & PDPA 2019 Consent Captured: Status ${res.json.profileStatus}`);
      passed++;
    } else {
      throw new Error(`Consent or redemption failed with status ${res.statusCode}: ${res.json.message || ''}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Token Redemption: ${err.message}`);
    failed++;
  }

  // Cleanup
  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`INVITATION HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runInvitationTests();
