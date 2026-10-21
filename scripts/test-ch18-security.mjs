import { generateToken, authenticateRequest } from '../lib/auth/rbac.ts';

async function runSecurityTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.5 - CHAPTER 18 INTEGRATED SECURITY & IDENTITY TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Valid Token Authentication and Role Verification
  try {
    const token = generateToken('USER_SEC_001', 'ADMIN');
    const session = authenticateRequest(token);

    if (session && session.id === 'USER_SEC_001' && session.role === 'ADMIN') {
      console.log(`✔ [PASSED] Valid Token Authenticated: User ID ${session.id} with Role ${session.role}`);
      passed++;
    } else {
      throw new Error(`Failed to authenticate valid token session: ${JSON.stringify(session)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Valid Token Auth: ${err.message}`);
    failed++;
  }

  // Test 2: Negative Test - Tampered or Malformed Token Rejection
  try {
    const invalidToken = Buffer.from(JSON.stringify({ payload: '{"id":"hack"}', signature: 'fake' })).toString('base64');
    const session = authenticateRequest(invalidToken);

    if (session === null) {
      console.log(`✔ [PASSED] Tampered Token Rejected: Access denied as expected`);
      passed++;
    } else {
      throw new Error(`Security breach: Tampered token was accepted!`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Tampered Token Rejection: ${err.message}`);
    failed++;
  }

  // Test 3: Negative Test - Expired Token Rejection
  try {
    // Generate token with expired timestamp
    const expiredPayload = JSON.stringify({ id: 'USER_SEC_001', role: 'USER', exp: Date.now() - 10000 });
    const crypto = await import('crypto');
    const sig = crypto.createHmac('sha256', 'egonux-secret-key-3.4').update(expiredPayload).digest('hex');
    const expiredToken = Buffer.from(JSON.stringify({ payload: expiredPayload, signature: sig })).toString('base64');

    const session = authenticateRequest(expiredToken);
    if (session === null) {
      console.log(`✔ [PASSED] Expired Token Rejected: Zero-trust fail-closed active`);
      passed++;
    } else {
      throw new Error(`Security breach: Expired token was accepted!`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Expired Token Rejection: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 18 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests();
