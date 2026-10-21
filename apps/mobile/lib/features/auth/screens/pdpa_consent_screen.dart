import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../main.dart';
import '../widgets/gold_button.dart';

class PdpaConsentScreen extends StatefulWidget {
  const PdpaConsentScreen({super.key});

  @override
  State<PdpaConsentScreen> createState() => _PdpaConsentScreenState();
}

class _PdpaConsentScreenState extends State<PdpaConsentScreen> {
  bool _consentGiven = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('STATUTORY CONSENT'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAlignment: CrossAlignment.start,
            children: [
              const Text(
                'Uganda PDPA 2019 Legal Notice',
                style: TextStyle(
                  color: AppColors.primaryGold,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const SingleChildScrollView(
                    child: Text(
                      'In accordance with the Uganda Data Protection and Privacy Act (PDPA 2019), EGONUX OS operates under strict zero-PII exposure telemetry guidelines.\n\n'
                      '1. Purpose Specification: Personal identifiers are never logged to public telemetry.\n'
                      '2. Cohort Safety: Active pilot cohorts are locked and subject to zero real-money movement guards.\n'
                      '3. Immutable Audit Trails: All consent captures are logged with timestamped integrity proofs.\n\n'
                      'By proceeding, you explicitly grant consent for sandbox telemetry processing under ANOSA Executive Intelligence Protocols.',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.6),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Checkbox(
                    value: _consentGiven,
                    activeColor: AppColors.primaryGold,
                    checkColor: Colors.black,
                    onChanged: (val) {
                      setState(() {
                        _consentGiven = val ?? false;
                      });
                    },
                  ),
                  const Expanded(
                    child: Text(
                      'I have read and agree to the Uganda PDPA 2019 statutory terms.',
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              GoldButton(
                label: 'ENTER EGONUX OS',
                onPressed: _consentGiven
                    ? () {
                        Navigator.pushAndRemoveUntil(
                          context,
                          MaterialPageRoute(builder: (_) => const DashboardScreen()),
                          (route) => false,
                        );
                      }
                    : () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Please accept the statutory consent terms to proceed.')),
                        );
                      },
              ),
            ],
          ),
        ),
      ),
    );
  }
}
