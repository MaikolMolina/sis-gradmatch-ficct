import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'services/auth_service.dart';
import 'services/thesis_repository.dart';
import 'screens/login_screen.dart';

/// Punto de Entrada Principal SIS-GradMatch Móvil (Android / iOS / Web)
/// Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones - UAGRM
/// Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3, Malla 100% Vencida) | II-2026

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AuthService().init();
  await ThesisRepository.instance.init();
  runApp(const SisGradMatchApp());
}

class SisGradMatchApp extends StatelessWidget {
  const SisGradMatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SIS-GradMatch Móvil',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}
