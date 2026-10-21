import { recordMetric, getHealthStatus } from '../lib/telemetry/monitor.ts';

async function runTelemetryTests() {
  console.log('====================================================================');
  console.log('EGONUX OS v3.4 - CHAPTER 16 TELEMETRY & HEALTH TEST HARNESS');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Metric Recording
  try {
    recordMetric('api_request_duration_ms', 42, { route: '/api/v1/orders' });
    recordMetric('ledger_transaction_count', 1, { status: 'SUCCESS' });

    const health = getHealthStatus();
    if (health.metricsRecorded >= 2 && health.status === 'HEALTHY') {
      console.log(`✔ [PASSED] System Health Status Checked: ${health.status} (${health.metricsRecorded} Metrics Tracked)`);
      passed++;
    } else {
      throw new Error(`Unexpected health status: ${JSON.stringify(health)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Telemetry Capture: ${err.message}`);
    failed++;
  }

  // Test 2: System Memory Telemetry
  try {
    const health = getHealthStatus();
    if (health.system.heapUsedMb > 0 && health.system.heapTotalMb > 0) {
      console.log(`✔ [PASSED] Memory Telemetry Verified: Heap Used ${health.system.heapUsedMb}MB / Total ${health.system.heapTotalMb}MB`);
      passed++;
    } else {
      throw new Error(`Memory metrics missing or invalid: ${JSON.stringify(health.system)}`);
    }
  } catch (err) {
    console.error(`❌ [FAILED] Memory Telemetry: ${err.message}`);
    failed++;
  }

  console.log('\n====================================================================');
  console.log(`CHAPTER 16 HARNESS RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runTelemetryTests();
