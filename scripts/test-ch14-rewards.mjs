import { awardTransactionXp, getProfile } from '../lib/rewards/engine.ts';

async function runRewardsTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.4 - CHAPTER 14 GAMIFIED REWARDS TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Earn Base XP and Tier Upgrade (BRONZE to SILVER)
  try {
    // 1,000,000 UGX spent -> 1,000 Base XP -> Reaches 1,000 threshold for SILVER
    const result = await awardTransactionXp({
      idempotencyKey: 'rew-tx-001',
      userId: 'USER_GAMER_001',
      transactionAmount: 1000000,
    });

    if (result.earnedXp === 1000 && result.tier === 'SILVER' && result.tierUpgraded) {
      console.log(`✔ [PASSED] Base XP Earned (1000 XP) & Tier Upgraded to SILVER`);
      passed++;
    } else {
      throw new Error(`Unexpected reward output: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Base XP & Tier Upgrade: ${err.message}`);
    failed++;
  }

  // Test 2: Earn Multiplied XP as SILVER Member
  try {
    // 500,000 UGX spent -> 500 Base XP * 1.2 SILVER multiplier = 600 XP
    const result = await awardTransactionXp({
      idempotencyKey: 'rew-tx-002',
      userId: 'USER_GAMER_001',
      transactionAmount: 500000,
    });

    if (result.earnedXp === 600 && result.totalXp === 1600) {
      console.log(`✔ [PASSED] Multiplier Scaling Applied: 600 XP Earned as SILVER (1.2x)`);
      passed++;
    } else {
      throw new Error(`Unexpected multiplier output: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Multiplier Scaling: ${err.message}`);
    failed++;
  }

  // Test 3: Idempotency Protection Rejection
  try {
    await awardTransactionXp({
      idempotencyKey: 'rew-tx-001', // Replaying same key
      userId: 'USER_GAMER_001',
      transactionAmount: 1000000,
    });
    console.error('❌ [FAILED] Reward Idempotency: Expected duplicate rejection.');
    failed++;
  } catch (err) {
    console.log(`✔ [PASSED] Reward Idempotency Enforced: ${err.message}`);
    passed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 14 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runRewardsTests();
