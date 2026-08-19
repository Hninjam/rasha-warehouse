import 'package:flutter/material.dart';

/// Scaffold wrapped in right-to-left directionality, used by every page.
class RtlScaffold extends StatelessWidget {
  const RtlScaffold({Key? key, required this.body, this.bottomNavigationBar}) : super(key: key);

  final Widget body;
  final Widget? bottomNavigationBar;

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        body: body,
        bottomNavigationBar: bottomNavigationBar,
      ),
    );
  }
}

/// TextField with a Persian label, optionally obscured for passwords.
class LabeledField extends StatelessWidget {
  const LabeledField({Key? key, required this.controller, required this.label, this.obscureText = false}) : super(key: key);

  final TextEditingController controller;
  final String label;
  final bool obscureText;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: obscureText,
      decoration: InputDecoration(labelText: label),
    );
  }
}
