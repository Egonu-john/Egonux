import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 7 API ABUSE & APPLICATION SECURITY HARNESS     ");
console.log("=======================================================================\n");

function sendRawPayload(path, rawBody) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3100,
      path: path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(rawBody) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', err => reject(err));
    req.write(rawBody);
    req.end();
  });
}

async function runDay7SecurityTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Malformed JSON Payload Rejection
  try {
    const res = await sendRawPayload('/api/wallet/ledger', '{ malformed_json_syntax: true, ');
    if (res.statusCode === 400 || res.statusCode === 500) {
      if (!res.body.includes('SyntaxError') && !res.body.includes('at Module.')) {
        console.log(`✔ [PASSED] Malformed Payload Rejected Safely (HTTP ${res.statusCode}, No Internal Stack Trace Leaked)`);
        passed++;
      } else {
        throw new Error(`Stack trace or internal details exposed in error payload!`);
      }
    } else {
      throw new Error(`Expected error status for malformed JSON, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Malformed Payload Guard: ${err.message}`);
    failed++;
  }

  // TEST 2: Unexpected Payload Boundary Fuzzing
  try {
    const hugeString = 'A'.repeat(50000);
    const res = await sendRawPayload('/api/auth/invitation', JSON.stringify({ action: 'redeem', token: hugeString }));
    if (res.statusCode === 400 || res.statusCode === 404 || res.statusCode === 413) {
      console.log(`✔ [PASSED] Oversized Payload Boundary Guard: HTTP ${res.statusCode} Handled Safely`);
      passed++;
    } else {
      throw new Error(`Unexpected status code on oversized token payload: ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Payload Fuzzing Guard: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 7 API SECURITY RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay7SecurityTests();
