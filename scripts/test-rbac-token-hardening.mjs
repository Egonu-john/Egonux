import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateRequest, generateToken } from '../lib/auth/rbac.ts';

const originalSecret = process.env.JWT_SECRET;
const TEST_SECRET = 'egonux-test-only-secret-with-at-least-32-bytes';

function signPayload(payload) {
  const payloadText = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', TEST_SECRET).update(payloadText, 'utf8').digest('hex');
  return Buffer.from(JSON.stringify({ payload: payloadText, signature }), 'utf8').toString('base64');
}

test('legacy RBAC token hardening rejects invalid tokens and validates legitimate sessions', () => {
  try {
    delete process.env.JWT_SECRET;
    assert.throws(() => generateToken('user-1'), /JWT_SECRET must be configured/);
    assert.equal(authenticateRequest('eyJ0ZXN0Ijp0cnVlfQ=='), null);

    process.env.JWT_SECRET = TEST_SECRET;
    const valid = generateToken('user-1', 'USER');
    assert.deepEqual(authenticateRequest(valid), { id: 'user-1', role: 'USER' });
    assert.deepEqual(authenticateRequest(generateToken('admin-1', 'ADMIN')), { id: 'admin-1', role: 'ADMIN' });
    assert.deepEqual(authenticateRequest(generateToken('merchant-1', 'MERCHANT')), { id: 'merchant-1', role: 'MERCHANT' });

    const wrapper = JSON.parse(Buffer.from(valid, 'base64').toString('utf8'));
    const tamperedPayload = JSON.parse(wrapper.payload);
    tamperedPayload.id = 'attacker';
    wrapper.payload = JSON.stringify(tamperedPayload);
    const tampered = Buffer.from(JSON.stringify(wrapper), 'utf8').toString('base64');
    assert.equal(authenticateRequest(tampered), null, 'payload tampering must be rejected');

    const badSignatureWrapper = JSON.parse(Buffer.from(valid, 'base64').toString('utf8'));
    badSignatureWrapper.signature = '0'.repeat(64);
    const badSignature = Buffer.from(JSON.stringify(badSignatureWrapper), 'utf8').toString('base64');
    assert.equal(authenticateRequest(badSignature), null, 'signature tampering must be rejected');

    assert.equal(authenticateRequest('not-base64!'), null);
    assert.equal(authenticateRequest(''), null);
    assert.equal(authenticateRequest('A'.repeat(8196)), null);
    assert.equal(authenticateRequest(signPayload({ id: 'user-1', role: 'USER', exp: Date.now() - 1 })), null, 'expired tokens must be rejected');
    assert.equal(authenticateRequest(signPayload({ id: 'user-1', role: 'SUPER_ADMIN', exp: Date.now() + 60_000 })), null, 'unsupported roles must be rejected');
    assert.equal(authenticateRequest(signPayload({ id: '', role: 'USER', exp: Date.now() + 60_000 })), null, 'empty user IDs must be rejected');

    assert.throws(() => generateToken('', 'USER'), /valid user ID/);
    assert.throws(() => generateToken('user-1', 'SUPER_ADMIN'), /Invalid legacy role/);
    assert.throws(() => generateToken('x'.repeat(257), 'USER'), /valid user ID/);
  } finally {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  }
});
