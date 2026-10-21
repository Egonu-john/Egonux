import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'GOVERNANCE & SETTINGS',
          style: TextStyle(
            color: AppColors.primaryGold,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAlignment: CrossAlignment.start,
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primaryGold,
                    child: Text(
                      'JU',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    ),
                  ),
                  SizedBox(width: 16),
                  Column(
                    crossAlignment: CrossAlignment.start,
                    children: [
                      Text(
                        'John William Egonu',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Founder & Chief Executive Officer',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'STATUTORY & LEGAL STANDARDS',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                children: [
                  _SettingRow(
                    icon: Icons.gavel_outlined,
                    label: 'Jurisdiction',
                    value: 'Uganda PDPA 2019',
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.verified_user_outlined,
                    label: 'Consent Status',
                    value: 'ACTIVE & AUDITED',
                    valueColor: AppColors.success,
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.location_on_outlined,
                    label: 'Operating Base',
                    value: 'Kololo, Kampala',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'PLATFORM PROTOCOLS',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                children: [
                  _SettingRow(
                    icon: Icons.security_outlined,
                    label: 'Governance Model',
                    value: 'ANOSA Protocol',
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.people_outline,
                    label: 'Cohort Safety Lock',
                    value: '2 Participants',
                  ),
                  Divider

cd ~/Egonux/apps/mobile

mkdir -p lib/features/settings/screens

cat << 'EOF' > lib/features/settings/screens/settings_screen.dart
import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'GOVERNANCE & SETTINGS',
          style: TextStyle(
            color: AppColors.primaryGold,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAlignment: CrossAlignment.start,
          children: [
            // Profile Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primaryGold,
                    child: Text(
                      'JU',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
                    ),
                  ),
                  SizedBox(width: 16),
                  Column(
                    crossAlignment: CrossAlignment.start,
                    children: [
                      Text(
                        'John William Egonu',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Founder & Chief Executive Officer',
                        style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'STATUTORY & LEGAL STANDARDS',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                children: [
                  _SettingRow(
                    icon: Icons.gavel_outlined,
                    label: 'Jurisdiction',
                    value: 'Uganda PDPA 2019',
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.verified_user_outlined,
                    label: 'Consent Status',
                    value: 'ACTIVE & AUDITED',
                    valueColor: AppColors.success,
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.location_on_outlined,
                    label: 'Operating Base',
                    value: 'Kololo, Kampala',
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'PLATFORM PROTOCOLS',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 12, letterSpacing: 1.5),
            ),
            const SizedBox(height: 12),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
              ),
              child: const Column(
                children: [
                  _SettingRow(
                    icon: Icons.security_outlined,
                    label: 'Governance Model',
                    value: 'ANOSA Protocol',
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.people_outline,
                    label: 'Cohort Safety Lock',
                    value: '2 Participants',
                  ),
                  Divider(color: AppColors.border),
                  _SettingRow(
                    icon: Icons.account_balance_wallet_outlined,
                    label: 'Ledger State',
                    value: 'Zero Drift (0.00 UGX)',
                    valueColor: AppColors.primaryGold,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _SettingRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.primaryGold, size: 20),
              const SizedBox(width: 12),
              Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppColors.textPrimary,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
