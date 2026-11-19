library;

import 'package:flutter/foundation.dart';

/// Constantes de la API SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// FICCT - UAGRM | Semestre II-2026
/// Modalidad: Proyecto de Grado (Plan 187-3)

class ApiConstants {
  static const String appName = 'SIS-GradMatch';
  static const String institution = 'FICCT • UAGRM';
  static const String developer = 'Molina Cortez Maikol Anthony';
  static const String subject = 'Ingeniería de Software II';

  // Base URL dinámica: Web usa origin, en dispositivos móviles conecta directamente a la nube
  static String get baseUrl {
    if (kIsWeb) {
      final origin = Uri.base.origin;
      if (origin.isNotEmpty && origin != 'null') {
        return '$origin/api/v1';
      }
    }
    // Celulares Android y producción en la nube
    return 'https://sis-gradmatch-jyq66kbdha-uc.a.run.app/api/v1';
  }

  static const String androidEmulatorUrl = 'https://sis-gradmatch-jyq66kbdha-uc.a.run.app/api/v1';

  // Endpoints
  static const String loginEndpoint = '/auth/login';
  static const String meEndpoint = '/auth/me';
  static const String matchmakingEndpoint = '/matchmaking/calculate';
  static const String confirmAssignmentEndpoint = '/matchmaking/confirmar-asignacion';
  static const String tutorInboxEndpoint = '/tutor/bandeja';
  static const String analyticsEndpoint = '/analytics/metricas';
  static const String cpdEndpoint = '/cpd/habilitacion';
}
