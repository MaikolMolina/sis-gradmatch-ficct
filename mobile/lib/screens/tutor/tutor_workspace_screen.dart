import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/thesis_model.dart';
import '../../services/auth_service.dart';
import '../../services/api_service.dart';
import '../../services/thesis_repository.dart';
import '../../services/notification_service.dart';
import '../../widgets/status_badge.dart';
import '../login_screen.dart';
import 'draft_review_screen.dart';

/// Bandeja de Entrada del Docente Tutor SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony

class TutorWorkspaceScreen extends StatefulWidget {
  const TutorWorkspaceScreen({super.key});

  @override
  State<TutorWorkspaceScreen> createState() => _TutorWorkspaceScreenState();
}

class _TutorWorkspaceScreenState extends State<TutorWorkspaceScreen> {
  final _api = MobileApiService();
  List<ThesisModel> _theses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTheses();
    ThesisRepository.instance.addListener(_onRepoChanged);
  }

  @override
  void dispose() {
    ThesisRepository.instance.removeListener(_onRepoChanged);
    super.dispose();
  }

  void _onRepoChanged() {
    if (mounted) {
      _loadTheses();
    }
  }

  Future<void> _loadTheses() async {
    final list = await _api.getTutorTheses();
    if (!mounted) return;
    setState(() {
      _theses = list;
      _loading = false;
    });
  }

  void _showNotificationsDialog(BuildContext context) {
    NotificationService.instance.markAllAsRead();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.8),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(Icons.notifications_active, color: Colors.amber, size: 26),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Alertas Tutoriales en Vivo (FCM)',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      ValueListenableBuilder<String>(
                        valueListenable: NotificationService.instance.connectionStatus,
                        builder: (_, status, __) => Text(
                          'Firebase Cloud Messaging • $status',
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const Divider(height: 20),
            Expanded(
              child: ValueListenableBuilder<List<NotificationItem>>(
                valueListenable: NotificationService.instance.notificationsNotifier,
                builder: (_, list, __) {
                  if (list.isEmpty) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Text('No hay alertas tutoriales pendientes.'),
                      ),
                    );
                  }
                  return ListView.builder(
                    itemCount: list.length,
                    itemBuilder: (_, i) {
                      final item = list[i];
                      return ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: Color(0xFFEFF6FF),
                          child: Icon(Icons.assignment_turned_in, color: Color(0xFF2563EB), size: 20),
                        ),
                        title: Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        subtitle: Text(item.message, style: const TextStyle(fontSize: 11)),
                        trailing: Text(item.timestamp, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

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
                'TUTOR',
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
            icon: ValueListenableBuilder<int>(
              valueListenable: NotificationService.instance.unreadCountNotifier,
              builder: (_, count, __) => count > 0
                  ? Badge(
                      label: Text('$count'),
                      child: const Icon(Icons.notifications_active, color: Colors.amber),
                    )
                  : const Icon(Icons.notifications_none, color: Colors.white),
            ),
            tooltip: 'Alertas FCM de Entregas de Estudiantes',
            onPressed: () => _showNotificationsDialog(context),
          ),
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
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Tutor Profile Header Card
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
                              user?.avatar ?? 'MC',
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
                                  user?.name ?? 'Ing. Rolando Antoni Martínez Canedo',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  user?.department ?? 'Sistemas Inteligentes & Software',
                                  style: const TextStyle(
                                    color: Color(0xFFC7DBE8),
                                    fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.accentGold,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              '3 / 5 Plazas',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primaryDark,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Section Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'TESISTAS ASIGNADOS PARA REVISIÓN',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textSecondary,
                          letterSpacing: 0.8,
                        ),
                      ),
                      Text(
                        '${_theses.length} Activos',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.primaryBlue),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Theses List
                  ..._theses.map((thesis) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      thesis.studentName,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w800,
                                        color: AppTheme.textPrimary,
                                      ),
                                    ),
                                  ),
                                  StatusBadge(status: thesis.status),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Reg: ${thesis.studentRegistro} • ${thesis.modality}',
                                style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                thesis.title,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.primaryBlue,
                                  fontWeight: FontWeight.w600,
                                  height: 1.3,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 12),

                              // Progress bar
                              Row(
                                children: [
                                  Expanded(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: LinearProgressIndicator(
                                        value: thesis.progressPercent / 100,
                                        minHeight: 6,
                                        backgroundColor: const Color(0xFFE2E8F0),
                                        valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryBlue),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Text(
                                    '${thesis.progressPercent}% (Cap. ${thesis.currentChapter})',
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              Align(
                                alignment: Alignment.centerRight,
                                child: ElevatedButton.icon(
                                  icon: const Icon(Icons.rate_review, size: 14),
                                  label: const Text('Examinar Borrador', style: TextStyle(fontSize: 12)),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  ),
                                  onPressed: () async {
                                    await Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => DraftReviewScreen(thesis: thesis),
                                      ),
                                    );
                                    _loadTheses();
                                  },
                                ),
                              ),
                            ],
                          ),
                        ),
                      )),
                ],
              ),
            ),
    );
  }
}
