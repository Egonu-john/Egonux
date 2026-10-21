import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:egonux_mobile/features/auth/screens/onboarding_screen.dart';
import 'package:egonux_mobile/features/auth/screens/pdpa_consent_screen.dart';

void main() {
  testWidgets('Onboarding screen renders executive welcome and navigation', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: OnboardingScreen()));

    expect(find.text('EGONUX OS v3.4.0'), findsOneWidget);
    expect(find.text('Building Digital Wealth Ecosystems'), findsOneWidget);
    expect(find.text('CONTINUE TO PDPA CONSENT'), findsOneWidget);
  });

  testWidgets('PDPA consent screen enforces statutory checkbox validation', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: PdpaConsentScreen()));

    expect(find.text('Uganda PDPA 2019 Legal Notice'), findsOneWidget);
    expect(find.byType(Checkbox), findsOneWidget);

    // Attempt to enter without checking consent
    await tester.tap(find.text('ENTER EGONUX OS'));
    await tester.pump();

    expect(find.text('Please accept the statutory consent terms to proceed.'), findsOneWidget);
  });
}
