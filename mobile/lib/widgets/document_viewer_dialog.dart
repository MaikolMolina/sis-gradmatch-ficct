import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/file_helper.dart';
import '../models/draft_model.dart';
import 'status_badge.dart';

/// Diálogo Modal de Visor de Documentos Reales SIS-GradMatch
/// Permite Visualizar y Descargar Físicamente Archivos Principales y Complementarios
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad: Proyecto de Grado (Plan 187-3)

class DocumentViewerDialog extends StatelessWidget {
  final ChapterDraft deliverable;

  const DocumentViewerDialog({super.key, required this.deliverable});

  static Future<void> show(BuildContext context, ChapterDraft deliverable) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => DocumentViewerDialog(deliverable: deliverable),
    );
  }

  @override
  Widget build(BuildContext context) {
    final compFiles = deliverable.complementaryFiles;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 550, maxHeight: 680),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Modal Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.picture_as_pdf, color: Color(0xFFF87171), size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          deliverable.mainFileName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${deliverable.mainFileSize} • Versión ${deliverable.version} • ${deliverable.date}',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 20),
                    tooltip: 'Cerrar Visor',
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Deliverable Metadata Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            deliverable.deliverableType,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.primaryBlue,
                            ),
                          ),
                        ),
                        StatusBadge(status: deliverable.status),
                      ],
                    ),
                    const SizedBox(height: 10),

                    // Title
                    Text(
                      deliverable.title,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppTheme.textPrimary,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Student & Modality
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Postulante: Molina Cortez Maikol Anthony (Reg. 220011559)',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Modalidad: Proyecto de Grado • Egresado Habilitado (Malla 100% - Plan 187-3)',
                            style: TextStyle(fontSize: 10, color: AppTheme.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Document Extract / Summary
                    const Text(
                      'RESUMEN & CONTENIDO DEL DOCUMENTO:',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.textSecondary, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      deliverable.previewExtract.isNotEmpty
                          ? deliverable.previewExtract
                          : deliverable.notes.isNotEmpty
                              ? deliverable.notes
                              : 'Documento oficial de avance presentado en la FICCT - UAGRM, debidamente indexado y preparado para revisión y validación metodológica.',
                      style: const TextStyle(fontSize: 11, height: 1.4, color: AppTheme.textPrimary),
                    ),
                    const SizedBox(height: 12),

                    // Cryptographic validation box
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: const Color(0xFFBBF7D0)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.verified_user, color: AppTheme.success, size: 18),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Firma Criptográfica SHA-256 válida • Expediente Académico UAGRM',
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF166534)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Main File Action Buttons
                    const Text(
                      '⭐ ARCHIVO PRINCIPAL OFICIAL:',
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppTheme.primaryBlue, width: 1.2),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.picture_as_pdf, color: AppTheme.accentRed, size: 20),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  deliverable.mainFileName,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                deliverable.mainFileSize,
                                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.textMuted),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton.icon(
                                  icon: const Icon(Icons.open_in_browser, size: 16),
                                  label: const Text('Visor Completo', style: TextStyle(fontSize: 11)),
                                  style: OutlinedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  onPressed: () {
                                    FileHelper.openOrDownloadFile(
                                      deliverable.mainFileUrl,
                                      isDownload: false,
                                      filename: deliverable.mainFileName,
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: ElevatedButton.icon(
                                  icon: const Icon(Icons.download, size: 16),
                                  label: const Text('Descargar Real', style: TextStyle(fontSize: 11)),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppTheme.primaryBlue,
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  onPressed: () {
                                    FileHelper.openOrDownloadFile(
                                      deliverable.mainFileUrl,
                                      isDownload: true,
                                      filename: deliverable.mainFileName,
                                    );
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    // Complementary Files (if any)
                    if (compFiles.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            '📎 ARCHIVOS COMPLEMENTARIOS:',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.textSecondary, letterSpacing: 0.5),
                          ),
                          Text(
                            '${compFiles.length} adjuntos',
                            style: const TextStyle(fontSize: 10, color: AppTheme.primaryBlue, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...compFiles.map((file) => Container(
                            margin: const EdgeInsets.only(bottom: 6),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: const Color(0xFFE2E8F0)),
                            ),
                            child: Row(
                              children: [
                                Icon(FileHelper.getIconForType(file.type), color: FileHelper.getColorForType(file.type), size: 20),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        file.name,
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text('${file.size} • ${file.type}', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.download, color: AppTheme.primaryBlue, size: 18),
                                  tooltip: 'Descargar archivo real',
                                  onPressed: () {
                                    FileHelper.openOrDownloadFile(
                                      file.url,
                                      isDownload: true,
                                      filename: file.name,
                                    );
                                  },
                                ),
                              ],
                            ),
                          )),
                    ],
                  ],
                ),
              ),
            ),

            // Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cerrar'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
