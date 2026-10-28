import assert from 'node:assert/strict';

const baseUrl = (process.env.EGONUX_TEST_BASE_URL || 'http://127.0.0.1:3100').replace(/\/$/, '');
const founderCookie = process.env.EGONUX_TEST_FOUNDER_SESSION_COOKIE || '';
const noticeVersion = process.env.EGONUX_TEST_NOTICE_VERSION || 'EGONUX-PDPA-2019-v1';

async function post(body, { authenticated = false } = {}) {
  const headers = {
    'content-type': 'application/json',
    origin: baseUrl,
    'x-forwarded-proto': new URL(baseUrl).protocol.slice(0, -1),
  };
  if (authenticated && founderCookie) headers.cookie = founderCookie;
  const response = await fetch(`${baseUrl}/api/auth/invitation`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  return { status: response.status, json };
}

async function run() {
  let passed = 0;
  let skipped = 0;
  const test = async (name, fn) => {
    try {
      await fn();
      passed += 1;
      console.log(`PASS ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  };

  await test('unauthenticated dispatch is denied', async () => {
    const result = await post({ action: 'dispatch_initial_test', count: 1 });
    assert.equal(result.status, 401);
    assert.equal(result.json.error, 'UNAUTHENTICATED');
  });

  await test('unauthenticated revocation is denied', async () => {
    const result = await post({ action: 'revoke', token: 'not-a-real-token' });
    assert.equal(result.status, 401);
    assert.equal(result.json.error, 'UNAUTHENTICATED');
  });

  await test('redemption without explicit current-notice consent is rejected', async () => {
    const result = await post({ action: 'redeem', token: 'not-a-real-token', consentAccepted: false });
    assert.equal(result.status, 400);
    assert.equal(result.json.error, 'CONSENT_REQUIRED');
  });

  if (!founderCookie) {
    skipped += 1;
    console.log('SKIP authenticated lifecycle tests: set EGONUX_TEST_FOUNDER_SESSION_COOKIE to a valid founder/admin session cookie.');
    console.log(`RESULT ${passed} passed, ${skipped} skipped. Authenticated Firestore integration was not exercised.`);
    return;
  }

  const dispatched = await post({ action: 'dispatch_initial_test', count: 2 }, { authenticated: true });
  assert.equal(dispatched.status, 201, 'authorized dispatch should succeed');
  assert.equal(dispatched.json.batchSize, 2);
  assert.equal(dispatched.json.noticeVersion, noticeVersion);
  assert.ok(dispatched.json.invitations.every((item) => typeof item.token === 'string' && item.token.length >= 40));
  const [first, second] = dispatched.json.invitations;

  await test('dispatch returns raw tokens only to the authorized dispatch caller', async () => {
    assert.ok(first.token);
    assert.ok(second.token);
    assert.ok(first.invitationId && first.participantId);
  });

  await test('consent and notice version are mandatory', async () => {
    const result = await post({ action: 'redeem', token: first.token, consentAccepted: false });
    assert.equal(result.status, 400);
    assert.equal(result.json.error, 'CONSENT_REQUIRED');
  });

  let concurrentResults;
  await test('concurrent redemption consumes an invitation exactly once', async () => {
    concurrentResults = await Promise.all([
      post({ action: 'redeem', token: first.token, consentAccepted: true, noticeVersion }),
      post({ action: 'redeem', token: first.token, consentAccepted: true, noticeVersion }),
    ]);
    assert.equal(concurrentResults.filter((item) => item.status === 200).length, 1);
    assert.equal(concurrentResults.filter((item) => item.status === 409 && item.json.error === 'TOKEN_ALREADY_USED').length, 1);
    const success = concurrentResults.find((item) => item.status === 200);
    assert.ok(success.json.consent?.eventId);
    assert.equal(success.json.consent?.noticeVersion, noticeVersion);
    assert.equal(Object.hasOwn(success.json, 'redeemedToken'), false);
    assert.equal(Object.hasOwn(success.json, 'token'), false);
  });

  await test('replay after successful redemption is rejected', async () => {
    const result = await post({ action: 'redeem', token: first.token, consentAccepted: true, noticeVersion });
    assert.equal(result.status, 409);
    assert.equal(result.json.error, 'TOKEN_ALREADY_USED');
  });

  await test('revoked invitation cannot be redeemed', async () => {
    const revoked = await post({ action: 'revoke', token: second.token }, { authenticated: true });
    assert.equal(revoked.status, 200);
    assert.equal(Object.hasOwn(revoked.json, 'token'), false);
    const result = await post({ action: 'redeem', token: second.token, consentAccepted: true, noticeVersion });
    assert.equal(result.status, 403);
    assert.equal(result.json.error, 'TOKEN_REVOKED');
  });

  console.log(`RESULT ${passed} passed, ${skipped} skipped. Expiration and process-restart persistence require emulator-backed fixture/restart orchestration and must be verified before release.`);
}

run().catch((error) => {
  console.error('Invitation lifecycle test harness failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
