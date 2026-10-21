import { recordAuditEntry, verifyAuditChainIntegrity } from '../lib/governance/audit.ts';

async function runGovernanceTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.5 - CHAPTER 19 DATA GOVERNANCE & AUDIT TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Record Audit Chain Entries and Verify Integrity
  try {
    recordAuditEntry('ADMIN_01', 'USER_CONSENT_GRANTED');
    recordAuditEntry('ADMIN_01', 'DATA_EXPORT_INITIATED');

    const isValid = verifyAuditChainIntegrity();
    if (isValid) {
      console.log('✔ [PASSED] Audit Chain Integrity Verified: SHA-256 cryptographic linkage valid');
      passed++;
    } else {
      throw new Error('Audit chain integrity check failed on valid chain.');
    }
  } catch (err) {
    console.error(`❌ [FAILED] Audit Chain Verification: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 19 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runGovernanceTests();
