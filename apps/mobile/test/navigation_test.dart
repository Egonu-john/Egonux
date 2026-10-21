import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:egonux_mobile/main.dart';

void main() {
  testWidgets('Main navigation wrapper switches between Dashboard, Ledger, and Settings', (WidgetTester tester) async {
    await tester.pumpWidget(const MaterialApp(home: MainNavigationWrapper()));

    // Verify initial Dashboard view
    expect(find.text('EGONUX OS v3.4.0'), findsOneWidget);

    // Tap Ledger navigation tab
    await tester.tap(find.text('Ledger'));
    await tester.pumpAndSettle();

    expect(find.text('SYNTHETIC LEDGER'), findsOneWidget);
    expect(find.text('RECONCILED TRANSACTION HISTORY'), findsOneWidget);

    // Tap Settings navigation tab
    await tester.tap(find.text('Settings'));
    await tester.pumpAndSettle();

    expect(find.text('GOVERNANCE & SETTINGS'), findsOneWidget);
    expect(find.text('Uganda PDPA 2019'), findsOneWidget);
  });
}
