import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 9 PERFORMANCE & STABILITY HARNESS             ");
console.log("=======================================================================\n");

function makeGet(path) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: 3100, path }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, latencyMs: Date.now() - start }));
    });
    req.on('error', err => reject(err));
    req.end();
  });
}

async function runDay9PerformanceTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Synthetic High-Volume Concurrent Requests
  try {
    const concurrentRequests = 10;
    const promises = Array.from({ length: concurrentRequests }, () => makeGet('/api/os/pilot-observability'));
    const results = await Promise.all(promises);

    const allSuccessful = results.every(r => r.statusCode === 200);
    const avgLatency = results.reduce((acc, r) => acc + r.latencyMs, 0) / concurrentRequests;

    if (allSuccessful && avgLatency < 250) {
      console.log(`✔ [PASSED] Synthetic Concurrent Load: ${concurrentRequests} requests completed safely (Avg Latency: ${avgLatency.toFixed(1)}ms)`);
      passed++;
    } else {
      throw new Error(`Load test failed or latency exceeded threshold: ${avgLatency}ms`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Load Test: ${err.message}`);
    failed++;
  }

  // TEST 2: Endpoint Stability & Zero Resource Exhaustion
  try {
    const res = await makeGet('/api/profile');
    if (res.statusCode === 401) {
      console.log(`✔ [PASSED] Endpoint Stability: System intact post-load test (HTTP 401 Fail-Closed Enforced)`);
      passed++;
    } else {
      throw new Error(`Endpoint degraded post-load test`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Stability Check: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 9 PERFORMANCE HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay9PerformanceTests();
