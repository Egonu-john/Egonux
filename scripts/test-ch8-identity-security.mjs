import http from 'http';
import { spawn } from 'child_process';

console.log('====================================================================');
console.log('EGONUX OS v3.4 - CHAPTER 8 IDENTITY & SECURITY HARNESS');
console.log('====================================================================\n');

// Start temporary Next.js dev server on port 3100
console.log('🚀 Starting temporary Next.js server on port 3100...');
const devServer = spawn('npx', ['next', 'dev', '-p', '3100'], { stdio: 'ignore' });

function awaitServer(retries = 30) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      http.get('http://localhost:3100/api/os/pilot-observability', (res) => {
        resolve();
      }).on('error', (err) => {
        if (attempt >= retries) return reject(new Error('Server start timed out'));
        setTimeout(() => check(attempt + 1), 1000);
      });
    };
    check(1);
  });
}

async function runTests() {
  try {
    await awaitServer();
    let passed = 0;
    let failed = 0;

    // Test 1: Session GET Guard (Unauthenticated Access Rejected)
    try {
      const res = await new Promise((resSolve) => {
        http.get('http://localhost:3100/api/auth/session', (r) => resSolve(r));
      });
      if (res.statusCode === 401) {
        console.log('✔ [PASSED] Session Security Guard: Unauthenticated GET returns HTTP 401');
        passed++;
      } else {
        throw new Error(`Expected HTTP 401, got HTTP ${res.statusCode}`);
      }
    } catch (err) {
      console.error(`❌ [FAILED] Session Security Guard: ${err.message}`);
      failed++;
    }

    // Test 2: SameOrigin Requirement Enforcement
    try {
      const options = {
        hostname: 'localhost',
        port: 3100,
        path: '/api/auth/session',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };
      const res = await new Promise((resSolve) => {
        const req = http.request(options, (r) => resSolve(r));
        req.write(JSON.stringify({ idToken: 'invalid-synthetic-token' }));
        req.end();
      });
      if (res.statusCode === 403 || res.statusCode === 401) {
        console.log('✔ [PASSED] Origin & ID Token Validation Guard Enforced');
        passed++;
      } else {
        throw new Error(`Expected HTTP 401 or 403, got HTTP ${res.statusCode}`);
      }
    } catch (err) {
      console.error(`❌ [FAILED] Origin Guard: ${err.message}`);
      failed++;
    }

    console.log('\n====================================================================');
    console.log(`CHAPTER 8 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================================');

    devServer.kill('SIGTERM');
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Harness Error:', err.message);
    devServer.kill('SIGTERM');
    process.exit(1);
  }
}

runTests();
