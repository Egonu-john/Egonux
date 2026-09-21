import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextBinary = require.resolve('next/dist/bin/next');
const port = process.env.SMOKE_TEST_PORT ?? '3100';
const baseUrl = `http://127.0.0.1:${port}`;
const output = [];

const server = spawn(
  process.execPath,
  [nextBinary, 'start', '-H', '127.0.0.1', '-p', port],
  {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);

server.stdout.on('data', (chunk) => output.push(chunk.toString()));
server.stderr.on('data', (chunk) => output.push(chunk.toString()));

async function waitForServer() {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited early with code ${server.exitCode}.`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error('Production server did not become ready within 30 seconds.');
}

async function stopServer() {
  if (server.exitCode !== null) return;

  server.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (server.exitCode === null) server.kill('SIGKILL');
}

try {
  await waitForServer();

  const homeResponse = await fetch(`${baseUrl}/`, {
    signal: AbortSignal.timeout(10_000),
  });
  const homeBody = await homeResponse.text();
  assert.equal(homeResponse.status, 200);
  assert.match(homeBody, /Empowering the Next Generation of Digital Wealth/);
  assert.match(homeBody, /egonux-primary-logo\.png/);
  assert.equal(homeResponse.headers.get('x-frame-options'), 'DENY');
  const contentSecurityPolicy =
    homeResponse.headers.get('content-security-policy') ?? '';
  assert.match(contentSecurityPolicy, /frame-ancestors 'none'/);
  assert.match(contentSecurityPolicy, /https:\/\/identitytoolkit\.googleapis\.com/);
  assert.match(contentSecurityPolicy, /https:\/\/securetoken\.googleapis\.com/);
  assert.doesNotMatch(contentSecurityPolicy, /unsafe-eval/);

  const osResponse = await fetch(`${baseUrl}/os`, {
    signal: AbortSignal.timeout(10_000),
  });
  const osBody = await osResponse.text();
  assert.equal(osResponse.status, 200);
  assert.match(osBody, /Enterprise MVP/);
  assert.match(osBody, /Sandbox/);
  assert.match(osBody, /noindex, nofollow/);

  const anosaResponse = await fetch(`${baseUrl}/anosa`, {
    signal: AbortSignal.timeout(10_000),
  });
  const anosaBody = await anosaResponse.text();
  assert.equal(anosaResponse.status, 200);
  assert.match(anosaBody, /ANOSA Personal/);
  assert.match(anosaBody, /Read · Prepare · Approve/);
  assert.match(anosaBody, /Controlled execution · simulation only/);
  assert.match(anosaBody, /Founder preview/);
  assert.match(anosaBody, /noindex, nofollow/);

  const loginResponse = await fetch(`${baseUrl}/login`, {
    signal: AbortSignal.timeout(10_000),
  });
  const loginBody = await loginResponse.text();
  assert.equal(loginResponse.status, 200);
  assert.match(loginBody, /EGONUX ID/);
  assert.match(loginBody, /Firebase sandbox configuration is not connected/);
  assert.match(loginBody, /noindex, nofollow/);

  const logoResponse = await fetch(
    `${baseUrl}/brand/egonux-primary-logo.png`,
    { signal: AbortSignal.timeout(10_000) },
  );
  assert.equal(logoResponse.status, 200);
  assert.match(logoResponse.headers.get('content-type') ?? '', /image\/png/);

  const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
    signal: AbortSignal.timeout(10_000),
  });
  const robotsBody = await robotsResponse.text();
  assert.equal(robotsResponse.status, 200);
  assert.match(robotsBody, /Disallow: \/os/);
  assert.match(robotsBody, /Disallow: \/anosa/);
  assert.match(robotsBody, /https:\/\/www\.egonux\.com\/sitemap\.xml/);

  const manifestResponse = await fetch(`${baseUrl}/site.webmanifest`, {
    signal: AbortSignal.timeout(10_000),
  });
  const manifest = await manifestResponse.json();
  assert.equal(manifestResponse.status, 200);
  assert.equal(manifest.name, 'EGONUX');
  assert.equal(manifest.icons[0].src, '/brand/egonux-primary-logo.png');

  const anosaManifestResponse = await fetch(`${baseUrl}/anosa.webmanifest`, {
    signal: AbortSignal.timeout(10_000),
  });
  const anosaManifest = await anosaManifestResponse.json();
  assert.equal(anosaManifestResponse.status, 200);
  assert.equal(anosaManifest.short_name, 'ANOSA');
  assert.equal(anosaManifest.start_url, '/anosa');
  assert.equal(anosaManifest.icons[1].src, '/brand/anosa-icon-512.png');

  const anosaServiceWorkerResponse = await fetch(`${baseUrl}/anosa-sw.js`, {
    signal: AbortSignal.timeout(10_000),
  });
  const anosaServiceWorker = await anosaServiceWorkerResponse.text();
  assert.equal(anosaServiceWorkerResponse.status, 200);
  assert.match(anosaServiceWorker, /anosa-shell-v1/);

  const contextResponse = await fetch(`${baseUrl}/api/anosa/context`, {
    signal: AbortSignal.timeout(10_000),
  });
  const context = await contextResponse.json();
  assert.equal(contextResponse.status, 200);
  assert.equal(context.execution, 'locked');
  assert.equal(context.sources.length, 7);
  assert.equal(context.sources[0].owner, 'EGONUX Product');
  assert.ok(context.sources.every((source) => source.purpose && source.freshness && source.classification));
  assert.deepEqual(context.capabilities, ['read', 'prepare', 'approve', 'simulate']);
  assert.equal(context.control.phase, 3);
  assert.equal(context.control.externalExecution, 'disabled');
  assert.equal(context.control.ledger, 'device');
  assert.equal(context.evidence.phase, '3.4');
  assert.equal(context.evidence.signingReady, false);
  assert.equal(context.evidence.signatureMode, 'unsigned');
  assert.equal(context.evidence.mode, 'device');
  assert.equal(context.evidence.ledgerEnabled, false);
  assert.equal(context.evidence.canaryReady, false);

  const evidenceHealthResponse = await fetch(`${baseUrl}/api/anosa/evidence-health`, {
    signal: AbortSignal.timeout(10_000),
  });
  const evidenceHealth = await evidenceHealthResponse.json();
  assert.equal(evidenceHealthResponse.status, 200);
  assert.equal(evidenceHealth.evidence.retention, 'permanent');
  assert.equal(evidenceHealth.evidence.externalExecution, 'disabled');

  const evidenceVerificationResponse = await fetch(`${baseUrl}/api/anosa/evidence-verification`, {
    signal: AbortSignal.timeout(10_000),
  });
  const evidenceVerification = await evidenceVerificationResponse.json();
  assert.equal(evidenceVerificationResponse.status, 200);
  assert.equal(evidenceVerification.verification.phase, '3.4');
  assert.equal(evidenceVerification.verification.status, 'unavailable');
  assert.equal(evidenceVerification.verification.externalExecution, 'disabled');

  const evidenceCanaryResponse = await fetch(`${baseUrl}/api/anosa/evidence-health`, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  });
  const evidenceCanary = await evidenceCanaryResponse.json();
  assert.equal(evidenceCanaryResponse.status, 412);
  assert.equal(evidenceCanary.code, 'EVIDENCE_GATE_CLOSED');

  const askResponse = await fetch(`${baseUrl}/api/anosa/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: 'Prepare today’s founder brief and three priorities' }),
    signal: AbortSignal.timeout(20_000),
  });
  const intelligence = await askResponse.json();
  assert.equal(askResponse.status, 200);
  assert.equal(intelligence.sources.length, 7);
  assert.ok(intelligence.proposals.length >= 1 && intelligence.proposals.length <= 3);
  assert.equal(intelligence.proposals[0].executionBoundary, 'Decision recording only. Execution remains locked.');
  assert.ok(intelligence.proposals[0].draftPreview);

  const decisionResponse = await fetch(`${baseUrl}/api/anosa/decisions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposalId: 'smoke-proposal',
      title: 'Smoke decision',
      state: 'approved',
      actionType: 'email_draft',
      draftPreview: 'Exact email preview for smoke verification. Nothing will be sent.',
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const decision = await decisionResponse.json();
  assert.equal(decisionResponse.status, 201);
  assert.equal(decision.execution, 'locked');
  assert.equal(decision.persistence, 'device');
  assert.equal(decision.decision.state, 'approved');
  assert.match(decision.decision.contentHash, /^[a-f0-9]{64}$/);

  const intentResponse = await fetch(`${baseUrl}/api/anosa/intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      proposalId: 'smoke-proposal',
      title: 'Smoke controlled simulation',
      actionType: 'email_draft',
      draftPreview: 'Exact email preview for smoke verification. Nothing will be sent.',
      decisionId: decision.decision.id,
      decisionHash: decision.decision.contentHash,
      idempotencyKey: `smoke-proposal:${decision.decision.contentHash}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const intent = await intentResponse.json();
  assert.equal(intentResponse.status, 201);
  assert.equal(intent.intent.status, 'simulated');
  assert.equal(intent.intent.mode, 'simulation');
  assert.equal(intent.intent.connector, 'email');
  assert.equal(intent.intent.persistence, 'device');
  assert.equal(intent.externalExecution, 'disabled');
  assert.match(intent.intent.payloadHash, /^[a-f0-9]{64}$/);
  assert.match(intent.intent.contentHash, /^[a-f0-9]{64}$/);
  assert.equal(intent.intent.policy.allowed, true);

  const invalidIntentResponse = await fetch(`${baseUrl}/api/anosa/intents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposalId: 'smoke-proposal', title: 'Unlinked intent', actionType: 'brief', draftPreview: 'Draft without evidence', decisionId: 'missing-decision', idempotencyKey: 'missing-decision-hash' }),
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(invalidIntentResponse.status, 400);

  const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, {
    signal: AbortSignal.timeout(10_000),
  });
  const sitemapBody = await sitemapResponse.text();
  assert.equal(sitemapResponse.status, 200);
  assert.match(sitemapBody, /https:\/\/www\.egonux\.com\//);

  const healthResponse = await fetch(`${baseUrl}/api/health`, {
    signal: AbortSignal.timeout(10_000),
  });
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(healthResponse.headers.get('cache-control'), 'no-store');
  assert.equal(health.status, 'healthy');
  assert.equal(health.mode, 'sandbox');
  assert.equal(health.version, '3.4.0-kms-evidence-signing');

  const rejectedResponse = await fetch(`${baseUrl}/api/health`, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
  });
  assert.equal(rejectedResponse.status, 405);
  assert.equal(rejectedResponse.headers.get('allow'), 'GET');

  console.log('EGONUX production smoke test passed.');
} catch (error) {
  console.error(output.join(''));
  throw error;
} finally {
  await stopServer();
}
