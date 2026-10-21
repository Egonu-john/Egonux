import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  final List<Map<String, dynamic>> _tasks = const [
    {
      'title': 'Daily Governance Check-In',
      'points': '+100 PTS',
      'completed': true,
    },
    {
      'title': 'Complete Compliance Quiz',
      'points': '+250 PTS',
      'completed': false,
    },
    {
      'title': 'Share Affiliate Blueprint',
      'points': '+500 PTS',
      'completed': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'REWARDS & TASKS',
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
            // Points Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primaryGold),
              ),
              child: const Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  Text(
                    'SYNTHETIC REWARD POINTS',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 11, letterSpacing: 1.5),
                  ),
                  SizedBox(height: 8),
                  Text(
                    '850 PTS',
                    style: TextStyle(color: AppColors.primaryGold, fontSize: 32, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Current Streak: 7 Days 🔥',
                    style: TextStyle(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'DAILY GOALS & CHALLENGES',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Expanded(
              child: ListView.separated(
                itemCount: _tasks.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final task = _tasks[index];
                  final isDone = task['completed'] as bool;
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
                            Icon(
                              isDone ? Icons.check_circle : Icons.radio_button_unchecked,
                              color: isDone ? AppColors.success : AppColors.textSecondary,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              task['title'] as String,
                              style: TextStyle(
                                color: isDone ? AppColors.textSecondary : AppColors.textPrimary,
                                decoration: isDone ? TextDecoration.lineThrough : null,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          task['points'] as String,
                          style: const TextStyle(color: AppColors.primaryGold, fontWeight: FontWeight.bold, fontSize: 12),
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
