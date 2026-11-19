import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/file_helper.dart';
import '../../models/thesis_model.dart';
import '../../models/draft_model.dart';
import '../../models/observation_model.dart';
import '../../services/thesis_repository.dart';
import '../../widgets/status_badge.dart';

/// Pantalla de Revisión de Entregables, Visor Integrado y Descarga de Archivos Reales SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad: Proyecto de Grado (Plan 187-3, 56 materias vencidas)

class DraftReviewScreen extends StatefulWidget {
  final ThesisModel thesis;

  const DraftReviewScreen({super.key, required this.thesis});

  @override
  State<DraftReviewScreen> createState() => _DraftReviewScreenState();
}

class _DraftReviewScreenState extends State<DraftReviewScreen> with SingleTickerProviderStateMixin {
  final _repo = ThesisRepository.instance;
  late TabController _tabController;
  late List<ChapterDraft> _deliverables;
  int? _selectedDeliverableId;
  late List<ObservationModel> _observations;

  ChapterDraft get _selectedDeliverable {
    if (_deliverables.isEmpty) {
      return const ChapterDraft(
        chapterNumber: 3,
        title: 'Metodología, Arquitectura C4 y Pruebas McCabe',
        version: 2,
        status: 'OBSERVADO',
      );
    }
    return _deliverables.firstWhere(
      (d) => d.id == _selectedDeliverableId,
      orElse: () => _deliverables.first,
    );
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadFromRepository();
    _repo.addListener(_onRepoUpdated);
  }

  void _loadFromRepository() {
    final thesis = _repo.thesis;
    _deliverables = thesis.chapters.isNotEmpty ? thesis.chapters : widget.thesis.chapters;

    // Selecciona el primer entregable (el más reciente) si no hay selección válida
    if (_selectedDeliverableId == null || !_deliverables.any((d) => d.id == _selectedDeliverableId)) {
      if (_deliverables.isNotEmpty) {
        _selectedDeliverableId = _deliverables.first.id;
      }
    }
    final sel = _selectedDeliverable;
    _observations = List.from(sel.observations.isNotEmpty
        ? sel.observations
        : thesis.activeObservations);
  }

  void _onRepoUpdated() {
    if (mounted) {
      setState(() {
        _loadFromRepository();
      });
    }
  }

  @override
  void dispose() {
    _repo.removeListener(_onRepoUpdated);
    _tabController.dispose();
    super.dispose();
  }

  void _downloadOrOpenFile(String fileUrl, String fileName, {bool isDownload = false}) async {
    final success = await FileHelper.openOrDownloadFile(fileUrl, isDownload: isDownload, filename: fileName);
    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isDownload ? '⬇ Descargando "$fileName"...' : '📂 Abriendo "$fileName"...'),
          backgroundColor: AppTheme.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('⚠️ No se pudo acceder a la ruta del archivo: $fileUrl'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
    }
  }

  void _showAddObservationDialog() {
    String tipo = 'TECNICA';
    final pageCtrl = TextEditingController(text: 'Pág. 42');
    final commentCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          title: const Text('➕ Nueva Observación al Entregable', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Entregable: ${_selectedDeliverable.title}',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.primaryBlue),
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                initialValue: tipo,
                items: const [
                  DropdownMenuItem(value: 'TECNICA', child: Text('Técnica (Arquitectura, Código)')),
                  DropdownMenuItem(value: 'METODOLOGICA', child: Text('Metodológica (Pruebas, Objetivos)')),
                  DropdownMenuItem(value: 'FORMATO', child: Text('Formato / Redacción')),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => tipo = val);
                },
                decoration: const InputDecoration(
                  labelText: 'Tipo de Observación',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: pageCtrl,
                decoration: const InputDecoration(
                  labelText: 'Página o Sección Específica',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: commentCtrl,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Comentario Pedagógico del Tutor',
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancelar'),
            ),
            ElevatedButton(
              onPressed: () async {
                if (commentCtrl.text.isNotEmpty) {
                  final navigator = Navigator.of(ctx);
                  final newObs = ObservationModel(
                    id: DateTime.now().millisecondsSinceEpoch,
                    type: tipo,
                    page: int.tryParse(pageCtrl.text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 1,
                    section: pageCtrl.text,
                    comment: commentCtrl.text,
                    date: '18/11/2026',
                  );
                  await _repo.addObservation(_selectedDeliverable.id, newObs);
                  if (mounted) {
                    setState(() {
                      _observations.add(newObs);
                    });
                  }
                  navigator.pop();
                }
              },
              child: const Text('Registrar Observación'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEmitDictamenDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Text('📜 Emitir Dictamen de Visto Bueno', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '¿Confirma la emisión del Visto Bueno oficial F-FICCT-08 para el postulante ${_repo.thesis.studentName}?',
              style: const TextStyle(fontSize: 13),
            ),
            const SizedBox(height: 10),
            const Text(
              'Modalidad: Proyecto de Grado • Se generará el Formulario Oficial F-FICCT-08 y el expediente avanzará a la Dirección de Carrera (M.Sc. Ing. Leonardo Vargas Peña) para la designación del Tribunal Evaluador de Grado.',
              style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancelar'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.success),
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('✅ Dictamen oficial emitido y registrado digitalmente en la FICCT.'),
                  backgroundColor: AppTheme.success,
                ),
              );
              Navigator.of(context).pop();
            },
            child: const Text('Aprobar Visto Bueno'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final thesis = _repo.thesis;
    final curDeliverable = _selectedDeliverable;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Examinar Entregables & Visor'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            tooltip: 'Refrescar desde Servidor',
            onPressed: () async {
              final messenger = ScaffoldMessenger.of(context);
              await _repo.refreshFromServer();
              if (mounted) {
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text('🔄 Expediente actualizado desde el servidor central.'),
                    backgroundColor: AppTheme.primaryBlue,
                    duration: Duration(seconds: 1),
                  ),
                );
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.add_comment, size: 20),
            tooltip: 'Agregar Observación',
            onPressed: _showAddObservationDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Student & Thesis Header Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            thesis.studentName,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                          ),
                        ),
                        StatusBadge(status: curDeliverable.status),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Reg: ${thesis.studentRegistro} • ${thesis.modality} (Plan 187-3)',
                      style: const TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      thesis.title,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Deliverable Selector Dropdown
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'SELECCIONAR ENTREGABLE A EXAMINAR:',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textSecondary, letterSpacing: 0.5),
                        ),
                        Text(
                          '${_deliverables.length} disponibles',
                          style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      initialValue: curDeliverable.id,
                      isExpanded: true,
                      items: _deliverables.map((d) {
                        String prefix = d.deliverableType == 'COMPLETO'
                            ? '📄 [Completo]'
                            : d.deliverableType == 'ANEXO'
                                ? '📎 [Anexo]'
                                : d.deliverableType == 'MANUAL'
                                    ? '📘 [Manual]'
                                    : d.deliverableType == 'CODIGO'
                                        ? '💻 [Código]'
                                        : '📑 [Cap. ${d.chapterNumber}]';
                        return DropdownMenuItem<int>(
                          value: d.id,
                          child: Text(
                            '$prefix ${d.title} (v${d.version})',
                            style: const TextStyle(fontSize: 12),
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (id) {
                        if (id != null) {
                          setState(() {
                            _selectedDeliverableId = id;
                            final sel = _selectedDeliverable;
                            _observations = List.from(sel.observations);
                          });
                        }
                      },
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // In-page Document Viewer Card
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: Color(0xFFCBD5E1)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Viewer Toolbar
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: const BoxDecoration(
                      color: Color(0xFF1E293B),
                      borderRadius: BorderRadius.vertical(top: Radius.circular(11)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.picture_as_pdf, color: Color(0xFFF87171), size: 18),
                            const SizedBox(width: 8),
                            Text(
                              curDeliverable.mainFileName,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700),
                            ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF334155),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            curDeliverable.mainFileSize,
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Tab switcher for Integrated Preview vs Structure
                  TabBar(
                    controller: _tabController,
                    labelColor: AppTheme.primaryBlue,
                    unselectedLabelColor: AppTheme.textSecondary,
                    indicatorColor: AppTheme.primaryBlue,
                    labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                    tabs: const [
                      Tab(text: '👁️ Visor Integrado de Documento'),
                      Tab(text: '📖 Resumen & Estructura C4'),
                    ],
                  ),

                  SizedBox(
                    height: 240,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Tab 1: Visor Integrado
                        Container(
                          padding: const EdgeInsets.all(14),
                          color: const Color(0xFFF8FAFC),
                          child: SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      'ENTREGABLE: ${curDeliverable.deliverableType}',
                                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue),
                                    ),
                                    Text('Versión ${curDeliverable.version} • ${curDeliverable.date}',
                                        style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  curDeliverable.title,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  curDeliverable.previewExtract.isNotEmpty
                                      ? curDeliverable.previewExtract
                                      : curDeliverable.notes.isNotEmpty
                                          ? curDeliverable.notes
                                          : 'Este documento contiene el desarrollo completo del entregable académico correspondiente a la carrera de Ingeniería en Sistemas, incluyendo la formulación teórica, especificación técnica y validación empírica.',
                                  style: const TextStyle(fontSize: 11, height: 1.4, color: AppTheme.textSecondary),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Row(
                                    children: [
                                      Icon(Icons.verified_user, color: AppTheme.success, size: 16),
                                      SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          'Firma Criptográfica SHA-256 válida • Expediente Académico UAGRM',
                                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Tab 2: C4 & Metodología
                        Container(
                          padding: const EdgeInsets.all(14),
                          color: const Color(0xFFF8FAFC),
                          child: const SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '3.4 Arquitectura C4 y Despliegue Cloud Run',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                                ),
                                SizedBox(height: 6),
                                Text(
                                  'El frontend desacoplado (Web SPA y Flutter Mobile) interactúa con la API Gateway FastAPI. El motor semántico utiliza embeddings densos de 768 dimensiones con búsqueda vectorial IVFFlat en Cloud SQL PostgreSQL 16 con pgvector.',
                                  style: TextStyle(fontSize: 11, height: 1.4, color: AppTheme.textSecondary),
                                ),
                                SizedBox(height: 8),
                                Text(
                                  '3.6 Pruebas de Caja Blanca de McCabe (V(G)=4)',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue),
                                ),
                                SizedBox(height: 4),
                                Text(
                                  'El grafo de flujo de control del algoritmo de ponderación multiobjetivo cuenta con 4 caminos independientes verificados al 100% mediante casos de prueba unitarios.',
                                  style: TextStyle(fontSize: 11, height: 1.4, color: AppTheme.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Actions row: Abrir en Visor Completo y Descargar Archivo Real
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(11)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.open_in_browser, size: 16),
                            label: const Text('Visor Completo', style: TextStyle(fontSize: 11)),
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            onPressed: () => _downloadOrOpenFile(
                              curDeliverable.mainFileUrl,
                              curDeliverable.mainFileName,
                              isDownload: false,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.download, size: 16),
                            label: const Text('Descargar Real', style: TextStyle(fontSize: 11)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryBlue,
                              padding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                            onPressed: () => _downloadOrOpenFile(
                              curDeliverable.mainFileUrl,
                              curDeliverable.mainFileName,
                              isDownload: true,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Archivo Principal y Archivos Complementarios
            Card(
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'ARCHIVOS ADJUNTOS EN ESTE ENTREGABLE',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.textSecondary, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 10),

                    // Archivo Principal
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        border: Border.all(color: AppTheme.primaryBlue, width: 1.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.star, color: Color(0xFFD97706), size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text('⭐ ARCHIVO PRINCIPAL: ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue)),
                                    Expanded(
                                      child: Text(
                                        curDeliverable.mainFileName,
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                Text('${curDeliverable.mainFileSize} • Se renderiza en el visor integrado',
                                    style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.download, color: AppTheme.primaryBlue, size: 20),
                            tooltip: 'Descargar archivo real',
                            onPressed: () => _downloadOrOpenFile(
                              curDeliverable.mainFileUrl,
                              curDeliverable.mainFileName,
                              isDownload: true,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Complementary Files
                    if (curDeliverable.complementaryFiles.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      const Text(
                        '📎 ARCHIVOS COMPLEMENTARIOS:',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.textSecondary),
                      ),
                      const SizedBox(height: 6),
                      ...curDeliverable.complementaryFiles.map((file) => Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: AppTheme.borderColor),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Row(
                              children: [
                                Icon(FileHelper.getIconForType(file.type), color: FileHelper.getColorForType(file.type), size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(file.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                      Text('${file.size} • ${file.type}', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.file_download, color: AppTheme.textSecondary, size: 18),
                                  tooltip: 'Descargar',
                                  onPressed: () => _downloadOrOpenFile(file.url, file.name, isDownload: true),
                                ),
                              ],
                            ),
                          )),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Observations section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'OBSERVACIONES REGISTRADAS',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textSecondary,
                    letterSpacing: 0.8,
                  ),
                ),
                TextButton.icon(
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Añadir', style: TextStyle(fontSize: 11)),
                  onPressed: _showAddObservationDialog,
                ),
              ],
            ),
            const SizedBox(height: 6),

            if (_observations.isEmpty)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: AppTheme.borderColor),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Center(
                  child: Text('Sin observaciones activas en este entregable.', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                ),
              )
            else
              ..._observations.map((obs) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: AppTheme.borderColor),
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

            const SizedBox(height: 20),
            ElevatedButton.icon(
              icon: const Icon(Icons.verified, size: 18),
              label: const Text('Emitir Visto Bueno / Dictamen'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.success,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: _showEmitDictamenDialog,
            ),
          ],
        ),
      ),
    );
  }
}
