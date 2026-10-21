import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../widgets/gold_button.dart';
import 'pdpa_consent_screen.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAlignment: CrossAlignment.start,
            children: [
              const SizedBox(height: 20),
              Column(
                crossAlignment: CrossAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGold.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.primaryGold),
                    ),
                    child: const Text(
                      'EGONUX OS v3.4.0',
                      style: TextStyle(
                        color: AppColors.primaryGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Building Digital Wealth Ecosystems',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      height: 1.2,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Governed execution under ANOSA Executive Protocols. Integrated fintech, synthetic ledgers, and privacy-first infrastructure.',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 14,
                      height: 1.5,
                    ),
                  ),
                ],
              ),
              Column(
                children: [
                  GoldButton(
                    label: 'CONTINUE TO PDPA CONSENT',
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const PdpaConsentScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Operating Base: Kololo, Kampala, Uganda',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
