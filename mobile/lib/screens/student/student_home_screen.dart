import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/file_helper.dart';
import '../../models/draft_model.dart';
import '../../models/thesis_model.dart';
import '../../services/auth_service.dart';
import '../../services/thesis_repository.dart';
import '../../widgets/document_viewer_dialog.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/resolution_dialog.dart';
import '../login_screen.dart';
import 'profile_upload_screen.dart';
import 'draft_upload_screen.dart';

/// Pantalla Principal del Estudiante Postulante SIS-GradMatch
/// Permite Subir Archivos Físicos, Visualizarlos y Descargarlos Directamente
/// Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3, 56 materias vencidas)

class StudentHomeScreen extends StatefulWidget {
  const StudentHomeScreen({super.key});

  @override
  State<StudentHomeScreen> createState() => _StudentHomeScreenState();
}

class _StudentHomeScreenState extends State<StudentHomeScreen> {
  final _repo = ThesisRepository.instance;
  late ThesisModel _thesis;
  bool _uploadingQuick = false;

  @override
  void initState() {
    super.initState();
    _thesis = _repo.thesis;
    _repo.addListener(_onRepoUpdated);
  }

  @override
  void dispose() {
    _repo.removeListener(_onRepoUpdated);
    super.dispose();
  }

  void _onRepoUpdated() {
    if (mounted) {
      setState(() {
        _thesis = _repo.thesis;
      });
    }
  }

  Future<void> _handleQuickUpload(ChapterDraft draft) async {
    try {
      final f = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx', 'zip', 'xlsx', 'png', 'jpg'],
      );
      if (f == null) return;

      setState(() => _uploadingQuick = true);
      final bytes = await f.readAsBytes();
      final len = await f.length() ?? bytes.length;
      final mb = len / (1024 * 1024);
      final sizeStr = mb >= 1.0 ? '${mb.toStringAsFixed(2)} MB' : '${(len / 1024).round()} KB';

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.primaryBlue,
            content: Row(
              children: [
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                ),
                const SizedBox(width: 10),
                Expanded(child: Text('Subiendo "${f.name}" al servidor universitario...')),
              ],
            ),
          ),
        );
      }

      final res = await _repo.uploadPhysicalFile(bytes, f.name);
      setState(() => _uploadingQuick = false);

      if (res != null) {
        final uploadedUrl = res['url'] as String? ?? '/storage/drafts/${f.name.replaceAll(' ', '_')}';
        final uploadedName = res['filename'] as String? ?? f.name;
        final uploadedSize = res['size'] as String? ?? sizeStr;

        await _repo.quickUpdateChapterFile(
          draft.id,
          fileName: uploadedName,
          fileSize: uploadedSize,
          fileUrl: uploadedUrl,
        );

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppTheme.success,
              content: Text('✅ Archivo "$uploadedName" ($uploadedSize) subido y vinculado con éxito.'),
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: AppTheme.accentRed,
              content: Text('⚠️ No se pudo completar la subida física al servidor.'),
            ),
          );
        }
      }
    } catch (e) {
      setState(() => _uploadingQuick = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppTheme.accentRed, content: Text('Error seleccionando archivo: $e')),
        );
      }
    }
  }

  void _showNotificationsDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(20),
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
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Centro de Alertas Push (FCM)',
                        style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
                      ),
                      Text(
                        'Firebase Cloud Messaging • FICCT UAGRM',
                        style: TextStyle(fontSize: 11, color: Colors.grey),
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
            const Divider(height: 24),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.check_circle, color: Color(0xFF2563EB), size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Dispositivo móvil conectado al Topic: ficct_gradmatch',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF1E40AF)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            _buildNotificationItem(
              icon: Icons.edit_note,
              color: Colors.orange,
              title: 'Nueva Observación en Capítulo 3',
              body: 'Tu tutor Ing. Rolando Martínez ha registrado correcciones metodológicas en la sección 3.6.',
              time: 'Hace 10 minutos',
            ),
            _buildNotificationItem(
              icon: Icons.check_circle_outline,
              color: Colors.green,
              title: 'Capítulo 1 Aprobado',
              body: 'Visto Bueno formal otorgado al Marco Teórico.',
              time: 'Ayer 16:30',
            ),
            _buildNotificationItem(
              icon: Icons.description_outlined,
              color: Colors.blue,
              title: 'Resolución de Grado Emitida',
              body: 'Resolución RA-FICCT-0482/2026 generada con QR oficial.',
              time: '15/11/2026',
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              icon: const Icon(Icons.send_rounded, size: 16),
              label: const Text('Simular Alerta Push del Tutor al Celular'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🔔 Alerta Push FCM despachada al topic ficct_gradmatch.'),
                    backgroundColor: Colors.green,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotificationItem({
    required IconData icon,
    required Color color,
    required String title,
    required String body,
    required String time,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: color.withOpacity(0.15),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                const SizedBox(height: 2),
                Text(body, style: const TextStyle(fontSize: 11, color: Colors.black87)),
                const SizedBox(height: 2),
                Text(time, style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ),
        ],
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
                'ESTUDIANTE',
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
            icon: const Badge(
              label: Text('3'),
              child: Icon(Icons.notifications_active, color: Colors.amber),
            ),
            tooltip: 'Centro de Alertas Push (Firebase FCM)',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Student Banner Card
            Card(
              color: AppTheme.primaryBlue,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white,
                      child: Text(
                        user?.avatar ?? 'MM',
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppTheme.primaryBlue,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.name ?? 'Molina Cortez Maikol Anthony',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'Reg: 220011559 • Egresado Habilitado (Malla 100%) • Plan 187-3',
                            style: TextStyle(
                              color: Color(0xFFC7DBE8),
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const StatusBadge(status: 'EGRESADO CPD'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Stepper Timeline Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'LÍNEA DE TIEMPO DE GRADUACIÓN',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 14),
                    _buildTimelineRow(context),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Thesis Details Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'MODALIDAD: PROYECTO DE GRADO',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                        StatusBadge(status: _thesis.status),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _thesis.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.primaryBlue,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppTheme.surfaceBg,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppTheme.borderColor),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Docente Tutor:', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              Text(
                                _thesis.tutorName ?? 'Ing. Rolando Antoni Martínez Canedo',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                          const Divider(height: 14, color: AppTheme.borderColor),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Resolución de Aprobación:', style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              InkWell(
                                onTap: () {
                                  ResolutionDialog.show(
                                    context,
                                    resolutionNumber: _thesis.resolutionNumber ?? 'RA-FICCT-0482/2026',
                                    studentName: _thesis.studentName,
                                    tutorName: _thesis.tutorName ?? 'Ing. Rolando Antoni Martínez Canedo',
                                  );
                                },
                                child: Text(
                                  _thesis.resolutionNumber ?? 'RA-FICCT-0482/2026',
                                  style: const TextStyle(
                                    fontSize: 12,
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
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Chapters and Deliverables
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'ENTREGABLES PRESENTADOS (${_thesis.chapters.length})',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textSecondary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        ElevatedButton.icon(
                          icon: const Icon(Icons.upload_file, size: 14),
                          label: const Text('Subir Entregable', style: TextStyle(fontSize: 11)),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          ),
                          onPressed: () async {
                            await Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const DraftUploadScreen()),
                            );
                            if (mounted) {
                              setState(() {
                                _thesis = _repo.thesis;
                              });
                            }
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    ..._thesis.chapters.map((ch) {
                      String badgeText = ch.deliverableType == 'COMPLETO'
                          ? '📄 COMPLETO'
                          : ch.deliverableType == 'ANEXO'
                              ? '📎 ANEXO'
                              : ch.deliverableType == 'MANUAL'
                                  ? '📘 MANUAL'
                                  : ch.deliverableType == 'CODIGO'
                                      ? '💻 CÓDIGO'
                                      : ch.deliverableType == 'INSTRUMENTO'
                                          ? '📊 INSTRUMENTO'
                                          : '📑 CAP. ${ch.chapterNumber}';

                      int compCount = ch.complementaryFiles.length;

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          border: Border.all(color: AppTheme.borderColor),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x08000000),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Top Row: Type Badge + Title + Status Badge
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryLight,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    badgeText,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      color: AppTheme.primaryBlue,
                                      fontSize: 10,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    ch.title,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                StatusBadge(status: ch.status),
                              ],
                            ),
                            const SizedBox(height: 6),

                            // File details row
                            Row(
                              children: [
                                const Icon(Icons.star, color: Color(0xFFD97706), size: 14),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '${ch.mainFileName} (${ch.mainFileSize}) • v${ch.version}',
                                    style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.w600),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                if (compCount > 0)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFE0F2FE),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      '📎 $compCount complementario(s)',
                                      style: const TextStyle(fontSize: 9, color: Color(0xFF0369A1), fontWeight: FontWeight.w700),
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 10),

                            // Direct Action Buttons: 📤 Subir, 👁️ Ver, ⬇ Descargar
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: const Icon(Icons.upload, size: 13),
                                    label: const Text('📤 Subir', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      backgroundColor: AppTheme.primaryBlue,
                                    ),
                                    onPressed: _uploadingQuick ? null : () => _handleQuickUpload(ch),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: OutlinedButton.icon(
                                    icon: const Icon(Icons.visibility, size: 13),
                                    label: const Text('👁️ Ver', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      foregroundColor: AppTheme.primaryBlue,
                                      side: const BorderSide(color: AppTheme.primaryBlue),
                                    ),
                                    onPressed: () {
                                      DocumentViewerDialog.show(context, ch);
                                    },
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    icon: const Icon(Icons.download, size: 13),
                                    label: const Text('⬇ Descargar', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(vertical: 8),
                                      backgroundColor: const Color(0xFF475569),
                                    ),
                                    onPressed: () {
                                      FileHelper.openOrDownloadFile(
                                        ch.mainFileUrl,
                                        isDownload: true,
                                        filename: ch.mainFileName,
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Tutor Observations List
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'OBSERVACIONES DEL TUTOR',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.accentRed,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: 10),
                    ..._thesis.activeObservations.map((obs) => Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFEF2F2),
                            border: Border.all(color: const Color(0xFFFECACA)),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    '${obs.type} • Pág. ${obs.page}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.accentRed,
                                    ),
                                  ),
                                  Text(obs.date, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                obs.comment,
                                style: const TextStyle(fontSize: 12, color: AppTheme.textPrimary, height: 1.3),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Profile Re-upload option
            OutlinedButton.icon(
              icon: const Icon(Icons.description, size: 18),
              label: const Text('Actualizar Perfil de Proyecto de Grado en PDF'),
              onPressed: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProfileUploadScreen()),
                );
                if (mounted) {
                  setState(() {
                    _thesis = _repo.thesis;
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineRow(BuildContext context) {
    final steps = [
      {'title': 'Malla 100%', 'done': true},
      {'title': 'Perfil NLP', 'done': true},
      {'title': 'Asesor RA', 'done': true},
      {'title': 'Borradores', 'done': false, 'active': true},
      {'title': 'Visto Bueno', 'done': false},
      {'title': 'Tribunal', 'done': false},
    ];

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: steps.map((s) {
        final isDone = s['done'] == true;
        final isActive = s['active'] == true;

        Color circleColor;
        Widget icon;
        if (isDone) {
          circleColor = AppTheme.success;
          icon = const Icon(Icons.check, size: 14, color: Colors.white);
        } else if (isActive) {
          circleColor = AppTheme.primaryBlue;
          icon = const Text('4', style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w700));
        } else {
          circleColor = const Color(0xFFE2E8F0);
          icon = const SizedBox();
        }

        return Column(
          children: [
            CircleAvatar(
              radius: 14,
              backgroundColor: circleColor,
              child: icon,
            ),
            const SizedBox(height: 4),
            Text(
              s['title'] as String,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                color: isActive ? AppTheme.primaryBlue : AppTheme.textSecondary,
              ),
            ),
          ],
        );
      }).toList(),
    );
  }
}
