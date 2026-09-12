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
  assert.doesNotMatch(contentSecurityPolicy, /unsafe-eval/);

  const osResponse = await fetch(`${baseUrl}/os`, {
    signal: AbortSignal.timeout(10_000),
  });
  const osBody = await osResponse.text();
  assert.equal(osResponse.status, 200);
  assert.match(osBody, /Enterprise MVP/);
  assert.match(osBody, /Sandbox/);
  assert.match(osBody, /noindex, nofollow/);

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
  assert.match(robotsBody, /https:\/\/www\.egonux\.com\/sitemap\.xml/);

  const manifestResponse = await fetch(`${baseUrl}/site.webmanifest`, {
    signal: AbortSignal.timeout(10_000),
  });
  const manifest = await manifestResponse.json();
  assert.equal(manifestResponse.status, 200);
  assert.equal(manifest.name, 'EGONUX');
  assert.equal(manifest.icons[0].src, '/brand/egonux-primary-logo.png');

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
  assert.equal(health.version, '3.0.1-foundation');

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
