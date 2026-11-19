import 'observation_model.dart';

/// Modelo de Archivo Complementario Adjunto SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad: Proyecto de Grado (Plan 187-3)

class ComplementaryFile {
  final String name;
  final String size;
  final String url;
  final String type; // EXCEL, IMAGE, ZIP, PDF, SQL, OTHER

  const ComplementaryFile({
    required this.name,
    required this.size,
    required this.url,
    required this.type,
  });

  factory ComplementaryFile.fromJson(Map<String, dynamic> json) {
    return ComplementaryFile(
      name: json['nombre'] ?? json['name'] ?? '',
      size: json['tamano'] ?? json['size'] ?? '',
      url: json['url'] ?? '',
      type: json['tipo'] ?? json['type'] ?? 'OTHER',
    );
  }

  Map<String, dynamic> toJson() => {
    'nombre': name,
    'name': name,
    'tamano': size,
    'size': size,
    'url': url,
    'tipo': type,
    'type': type,
  };
}

/// Modelo de Borrador y Entregables de Avance SIS-GradMatch
/// Soporta: COMPLETO, CAPITULO, ANEXO, MANUAL, INSTRUMENTO, CODIGO
/// Desarrollador Único: Molina Cortez Maikol Anthony

class ChapterDraft {
  final int id;
  final String deliverableType; // COMPLETO, CAPITULO, ANEXO, MANUAL, INSTRUMENTO, CODIGO
  final int chapterNumber;
  final String title;
  final int version;
  final String status; // PENDIENTE, EN_REVISION, OBSERVADO, APROBADO
  final String date;
  final String mainFileName;
  final String mainFileSize;
  final String mainFileUrl;
  final String notes;
  final String previewExtract;
  final List<ComplementaryFile> complementaryFiles;
  final List<ObservationModel> observations;

  const ChapterDraft({
    this.id = 1,
    this.deliverableType = 'CAPITULO',
    required this.chapterNumber,
    required this.title,
    required this.version,
    required this.status,
    this.date = '18/11/2026',
    this.mainFileName = 'Borrador_Capitulo.pdf',
    this.mainFileSize = '2.5 MB',
    this.mainFileUrl = '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
    this.notes = '',
    this.previewExtract = '',
    this.complementaryFiles = const [],
    this.observations = const [],
  });

  String get safeFileName => mainFileName.replaceAll(' ', '_');

  factory ChapterDraft.fromJson(Map<String, dynamic> json) {
    var rawObs = json['observaciones'] ?? json['observations'];
    List<ObservationModel> obsList = [];
    if (rawObs is List) {
      obsList = rawObs
          .map((o) => ObservationModel.fromJson(o as Map<String, dynamic>))
          .toList();
    }

    var rawFiles = json['archivos_complementarios'] ?? json['complementary_files'] ?? json['complementaryFiles'];
    List<ComplementaryFile> compList = [];
    if (rawFiles is List) {
      compList = rawFiles
          .map((f) => ComplementaryFile.fromJson(f as Map<String, dynamic>))
          .toList();
    }

    int parsedVersion = 1;
    final rawVer = json['version'];
    if (rawVer is int) {
      parsedVersion = rawVer;
    } else if (rawVer is String) {
      final digits = rawVer.replaceAll(RegExp(r'[^0-9]'), '');
      parsedVersion = int.tryParse(digits) ?? 1;
    }

    return ChapterDraft(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '1') ?? 1,
      deliverableType: json['tipo'] ?? json['deliverableType'] ?? json['type'] ?? 'CAPITULO',
      chapterNumber: json['numero'] ?? json['chapterNumber'] ?? json['number'] ?? 1,
      title: json['titulo'] ?? json['title'] ?? '',
      version: parsedVersion,
      status: json['estado'] ?? json['status'] ?? 'PENDIENTE',
      date: json['fecha'] ?? json['date'] ?? json['uploaded_at'] ?? '18/11/2026',
      mainFileName: json['archivo_principal']?['nombre'] ?? json['file_name'] ?? json['mainFileName'] ?? 'Borrador.pdf',
      mainFileSize: json['archivo_principal']?['tamano'] ?? json['file_size'] ?? json['mainFileSize'] ?? '2.0 MB',
      mainFileUrl: json['archivo_principal']?['url'] ?? json['file_url'] ?? json['mainFileUrl'] ?? '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
      notes: json['notas'] ?? json['notes'] ?? '',
      previewExtract: json['extracto'] ?? json['previewExtract'] ?? '',
      complementaryFiles: compList,
      observations: obsList,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'deliverableType': deliverableType,
    'type': deliverableType,
    'chapterNumber': chapterNumber,
    'number': chapterNumber,
    'title': title,
    'titulo': title,
    'version': version,
    'status': status,
    'estado': status,
    'date': date,
    'fecha': date,
    'mainFileName': mainFileName,
    'file_name': mainFileName,
    'mainFileSize': mainFileSize,
    'file_size': mainFileSize,
    'mainFileUrl': mainFileUrl,
    'file_url': mainFileUrl,
    'notes': notes,
    'notas': notes,
    'previewExtract': previewExtract,
    'complementaryFiles': complementaryFiles.map((c) => c.toJson()).toList(),
    'observations': observations.map((o) => o.toJson()).toList(),
  };

  ChapterDraft copyWith({
    int? id,
    String? deliverableType,
    int? chapterNumber,
    String? title,
    int? version,
    String? status,
    String? date,
    String? mainFileName,
    String? mainFileSize,
    String? mainFileUrl,
    String? notes,
    String? previewExtract,
    List<ComplementaryFile>? complementaryFiles,
    List<ObservationModel>? observations,
  }) {
    return ChapterDraft(
      id: id ?? this.id,
      deliverableType: deliverableType ?? this.deliverableType,
      chapterNumber: chapterNumber ?? this.chapterNumber,
      title: title ?? this.title,
      version: version ?? this.version,
      status: status ?? this.status,
      date: date ?? this.date,
      mainFileName: mainFileName ?? this.mainFileName,
      mainFileSize: mainFileSize ?? this.mainFileSize,
      mainFileUrl: mainFileUrl ?? this.mainFileUrl,
      notes: notes ?? this.notes,
      previewExtract: previewExtract ?? this.previewExtract,
      complementaryFiles: complementaryFiles ?? this.complementaryFiles,
      observations: observations ?? this.observations,
    );
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ChapterDraft &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;
}
