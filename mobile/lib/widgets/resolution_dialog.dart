import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

/// Modal Oficial de Resolución Administrativa Digital
/// Desarrollador Único: Molina Cortez Maikol Anthony

class ResolutionDialog extends StatelessWidget {
  final String resolutionNumber;
  final String studentName;
  final String tutorName;

  const ResolutionDialog({
    super.key,
    required this.resolutionNumber,
    required this.studentName,
    required this.tutorName,
  });

  static void show(
    BuildContext context, {
    required String resolutionNumber,
    required String studentName,
    required String tutorName,
  }) {
    showDialog(
      context: context,
      builder: (ctx) => ResolutionDialog(
        resolutionNumber: resolutionNumber,
        studentName: studentName,
        tutorName: tutorName,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxWidth: 500),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    '🏛️ Resolución Digital',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primaryBlue,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const Divider(color: AppTheme.borderColor),
              const SizedBox(height: 8),

              // Seal & Official Heading
              Container(
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color: AppTheme.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    const Text(
                      'UNIVERSIDAD AUTÓNOMA GABRIEL RENÉ MORENO',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryBlue,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const Text(
                      'FACULTAD DE CIENCIAS DE LA COMPUTACIÓN Y TELECOMUNICACIONES',
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.accentRed,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      resolutionNumber,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.primaryBlue,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),
              // Body
              Text(
                'ARTÍCULO PRIMERO.- DESIGNAR formalmente al docente:',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  tutorName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    color: AppTheme.primaryBlue,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'en calidad de DOCENTE TUTOR / ASESOR del estudiante postulante $studentName para el proyecto de grado registrado durante el Semestre II-2026.',
                style: const TextStyle(fontSize: 12, height: 1.4),
                textAlign: TextAlign.justify,
              ),

              const SizedBox(height: 16),
              // Signatures
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  border: Border.all(color: AppTheme.borderColor),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Column(
                  children: [
                    Text(
                      'M.Sc. Ing. Leonardo Vargas Peña',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      'Director Carrera Ingeniería en Sistemas',
                      style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                    ),
                    Text(
                      'Firma Digital Verificada: FICCT-DIR-94A1-2026',
                      style: TextStyle(fontSize: 9, color: AppTheme.primaryBlue, fontFamily: 'monospace'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),
              ElevatedButton.icon(
                icon: const Icon(Icons.check, size: 18),
                label: const Text('Aceptar y Cerrar'),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
