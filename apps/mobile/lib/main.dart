// EGONUX WEALTH CENTRAL HUB — Flutter Mobile Engine
import 'package:flutter/material.dart';

void main() {
  runApp(const EgonuxApp());
}

class EgonuxApp extends StatelessWidget {
  const EgonuxApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EGONUX OS',
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: Center(
          child: Text('EGONUX WEALTH CENTRAL HUB — MOBILE ALPHA'),
        ),
      ),
    );
  }
}
