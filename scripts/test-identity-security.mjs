import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 4 IDENTITY & SESSION SECURITY HARNESS         ");
console.log("=======================================================================\n");

function makeGet(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: 3100, path, headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, json: JSON.parse(body || '{}') }));
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function runIdentitySecurityTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Unauthenticated Profile Protection (HTTP 401)
  try {
    const res = await makeGet('/api/profile');
    if (res.statusCode === 401) {
      console.log(`✔ [PASSED] Unauthenticated Profile Protection: HTTP 401 Access Denied`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 401, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Profile Protection: ${err.message}`);
    failed++;
  }

  // TEST 2: Unauthenticated Session Endpoint Guard (HTTP 401, 405, or null session)
  try {
    const res = await makeGet('/api/auth/session');
    if (res.statusCode === 401 || res.statusCode === 405 || (res.statusCode === 200 && !res.json.user)) {
      console.log(`✔ [PASSED] Unauthenticated Session Guard: HTTP ${res.statusCode} Fail-Closed Enforced`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 401/405 or null session, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Session Check: ${err.message}`);
    failed++;
  }

  // TEST 3: Invalid Session Token Guard
  try {
    const res = await makeGet('/api/profile', { Authorization: 'Bearer INVALID_EXPIRED_TOKEN' });
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.log(`✔ [PASSED] Invalid Session Guard: HTTP ${res.statusCode} Access Blocked`);
      passed++;
    } else {
      throw new Error(`Expected HTTP 401/403, got ${res.statusCode}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Invalid Token Guard: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`IDENTITY SECURITY HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runIdentitySecurityTests();
