import http from 'http';
import { spawn } from 'child_process';

console.log("=======================================================================");
console.log("   EGONUX OS v3.3.1 — DISPATCHING INITIAL 2-USER ALPHA INVITATIONS     ");
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

async function dispatchBatch1() {
  const killProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => killProc.on('close', r));

  const server = spawn('npx', ['next', 'start', '-p', '3100'], {
    env: { ...process.env, PORT: '3100', NODE_ENV: 'production' }
  });

  await new Promise((r) => setTimeout(r, 4500));

  console.log("📨 Generating controlled invitation batch for 2 initial test recipients...");
  const res = await makePost('/api/auth/invitation', { action: 'dispatch_initial_test' });

  if (res.statusCode === 200) {
    console.log("=======================================================================");
    console.log("✔ INVITATIONS DISPATCHED SUCCESSFULLY:");
    res.json.invitations.forEach(inv => {
      console.log(`  • Token: ${inv.id} | Target: ${inv.email} | Expiry: ${inv.expires} | Status: ${inv.status}`);
    });
    console.log("=======================================================================");
    console.log(`Privacy Notice: ${res.json.notice}`);
    console.log(`Timestamp: ${res.json.timestamp}`);
    console.log("=======================================================================");
  } else {
    console.error("❌ Failed to dispatch invitation batch:", res.statusCode);
  }

  server.kill('SIGTERM');
  const cleanupProc = spawn('fuser', ['-k', '3100/tcp']);
  await new Promise((r) => cleanupProc.on('close', r));
}

dispatchBatch1();
