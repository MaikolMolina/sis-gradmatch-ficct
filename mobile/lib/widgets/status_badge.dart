import 'package:flutter/material.dart';

/// Badge de Estado Reutilizable SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;

    final norm = status.toUpperCase();
    if (norm.contains('APROB') || norm.contains('COMPLET') || norm.contains('VIGENT')) {
      bg = const Color(0xFFD1FAE5);
      text = const Color(0xFF065F46);
    } else if (norm.contains('OBSERV')) {
      bg = const Color(0xFFFEE2E2);
      text = const Color(0xFF991B1B);
    } else if (norm.contains('REVIS')) {
      bg = const Color(0xFFDBEAFE);
      text = const Color(0xFF1E40AF);
    } else {
      bg = const Color(0xFFFEF3C7);
      text = const Color(0xFF92400E);
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: text,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
        ),
      ),
    );
  }
}
