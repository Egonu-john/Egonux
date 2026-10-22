import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('====================================================================');
console.log('EGONUX OS v3.4 - CHAPTER 9 FINAL LAUNCH AUDIT & GOVERNANCE HARNESS');
console.log('====================================================================\n');

console.log('🚀 Starting temporary Next.js server on port 3100...');
const devServer = spawn('npx', ['next', 'dev', '-p', '3100'], { stdio: 'ignore' });

function awaitServer(retries = 30) {
  return new Promise((resolve, reject) => {
    const check = (attempt) => {
      http.get('http://localhost:3100/api/os/pilot-observability', () => {
        resolve();
      }).on('error', () => {
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

    // Test 1: Audit evidence must be present or explicitly reported as unknown.
    try {
      const auditCandidates = [
        path.join(process.cwd(), 'audit.log'),
        path.join(process.cwd(), 'data', 'audit.json'),
      ];
      const auditPath = auditCandidates.find((candidate) => fs.existsSync(candidate));

      if (auditPath) {
        const raw = fs.readFileSync(auditPath, 'utf8');
        if (!raw.trim()) throw new Error(`Audit evidence file is empty: ${auditPath}`);
        if (auditPath.endsWith('.json')) {
          const records = JSON.parse(raw);
          if (!Array.isArray(records)) throw new Error('JSON audit evidence must be an array');
          console.log(`✔ [PASSED] Audit Evidence File Valid: ${records.length} records`);
        } else {
          console.log('✔ [PASSED] Audit Evidence File Present and Non-empty');
        }
        passed++;
      } else {
        const payload = await new Promise((resolve, reject) => {
          http.get('http://localhost:3100/api/os/pilot-observability', (response) => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => { body += chunk; });
            response.on('end', () => {
              try { resolve(JSON.parse(body)); } catch (error) { reject(error); }
            });
          }).on('error', reject);
        });
        const telemetry = payload?.metrics?.invitationStats?.telemetryStatus;
        if (payload?.success !== true || telemetry !== 'UNKNOWN') {
          throw new Error('Missing persistent audit evidence must be reported as UNKNOWN');
        }
        console.log('✔ [PASSED] Audit Evidence Honesty: missing persistent logs remain UNKNOWN');
        passed++;
      }
    } catch (err) {
      console.error(`❌ [FAILED] Audit Evidence Check: ${err.message}`);
      failed++;
    }

    // Test 2: Global Launch Gateway Readiness
    try {
      const res = await new Promise((resSolve) => {
        http.get('http://localhost:3100/api/os/pilot-observability', (r) => resSolve(r));
      });
      if (res.statusCode === 200) {
        console.log('✔ [PASSED] Launch Gateway Production Readiness Confirmed (HTTP 200)');
        passed++;
      } else {
        throw new Error(`Expected HTTP 200, got HTTP ${res.statusCode}`);
      }
    } catch (err) {
      console.error(`❌ [FAILED] Gateway Readiness: ${err.message}`);
      failed++;
    }

    console.log('\n====================================================================');
    console.log(`CHAPTER 9 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
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
