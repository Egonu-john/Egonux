import { processTransaction } from '../lib/ledger/engine.ts';

async function runLedgerTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.4 - CHAPTER 12 FINANCIAL LEDGER TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Valid Double-Entry Transaction
  try {
    const tx = await processTransaction({
      idempotencyKey: 'tx-test-001',
      description: 'Initial wallet funding test',
      entries: [
        { accountId: 'ASSET_CASH', type: 'DEBIT', amount: 50000, currency: 'UGX' },
        { accountId: 'EQUITY_CAPITAL', type: 'CREDIT', amount: 50000, currency: 'UGX' }
      ]
    });
    console.log(`✔ [PASSED] Valid Double-Entry Processed: ID ${tx.id}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAILED] Valid Double-Entry: ${err.message}`);
    failed++;
  }

  // Test 2: Imbalanced Transaction Rejection
  try {
    await processTransaction({
      idempotencyKey: 'tx-test-002',
      description: 'Imbalanced transaction test',
      entries: [
        { accountId: 'ASSET_CASH', type: 'DEBIT', amount: 50000, currency: 'UGX' },
        { accountId: 'EQUITY_CAPITAL', type: 'CREDIT', amount: 40000, currency: 'UGX' }
      ]
    });
    console.error('❌ [FAILED] Imbalance Guard: Expected error but transaction succeeded.');
    failed++;
  } catch (err) {
    console.log(`✔ [PASSED] Imbalance Guard Enforced: ${err.message}`);
    passed++;
  }

  // Test 3: Idempotency Duplicate Rejection
  try {
    await processTransaction({
      idempotencyKey: 'tx-test-001', // Duplicate key from Test 1
      description: 'Duplicate replay test',
      entries: [
        { accountId: 'ASSET_CASH', type: 'DEBIT', amount: 50000, currency: 'UGX' },
        { accountId: 'EQUITY_CAPITAL', type: 'CREDIT', amount: 50000, currency: 'UGX' }
      ]
    });
    console.error('❌ [FAILED] Idempotency Guard: Expected duplicate rejection.');
    failed++;
  } catch (err) {
    console.log(`✔ [PASSED] Idempotency Guard Enforced: ${err.message}`);
    passed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 12 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runLedgerTests();
