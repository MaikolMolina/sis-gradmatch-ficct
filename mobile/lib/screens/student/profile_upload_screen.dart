import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../services/thesis_repository.dart';

/// Pantalla de Carga de Perfil de Proyecto de Grado en PDF con Extracción NLP
/// Desarrollador Único: Molina Cortez Maikol Anthony (Reg. 220011559)
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3, 56 materias vencidas)

class ProfileUploadScreen extends StatefulWidget {
  const ProfileUploadScreen({super.key});

  @override
  State<ProfileUploadScreen> createState() => _ProfileUploadScreenState();
}

class _ProfileUploadScreenState extends State<ProfileUploadScreen> {
  final _titleCtrl = TextEditingController(
    text: 'Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada con Machine Learning',
  );
  final _summaryCtrl = TextEditingController(
    text: 'Plataforma integral con modelos de similitud coseno vectorial, arquitectura limpia C4 y visor colaborativo para optimizar el proceso de titulación en la FICCT UAGRM.',
  );
  String _profileFileName = 'Perfil_Proyecto_Grado_Molina_2026.pdf';
  String _profileFileSize = '1.4 MB';
  Uint8List? _profileBytes;
  bool _hasCustomFile = false;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _summaryCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    try {
      final f = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx'],
      );
      if (f != null) {
        final bytes = await f.readAsBytes();
        final len = await f.length() ?? bytes.length;
        final mb = len / (1024 * 1024);
        setState(() {
          _profileBytes = bytes;
          _profileFileName = f.name;
          _profileFileSize = mb >= 1.0 ? '${mb.toStringAsFixed(2)} MB' : '${(len / 1024).round()} KB';
          _hasCustomFile = true;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppTheme.success,
              content: Text('✓ Archivo de perfil seleccionado: ${f.name} ($_profileFileSize)'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppTheme.accentRed, content: Text('Error seleccionando archivo: $e')),
        );
      }
    }
  }

  Future<void> _handleSubmit() async {
    final title = _titleCtrl.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Por favor ingresa un título para el Proyecto de Grado.'),
          backgroundColor: AppTheme.accentRed,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    await ThesisRepository.instance.updateProfile(
      title: title,
      abstract: _summaryCtrl.text.trim(),
      fileName: _profileFileName,
      fileSize: _profileFileSize,
      fileBytes: _profileBytes,
    );

    if (!mounted) return;
    setState(() => _isSubmitting = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Perfil actualizado, vectorizado (768-d) y sincronizado con Dirección y Tutor.'),
        backgroundColor: AppTheme.success,
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cargar Perfil de Proyecto de Grado'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'DATOS DE LA POSTULACIÓN (PROYECTO DE GRADO)',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text('Título Propuesto:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _titleCtrl,
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 14),
                    const Text('Resumen / Objetivos (NLP Extractor 768-d):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    TextField(
                      controller: _summaryCtrl,
                      style: const TextStyle(fontSize: 13),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      maxLines: 4,
                    ),
                    const SizedBox(height: 16),

                    // PDF Document Selector Container
                    InkWell(
                      onTap: _pickFile,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: _hasCustomFile ? const Color(0xFFF0FDF4) : AppTheme.surfaceBg,
                          border: Border.all(color: _hasCustomFile ? AppTheme.success : AppTheme.borderColor),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.picture_as_pdf, color: AppTheme.accentRed, size: 30),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _profileFileName,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                  Text(
                                    _hasCustomFile
                                        ? '$_profileFileSize • Archivo físico listo para enviar'
                                        : '$_profileFileSize • Toca para seleccionar archivo local',
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: _hasCustomFile ? AppTheme.success : AppTheme.textMuted,
                                      fontWeight: _hasCustomFile ? FontWeight.w600 : FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.file_upload, color: AppTheme.primaryBlue),
                              tooltip: 'Seleccionar archivo local',
                              onPressed: _pickFile,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Vectorizar y Registrar Perfil de Proyecto de Grado'),
            ),
          ],
        ),
      ),
    );
  }
}
