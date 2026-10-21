import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  final List<Map<String, String>> _telemetryEvents = const [
    {
      'event': 'API_SYNC_RECONCILED',
      'latency': '42ms',
      'status': 'SECURE',
      'timestamp': '16:20:10',
    },
    {
      'event': 'PDPA_CONSENT_CAPTURED',
      'latency': '12ms',
      'status': 'VERIFIED',
      'timestamp': '16:15:00',
    },
    {
      'event': 'LEDGER_ZERO_DRIFT_CHECK',
      'latency': '18ms',
      'status': 'PASSED',
      'timestamp': '16:10:45',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'ANALYTICS & TELEMETRY',
          style: TextStyle(
            color: AppColors.primaryGold,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAlignment: CrossAlignment.start,
          children: [
            // System Health Overview Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  Text(
                    'SYSTEM PERFORMANCE',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11, letterSpacing: 1.5),
                  ),
                  SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _MetricItem(label: 'Uptime', value: '99.99%'),
                      _MetricItem(label: 'Avg Latency', value: '24ms'),
                      _MetricItem(label: 'Drift Rate', value: '0.00'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'REAL-TIME AUDIT LOGS',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: ListView.separated(
                itemCount: _telemetryEvents.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final item = _telemetryEvents[index];
                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.cardBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAlignment: CrossAlignment.start,
                          children: [
                            Text(
                              item['event']!,
                              style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Latency: ${item['latency']} • ${item['timestamp']}',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            item['status']!,
                            style: const TextStyle(color: AppColors.success, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricItem extends StatelessWidget {
  final String label;
  final String value;

  const _MetricItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAlignment: CrossAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(color: AppColors.primaryGold, fontSize: 18, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
