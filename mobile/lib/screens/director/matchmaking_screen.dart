import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/match_candidate_model.dart';
import '../../services/api_service.dart';
import '../../widgets/resolution_dialog.dart';

/// Laboratorio de Matchmaking Estudiante-Tutor con Algoritmo de Similitud Coseno
/// Desarrollador Único: Molina Cortez Maikol Anthony

class MatchmakingScreen extends StatefulWidget {
  const MatchmakingScreen({super.key});

  @override
  State<MatchmakingScreen> createState() => _MatchmakingScreenState();
}

class _MatchmakingScreenState extends State<MatchmakingScreen> {
  final _api = MobileApiService();
  double _semanticWeight = 0.70;
  bool _calculating = false;
  List<MatchCandidate>? _candidates;

  Future<void> _runMatch() async {
    setState(() => _calculating = true);
    final results = await _api.runMatchmaking(
      perfilId: 1,
      wSemantic: _semanticWeight,
      wCapacity: 1.0 - _semanticWeight,
    );
    if (!mounted) return;
    setState(() {
      _candidates = results;
      _calculating = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Matchmaking Inteligente'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Target Student Profile Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'PERFIL POSTULANTE A EMPAREJAR',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.primaryBlue,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Molina Cortez Maikol Anthony (Reg: 220011559)',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning',
                      style: TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.3),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Weights Control Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Afinidad Semántica:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Text(
                          '${(_semanticWeight * 100).toInt()}%',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue),
                        ),
                      ],
                    ),
                    Slider(
                      value: _semanticWeight,
                      min: 0.2,
                      max: 0.9,
                      divisions: 7,
                      activeColor: AppTheme.primaryBlue,
                      onChanged: (val) {
                        setState(() => _semanticWeight = val);
                      },
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Balance Plazas Docentes:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Text(
                          '${((1.0 - _semanticWeight) * 100).toInt()}%',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppTheme.accentGold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    ElevatedButton(
                      onPressed: _calculating ? null : _runMatch,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: _calculating
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.bolt, size: 18),
                                SizedBox(width: 6),
                                Text('Calcular Similitud Coseno'),
                              ],
                            ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Results List
            if (_candidates != null) ...[
              const Text(
                'TOP 3 DOCENTES RECOMENDADOS POR IA',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.textSecondary,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: 10),
              ..._candidates!.map((c) => Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              CircleAvatar(
                                radius: 14,
                                backgroundColor: c.ranking == 1 ? AppTheme.accentGold : AppTheme.primaryLight,
                                child: Text(
                                  '#${c.ranking}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: c.ranking == 1 ? AppTheme.primaryDark : AppTheme.primaryBlue,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      c.teacherName,
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                                    ),
                                    Text(
                                      c.department,
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            c.justification,
                            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary, height: 1.3),
                          ),
                          const SizedBox(height: 12),

                          // Scores row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Afinidad: ${(c.semanticAffinity * 100).toStringAsFixed(1)}%',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                              ),
                              Text(
                                'Plazas: ${c.availableQuota} de ${c.maxQuota}',
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.success),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: c.compositeScore,
                              minHeight: 6,
                              backgroundColor: const Color(0xFFE2E8F0),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                c.ranking == 1 ? AppTheme.success : AppTheme.primaryBlue,
                              ),
                            ),
                          ),
                          const SizedBox(height: 14),

                          Align(
                            alignment: Alignment.centerRight,
                            child: ElevatedButton.icon(
                              icon: const Icon(Icons.verified, size: 14),
                              label: const Text('Asignar Tutor & Emitir RA', style: TextStyle(fontSize: 11)),
                              style: ElevatedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              ),
                              onPressed: () {
                                ResolutionDialog.show(
                                  context,
                                  resolutionNumber: 'RA-FICCT-0482/2026',
                                  studentName: 'Molina Cortez Maikol Anthony',
                                  tutorName: c.teacherName,
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  )),
            ],
          ],
        ),
      ),
    );
  }
}
