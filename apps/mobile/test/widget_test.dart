import 'package:flutter_test/flutter_test.dart';
import 'package:egonux_mobile/main.dart';

void main() {
  testWidgets('Egonux Mobile App renders dashboard invariants correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const EgonuxMobileApp());

    expect(find.text('EGONUX OS v3.4.0'), findsOneWidget);
    expect(find.text('SYNTHETIC LEDGER'), findsOneWidget);
    expect(find.text('0.00 UGX'), findsOneWidget);
    expect(find.text('Kololo, Kampala'), findsOneWidget);
    expect(find.text('Uganda PDPA 2019'), findsOneWidget);
  });
}
