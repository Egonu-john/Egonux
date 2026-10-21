import { processTransaction } from '../lib/ledger/engine.ts';

async function runLedgerResilienceTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.5 - CHAPTER 20 FINANCIAL LEDGER STRESS & INVARIANT HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Imbalance Guard Rejection (Must throw Error)
  try {
    await processTransaction({
      idempotencyKey: 'ledger-stress-001',
      description: 'Imbalanced Test',
      entries: [
        { accountId: 'ACC_USER_01', type: 'DEBIT', amount: 50000, currency: 'UGX' },
        { accountId: 'ACC_MERCHANT_01', type: 'CREDIT', amount: 40000, currency: 'UGX' },
      ],
    });
    console.error('❌ [FAILED] Imbalance Guard: Expected imbalance error to be thrown.');
    failed++;
  } catch (err) {
    console.log(`✔ [PASSED] Ledger Invariant Enforced: ${err.message}`);
    passed++;
  }

  // Test 2: Balanced Double-Entry Execution (Returns transaction object with id)
  try {
    const result = await processTransaction({
      idempotencyKey: 'ledger-stress-002',
      description: 'Balanced Test',
      entries: [
        { accountId: 'ACC_USER_01', type: 'DEBIT', amount: 50000, currency: 'UGX' },
        { accountId: 'ACC_MERCHANT_01', type: 'CREDIT', amount: 50000, currency: 'UGX' },
      ],
    });

    if (result && result.id) {
      console.log(`✔ [PASSED] Balanced Double-Entry Committed Successfully: ID ${result.id}`);
      passed++;
    } else {
      throw new Error(`Unexpected transaction output: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Balanced Ledger Execution: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 20 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runLedgerResilienceTests();
