import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/file_helper.dart';
import '../../models/draft_model.dart';
import '../../services/thesis_repository.dart';

/// Pantalla de Subida de Entregables Multiformato y Múltiples Archivos SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad de Graduación: Proyecto de Grado (Plan 187-3)

class DraftUploadScreen extends StatefulWidget {
  const DraftUploadScreen({super.key});

  @override
  State<DraftUploadScreen> createState() => _DraftUploadScreenState();
}

class _DraftUploadScreenState extends State<DraftUploadScreen> {
  String _deliverableType = 'CAPITULO';
  int _selectedChapter = 3;
  final _titleCtrl = TextEditingController(text: 'Metodología, Arquitectura C4 y Pruebas McCabe');
  final _notesCtrl = TextEditingController(
    text: 'Se subsanan las observaciones sobre arquitectura C4 y grafo de McCabe en las páginas 42 y 49. Se adjunta archivo Excel con la matriz de caminos independientes y el diagrama C4 en alta resolución.',
  );

  // Archivo Principal Físico
  Uint8List? _mainFileBytes;
  String _mainFileName = 'Borrador_Capitulo3_v3_Molina.pdf';
  String _mainFileSize = '2.9 MB';
  String _mainFileType = 'PDF';
  String _mainFileUrl = '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf';
  bool _hasCustomMainFile = false;

  // Archivos Complementarios
  final List<ComplementaryFile> _complementaryFiles = [
    const ComplementaryFile(
      name: 'Matriz_Pruebas_McCabe_v3.xlsx',
      size: '158 KB',
      url: '/storage/drafts/Matriz_Pruebas_McCabe.xlsx',
      type: 'EXCEL',
    ),
    const ComplementaryFile(
      name: 'Diagrama_C4_Contenedores_v2.png',
      size: '920 KB',
      url: '/storage/drafts/Diagrama_C4_Contenedores.png',
      type: 'IMAGE',
    ),
  ];
  final List<Map<String, dynamic>> _pickedCompFiles = [];

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  void _onTypeChanged(String? newType) {
    if (newType == null) return;
    setState(() {
      _deliverableType = newType;
      switch (newType) {
        case 'COMPLETO':
          _titleCtrl.text = 'Documento Borrador Completo (Consolidado de Tesis)';
          if (!_hasCustomMainFile) {
            _mainFileName = 'Borrador_Consolidado_Tesis_v2_Molina.pdf';
            _mainFileSize = '4.5 MB';
          }
          break;
        case 'CAPITULO':
          _updateChapterTitle(_selectedChapter);
          if (!_hasCustomMainFile) {
            _mainFileName = 'Borrador_Capitulo${_selectedChapter}_v3_Molina.pdf';
            _mainFileSize = '2.9 MB';
          }
          break;
        case 'ANEXO':
          _titleCtrl.text = 'Anexo A: Matriz de Pruebas de Caja Blanca McCabe';
          if (!_hasCustomMainFile) {
            _mainFileName = 'AnexoA_Matriz_Pruebas_McCabe_v2.pdf';
            _mainFileSize = '1.2 MB';
          }
          break;
        case 'MANUAL':
          _titleCtrl.text = 'Manual de Usuario y Despliegue en GCP';
          if (!_hasCustomMainFile) {
            _mainFileName = 'Manual_Usuario_Sistema_v1.pdf';
            _mainFileSize = '1.8 MB';
          }
          break;
        case 'INSTRUMENTO':
          _titleCtrl.text = 'Instrumento de Validación y Encuestas';
          if (!_hasCustomMainFile) {
            _mainFileName = 'Encuesta_Validacion_Estudiantes_v1.pdf';
            _mainFileSize = '850 KB';
          }
          break;
        case 'CODIGO':
          _titleCtrl.text = 'Código Fuente del Proyecto SIS-GradMatch';
          if (!_hasCustomMainFile) {
            _mainFileName = 'Codigo_Fuente_SIS_GradMatch_v2.zip';
            _mainFileSize = '6.8 MB';
            _mainFileType = 'ZIP';
          }
          break;
      }
    });
  }

  void _updateChapterTitle(int ch) {
    switch (ch) {
      case 1:
        _titleCtrl.text = 'Introducción, Planteamiento y Alcance';
        break;
      case 2:
        _titleCtrl.text = 'Marco Teórico y Estado del Arte';
        break;
      case 3:
        _titleCtrl.text = 'Metodología, Arquitectura C4 y Pruebas McCabe';
        break;
      case 4:
        _titleCtrl.text = 'Implementación y Desarrollo del Software';
        break;
      case 5:
        _titleCtrl.text = 'Pruebas, Resultados y Conclusiones';
        break;
    }
    if (!_hasCustomMainFile) {
      _mainFileName = 'Borrador_Capitulo${ch}_v3_Molina.pdf';
    }
  }

  Future<void> _pickMainFile() async {
    try {
      final f = await FilePicker.pickFile(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'doc', 'docx', 'zip', 'xlsx', 'png', 'jpg'],
      );
      if (f != null) {
        final bytes = await f.readAsBytes();
        final len = await f.length() ?? bytes.length;
        setState(() {
          _mainFileBytes = bytes;
          _mainFileName = f.name;
          final mb = len / (1024 * 1024);
          _mainFileSize = mb >= 1.0 ? '${mb.toStringAsFixed(2)} MB' : '${(len / 1024).round()} KB';
          _mainFileType = (f.extension ?? 'PDF').toUpperCase();
          _hasCustomMainFile = true;
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppTheme.success,
              content: Text('✓ Archivo Principal seleccionado: ${f.name} ($_mainFileSize)'),
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

  Future<void> _pickComplementaryFiles() async {
    try {
      final files = await FilePicker.pickFiles(
        type: FileType.any,
      );
      if (files.isNotEmpty) {
        for (final f in files) {
          final bytes = await f.readAsBytes();
          final len = await f.length() ?? bytes.length;
          final mb = len / (1024 * 1024);
          final sz = mb >= 1.0 ? '${mb.toStringAsFixed(2)} MB' : '${(len / 1024).round()} KB';
          final ext = (f.extension ?? 'FILE').toUpperCase();
          _pickedCompFiles.add({
            'name': f.name,
            'size': sz,
            'type': ext,
            'bytes': bytes,
          });
          _complementaryFiles.add(
            ComplementaryFile(
              name: f.name,
              size: sz,
              url: '/storage/drafts/${f.name.replaceAll(' ', '_')}',
              type: ext,
            ),
          );
        }
        setState(() {});
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: AppTheme.success,
              content: Text('✓ ${files.length} archivo(s) complementario(s) adjunto(s).'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(backgroundColor: AppTheme.accentRed, content: Text('Error adjuntando complementarios: $e')),
        );
      }
    }
  }

  Future<void> _handleUpload() async {
    setState(() => _isSubmitting = true);

    String uploadedUrl = _mainFileUrl;
    final repo = ThesisRepository.instance;

    // Subir archivo principal físicamente si fue seleccionado
    if (_mainFileBytes != null) {
      final res = await repo.uploadPhysicalFile(_mainFileBytes!, _mainFileName);
      if (res != null) {
        uploadedUrl = res['url'] as String? ?? uploadedUrl;
        _mainFileName = res['filename'] as String? ?? _mainFileName;
        _mainFileSize = res['size'] as String? ?? _mainFileSize;
      }
    }

    // Subir archivos complementarios físicamente
    final finalCompFiles = <ComplementaryFile>[];
    for (final comp in _complementaryFiles) {
      final picked = _pickedCompFiles.firstWhere(
        (p) => p['name'] == comp.name,
        orElse: () => {},
      );
      if (picked.isNotEmpty && picked['bytes'] != null) {
        final resComp = await repo.uploadPhysicalFile(picked['bytes'] as Uint8List, comp.name);
        if (resComp != null) {
          finalCompFiles.add(ComplementaryFile(
            name: resComp['filename'] as String? ?? comp.name,
            size: resComp['size'] as String? ?? comp.size,
            url: resComp['url'] as String? ?? comp.url,
            type: comp.type,
          ));
          continue;
        }
      }
      finalCompFiles.add(comp);
    }

    // Crear y registrar nuevo entregable en el repositorio persistente
    final newDraft = ChapterDraft(
      id: DateTime.now().millisecondsSinceEpoch,
      deliverableType: _deliverableType,
      chapterNumber: _deliverableType == 'CAPITULO' ? _selectedChapter : 0,
      title: _titleCtrl.text,
      version: 1,
      status: 'EN_REVISION',
      date: '18/11/2026',
      mainFileName: _mainFileName,
      mainFileSize: _mainFileSize,
      mainFileUrl: uploadedUrl,
      notes: _notesCtrl.text,
      previewExtract: _notesCtrl.text,
      complementaryFiles: finalCompFiles,
    );

    await repo.addDeliverable(newDraft);

    if (!mounted) return;
    setState(() {
      _mainFileUrl = uploadedUrl;
      _isSubmitting = false;
    });

    await showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: AppTheme.success, size: 24),
            SizedBox(width: 8),
            Text('Entregable Enviado', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'El entregable "${_titleCtrl.text}" fue almacenado físicamente en el servidor universitario y vinculado al expediente de Proyecto de Grado del postulante Molina Cortez Maikol Anthony (Egresado Habilitado - Plan 187-3).',
              style: const TextStyle(fontSize: 12, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('⭐ Archivo Principal: $_mainFileName ($_mainFileSize)', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
                  const SizedBox(height: 4),
                  Text('📎 Complementarios: ${finalCompFiles.length} archivo(s)', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                  const SizedBox(height: 4),
                  Text('Ruta física en servidor: $uploadedUrl', style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              Navigator.of(context).pop();
            },
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Subir Entregable de Tesis'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Tipo de Entregable Selector
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      '1. CATEGORÍA DEL ENTREGABLE',
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppTheme.primaryBlue, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      initialValue: _deliverableType,
                      items: const [
                        DropdownMenuItem(
                          value: 'COMPLETO',
                          child: Text('📄 Documento Completo (Consolidado de Tesis)'),
                        ),
                        DropdownMenuItem(
                          value: 'CAPITULO',
                          child: Text('📑 Capítulo Específico (Cap. 1 al 5)'),
                        ),
                        DropdownMenuItem(
                          value: 'ANEXO',
                          child: Text('📎 Anexos y Apéndices Técnicos'),
                        ),
                        DropdownMenuItem(
                          value: 'MANUAL',
                          child: Text('📘 Manuales del Sistema (Usuario / Técnico)'),
                        ),
                        DropdownMenuItem(
                          value: 'INSTRUMENTO',
                          child: Text('📊 Instrumentos de Validación y Formularios'),
                        ),
                        DropdownMenuItem(
                          value: 'CODIGO',
                          child: Text('💻 Código Fuente del Proyecto (ZIP / Bundle)'),
                        ),
                      ],
                      onChanged: _onTypeChanged,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),

                    if (_deliverableType == 'CAPITULO') ...[
                      const SizedBox(height: 14),
                      const Text('Número de Capítulo:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<int>(
                        initialValue: _selectedChapter,
                        items: const [
                          DropdownMenuItem(value: 1, child: Text('Capítulo 1: Introducción y Planteamiento')),
                          DropdownMenuItem(value: 2, child: Text('Capítulo 2: Marco Teórico y Estado del Arte')),
                          DropdownMenuItem(value: 3, child: Text('Capítulo 3: Metodología, Arquitectura C4 y Pruebas McCabe')),
                          DropdownMenuItem(value: 4, child: Text('Capítulo 4: Implementación del Software')),
                          DropdownMenuItem(value: 5, child: Text('Capítulo 5: Pruebas, Resultados y Conclusiones')),
                        ],
                        onChanged: (val) {
                          if (val != null) {
                            setState(() {
                              _selectedChapter = val;
                              _updateChapterTitle(val);
                            });
                          }
                        },
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                    ],

                    const SizedBox(height: 14),
                    const Text('Título o Descripción del Entregable:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _titleCtrl,
                      style: const TextStyle(fontSize: 12),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),

                    const SizedBox(height: 14),
                    const Text('Notas / Observaciones Subsanadas para el Tutor:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    TextField(
                      controller: _notesCtrl,
                      style: const TextStyle(fontSize: 12),
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      maxLines: 3,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Archivo Principal (Obligatorio)
            Card(
              shape: RoundedRectangleBorder(
                side: const BorderSide(color: AppTheme.primaryBlue, width: 1.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '2. ⭐ ARCHIVO PRINCIPAL (OBLIGATORIO)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primaryBlue,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE0E7FF),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Visor Docente', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppTheme.primaryBlue)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Este archivo se renderizará automáticamente en el visor integrado del docente tutor.',
                      style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: _pickMainFile,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: _hasCustomMainFile ? const Color(0xFFF0FDF4) : AppTheme.surfaceBg,
                          border: Border.all(color: _hasCustomMainFile ? AppTheme.success : AppTheme.borderColor),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(FileHelper.getIconForType(_mainFileType), color: FileHelper.getColorForType(_mainFileType), size: 30),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _mainFileName,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                                  ),
                                  Text(
                                    _hasCustomMainFile
                                        ? '$_mainFileSize • Archivo físico seleccionado • Listo para subir'
                                        : '$_mainFileSize • Toca para seleccionar un archivo de tu equipo',
                                    style: TextStyle(
                                      fontSize: 10,
                                      color: _hasCustomMainFile ? AppTheme.success : AppTheme.textMuted,
                                      fontWeight: _hasCustomMainFile ? FontWeight.w600 : FontWeight.normal,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.file_upload, color: AppTheme.primaryBlue),
                              tooltip: 'Seleccionar archivo local',
                              onPressed: _pickMainFile,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Archivos Complementarios (Opcionales - Múltiples)
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
                          '3. 📎 ARCHIVOS COMPLEMENTARIOS (OPCIONAL)',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textSecondary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        Text(
                          '${_complementaryFiles.length} Archivos',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.primaryBlue),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      'Puedes adjuntar matrices en Excel, diagramas de arquitectura en PNG, scripts SQL o archivos ZIP con código fuente.',
                      style: TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                    ),
                    const SizedBox(height: 12),

                    if (_complementaryFiles.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppTheme.surfaceBg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Center(
                          child: Text(
                            'No se han agregado archivos complementarios.',
                            style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                          ),
                        ),
                      )
                    else
                      ..._complementaryFiles.map((file) => Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(color: AppTheme.borderColor),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                Icon(FileHelper.getIconForType(file.type), color: FileHelper.getColorForType(file.type), size: 22),
                                const SizedBox(width: 10),
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
                                  icon: const Icon(Icons.delete_outline, color: AppTheme.accentRed, size: 18),
                                  onPressed: () {
                                    setState(() {
                                      _complementaryFiles.remove(file);
                                    });
                                  },
                                ),
                              ],
                            ),
                          )),

                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      icon: const Icon(Icons.attach_file, size: 16),
                      label: const Text('Examinar y Adjuntar Archivos Complementarios'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                      onPressed: _pickComplementaryFiles,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              icon: _isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.send, size: 18),
              label: const Text('Enviar Entregable Completo al Docente Tutor'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: _isSubmitting ? null : _handleUpload,
            ),
          ],
        ),
      ),
    );
  }
}
