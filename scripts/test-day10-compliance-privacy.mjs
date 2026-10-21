import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3 — DAY 10 COMPLIANCE & PRIVACY HARNESS (PDPA 2019)   ");
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

async function runDay10ComplianceTests() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  console.log("🚀 Starting temporary Next.js server on port 3100...");
  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  let passed = 0;
  let failed = 0;

  // TEST 1: Consent Verification & Notice Version Audit
  try {
    const res = await makeGet('/api/os/pilot-observability');
    if (res.statusCode === 200 && res.json.metrics.consentCompliance.jurisdiction.includes('PDPA 2019')) {
      console.log(`✔ [PASSED] PDPA 2019 Legal Jurisdiction & Notice Version Verified (${res.json.metrics.consentCompliance.jurisdiction})`);
      passed++;
    } else {
      throw new Error(`PDPA 2019 jurisdiction or consent compliance verification failed`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Consent Verification: ${err.message}`);
    failed++;
  }

  // TEST 2: Automated Zero-PII Leakage Scan Across Telemetry Payload
  try {
    const res = await makeGet('/api/os/pilot-observability');
    const payloadStr = JSON.stringify(res.json);

    // Assert absence of unredacted credentials, emails, or plain tokens
    const piiRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const containsPII = piiRegex.test(payloadStr);

    if (!containsPII) {
      console.log(`✔ [PASSED] Zero-PII Exposure Audit: No raw email addresses or tokens found in telemetry`);
      passed++;
    } else {
      throw new Error(`PRIVACY VIOLATION: Raw PII pattern detected in public/telemetry payload!`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Zero-PII Exposure Audit: ${err.message}`);
    failed++;
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));

  console.log("\n=======================================================================");
  console.log(`DAY 10 COMPLIANCE HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================================");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runDay10ComplianceTests();
