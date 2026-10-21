import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';

class CommerceScreen extends StatelessWidget {
  const CommerceScreen({super.key});

  final List<Map<String, String>> _products = const [
    {
      'title': 'EGONUX Digital Wealth Guide',
      'category': 'E-Book / Blueprint',
      'price': '50,000.00 UGX',
      'badge': 'BESTSELLER',
    },
    {
      'title': 'Full-Stack Architecture Mastery',
      'category': 'Course',
      'price': '150,000.00 UGX',
      'badge': 'PREMIUM',
    },
    {
      'title': 'Affiliate Partner Tier 1',
      'category': 'Network Access',
      'price': '100,000.00 UGX',
      'badge': 'EARN 20%',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'DIGITAL WEALTH HUB',
          style: TextStyle(
            color: AppColors.primaryGold,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20.0),
        itemCount: _products.length,
        separatorBuilder: (_, __) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final product = _products[index];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.cardBg,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAlignment: CrossAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product['category']!,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, letterSpacing: 1.2),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primaryGold.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primaryGold),
                      ),
                      child: Text(
                        product['badge']!,
                        style: const TextStyle(color: AppColors.primaryGold, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  product['title']!,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      product['price']!,
                      style: const TextStyle(color: AppColors.primaryGold, fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primaryGold,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Selected ${product['title']} in Sandbox Mode')),
                        );
                      },
                      child: const Text('EXPLORE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
