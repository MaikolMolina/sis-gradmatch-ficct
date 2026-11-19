import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../widgets/metric_card.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/resolution_dialog.dart';
import '../login_screen.dart';
import 'matchmaking_screen.dart';

/// Centro de Mando y Analítica del Director de Carrera SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony

class DirectorDashboardScreen extends StatefulWidget {
  const DirectorDashboardScreen({super.key});

  @override
  State<DirectorDashboardScreen> createState() => _DirectorDashboardScreenState();
}

class _DirectorDashboardScreenState extends State<DirectorDashboardScreen> {
  @override
  Widget build(BuildContext context) {
    final user = AuthService().currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text('🎓 SIS-GradMatch'),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: AppTheme.primaryLight,
                borderRadius: BorderRadius.circular(4),
              ),
              child: const Text(
                'DIRECTOR',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primaryBlue,
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, size: 20),
            tooltip: 'Cambiar de Usuario',
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Director Banner
            Card(
              color: AppTheme.primaryBlue,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: Colors.white,
                      child: Text(
                        user?.avatar ?? 'RM',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'M.Sc. Ing. Leonardo Vargas Peña',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Dirección de Carrera • Ing. Sistemas FICCT',
                            style: TextStyle(
                              color: Color(0xFFC7DBE8),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const StatusBadge(status: 'SEMESTRE II-2026'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // AI Matchmaking Call-To-Action Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF003366), Color(0xFF1E3E62)],
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 8,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  const Text('🤖', style: TextStyle(fontSize: 32)),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Laboratorio de Matchmaking IA',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'Emparejamiento de perfiles y resolución digital inmediata',
                          style: TextStyle(color: Color(0xFFE2E8F0), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentGold,
                      foregroundColor: AppTheme.primaryDark,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    ),
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const MatchmakingScreen()),
                      );
                    },
                    child: const Text('Abrir', style: TextStyle(fontWeight: FontWeight.w800)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Metrics Grid
            const Row(
              children: [
                Expanded(
                  child: MetricCard(
                    label: 'Postulantes',
                    value: '48',
                    icon: Icons.school,
                    accentColor: AppTheme.primaryBlue,
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: MetricCard(
                    label: 'Afinidad IA',
                    value: '88.4%',
                    icon: Icons.auto_awesome,
                    accentColor: AppTheme.accentGold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(
                  child: MetricCard(
                    label: 'Tutores Asignados',
                    value: '39',
                    icon: Icons.people,
                    accentColor: AppTheme.success,
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: MetricCard(
                    label: 'Resoluciones RA',
                    value: '35',
                    icon: Icons.description,
                    accentColor: AppTheme.accentRed,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Active Theses Table / List
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'EXPEDIENTES ACTIVOS DE GRADO',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _buildThesisRow(
                      context,
                      registro: '220011559',
                      student: 'Molina Cortez Maikol Anthony',
                      title: 'Sistema Inteligente de Gestión de Proyectos de Grado con ML',
                      tutor: 'Ing. Rolando Antoni Martínez Canedo',
                      resolution: 'RA-FICCT-0482/2026',
                      status: 'OBSERVADO',
                    ),
                    const Divider(color: AppTheme.borderColor),
                    _buildThesisRow(
                      context,
                      registro: '219045123',
                      student: 'Condori Flores Carlos',
                      title: 'Plataforma IoT de Detección de Fallas en Redes',
                      tutor: 'Ing. Marcos Balderrama Ruiz',
                      resolution: 'RA-FICCT-0479/2026',
                      status: 'EN REVISIÓN',
                    ),
                    const Divider(color: AppTheme.borderColor),
                    _buildThesisRow(
                      context,
                      registro: '220199432',
                      student: 'Guzmán Silva Andrea',
                      title: 'Modelo Predictivo de Deserción con Deep Learning',
                      tutor: 'Lic. Luis Vargas Pérez',
                      resolution: 'RA-FICCT-0465/2026',
                      status: 'APROBADO',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildThesisRow(
    BuildContext context, {
    required String registro,
    required String student,
    required String title,
    required String tutor,
    required String resolution,
    required String status,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(student, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              StatusBadge(status: status),
            ],
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Tutor: $tutor', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              InkWell(
                onTap: () {
                  ResolutionDialog.show(
                    context,
                    resolutionNumber: resolution,
                    studentName: student,
                    tutorName: tutor,
                  );
                },
                child: Text(
                  resolution,
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.accentRed,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
