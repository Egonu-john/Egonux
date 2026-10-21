import { generateToken } from '../lib/auth/rbac.ts';
import { handleApiRequest } from '../lib/api/router.ts';

async function runApiTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.4 - CHAPTER 15 UNIFIED API GATEWAY TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Setup mock user token
  const validToken = generateToken('USER_SDK_888', 'SUPER_ADMIN');

  // Test 1: Authenticated Order Execution via Unified API Endpoint
  try {
    const response = await handleApiRequest({
      path: '/api/v1/orders',
      method: 'POST',
      headers: { authorization: `Bearer ${validToken}` },
      body: {
        idempotencyKey: 'api-order-001',
        item: {
          id: 'PROD_SDK_VIP_01',
          name: 'EGONUX OS VIP Access Key',
          price: 200000,
          merchantAccountId: 'MERCHANT_EGONUX_TECH',
        },
        affiliateAccountId: 'AFFILIATE_CREATOR_01',
      },
    });

    if (
      response.status === 201 &&
      response.data.order.status === 'FULFILLED' &&
      response.data.reward.earnedXp > 0
    ) {
      console.log(`✔ [PASSED] Unified API Order & Reward Executed: Order ID ${response.data.order.orderId}`);
      passed++;
    } else {
      throw new Error(`Unexpected API response: ${JSON.stringify(response)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Unified API Order: ${err.message}`);
    failed++;
  }

  // Test 2: Query User Profile via Unified API Endpoint
  try {
    const response = await handleApiRequest({
      path: '/api/v1/profile',
      method: 'GET',
      headers: { authorization: `Bearer ${validToken}` },
    });

    if (response.status === 200 && response.data.user.id === 'USER_SDK_888') {
      console.log(`✔ [PASSED] Authenticated Profile Retrieval Verified: Tier ${response.data.profile.tier}`);
      passed++;
    } else {
      throw new Error(`Unexpected Profile response: ${JSON.stringify(response)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Unified API Profile: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 15 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runApiTests();
