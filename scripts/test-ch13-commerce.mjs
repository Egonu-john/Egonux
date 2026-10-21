import { processPurchaseOrder } from '../lib/commerce/orders.ts';

async function runCommerceTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.4 - CHAPTER 13 COMMERCE & AFFILIATE TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Order with Merchant, Platform Fee, and Affiliate Commission
  try {
    const order = await processPurchaseOrder({
      idempotencyKey: 'ord-001',
      buyerAccountId: 'USER_BUYER_001',
      item: {
        id: 'PROD_EGONUX_BOOK_01',
        name: 'EGONUX Digital Wealth Manifesto',
        price: 100000, // 100,000 UGX
        merchantAccountId: 'MERCHANT_EGONUX_MEDIA',
      },
      affiliateAccountId: 'AFFILIATE_PARTNER_777',
      affiliateCommissionRate: 0.10, // 10,000 UGX
      platformFeeRate: 0.05, // 5,000 UGX
    });

    if (
      order.breakdown.merchantPayout === 85000 &&
      order.breakdown.platformFee === 5000 &&
      order.breakdown.affiliateCommission === 10000
    ) {
      console.log(`✔ [PASSED] Order Split Processed: Merchant (85k), Platform (5k), Affiliate (10k)`);
      passed++;
    } else {
      throw new Error(`Unexpected fee breakdown: ${JSON.stringify(order.breakdown)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Order Split: ${err.message}`);
    failed++;
  }

  // Test 2: Idempotency Duplicate Order Guard
  try {
    await processPurchaseOrder({
      idempotencyKey: 'ord-001', // Replaying same order key
      buyerAccountId: 'USER_BUYER_001',
      item: {
        id: 'PROD_EGONUX_BOOK_01',
        name: 'EGONUX Digital Wealth Manifesto',
        price: 100000,
        merchantAccountId: 'MERCHANT_EGONUX_MEDIA',
      },
    });
    console.error('❌ [FAILED] Commerce Idempotency: Expected duplicate key error.');
    failed++;
  } catch (err) {
    console.log(`✔ [PASSED] Commerce Idempotency Enforced: ${err.message}`);
    passed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 13 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runCommerceTests();
