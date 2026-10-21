import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class LedgerScreen extends StatefulWidget {
  const LedgerScreen({super.key});

  @override
  State<LedgerScreen> createState() => _LedgerScreenState();
}

class _LedgerScreenState extends State<LedgerScreen> {
  final List<Map<String, String>> _transactions = [
    {
      'id': 'TXN-001',
      'type': 'SYNTHETIC_CREDIT',
      'amount': '+10,000.00 UGX',
      'status': 'RECONCILED',
      'date': '2026-10-21 14:00'
    },
    {
      'id': 'TXN-002',
      'type': 'SYNTHETIC_DEBIT',
      'amount': '-10,000.00 UGX',
      'status': 'RECONCILED',
      'date': '2026-10-21 14:05'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'SYNTHETIC LEDGER',
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
            // Balance Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryGold.withOpacity(0.5)),
              ),
              child: Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  const Text(
                    'TOTAL SYNTHETIC BALANCE',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11, letterSpacing: 1.5),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '0.00 UGX',
                    style: TextStyle(color: AppColors.primaryGold, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.shield_outlined, color: AppColors.success, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        'Zero Drift Invariant Confirmed (0.00 UGX)',
                        style: TextStyle(color: AppColors.success.withOpacity(0.9), fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'RECONCILED TRANSACTION HISTORY',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: ListView.separated(
                itemCount: _transactions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final txn = _transactions[index];
                  final isCredit = txn['type'] == 'SYNTHETIC_CREDIT';
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
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: (isCredit ? AppColors.success : AppColors.primaryGold).withOpacity(0

cd ~/Egonux/apps/mobile

mkdir -p lib/features/ledger/screens lib/features/ledger/widgets

cat << 'EOF' > lib/features/ledger/screens/ledger_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class LedgerScreen extends StatefulWidget {
  const LedgerScreen({super.key});

  @override
  State<LedgerScreen> createState() => _LedgerScreenState();
}

class _LedgerScreenState extends State<LedgerScreen> {
  final List<Map<String, String>> _transactions = [
    {
      'id': 'TXN-001',
      'type': 'SYNTHETIC_CREDIT',
      'amount': '+10,000.00 UGX',
      'status': 'RECONCILED',
      'date': '2026-10-21 14:00'
    },
    {
      'id': 'TXN-002',
      'type': 'SYNTHETIC_DEBIT',
      'amount': '-10,000.00 UGX',
      'status': 'RECONCILED',
      'date': '2026-10-21 14:05'
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'SYNTHETIC LEDGER',
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
            // Balance Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryGold.withOpacity(0.5)),
              ),
              child: Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  const Text(
                    'TOTAL SYNTHETIC BALANCE',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11, letterSpacing: 1.5),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '0.00 UGX',
                    style: TextStyle(color: AppColors.primaryGold, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.shield_outlined, color: AppColors.success, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        'Zero Drift Invariant Confirmed (0.00 UGX)',
                        style: TextStyle(color: AppColors.success.withOpacity(0.9), fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'RECONCILED TRANSACTION HISTORY',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: ListView.separated(
                itemCount: _transactions.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (context, index) {
                  final txn = _transactions[index];
                  final isCredit = txn['type'] == 'SYNTHETIC_CREDIT';
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
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: (isCredit ? AppColors.success : AppColors.primaryGold).withOpacity(0.2),
                              child: Icon(
                                isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                                color: isCredit ? AppColors.success : AppColors.primaryGold,
                                size: 18,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAlignment: CrossAlignment.start,
                              children: [
                                Text(
                                  txn['id']!,
                                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                Text(
                                  txn['date']!,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Column(
                          crossAlignment: CrossAlignment.end,
                          children: [
                            Text(
                              txn['amount']!,
                              style: TextStyle(
                                color: isCredit ? AppColors.success : AppColors.primaryGold,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                            Text(
                              txn['status']!,
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 10),
                            ),
                          ],
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
