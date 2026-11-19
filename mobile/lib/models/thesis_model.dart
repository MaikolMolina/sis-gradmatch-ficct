import 'draft_model.dart';
import 'observation_model.dart';

/// Modelo de Expediente de Tesis / Proyecto de Grado SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad: Proyecto de Grado (Plan 187-3, 56 materias vencidas)

class ThesisModel {
  final int id;
  final String title;
  final String studentName;
  final String studentRegistro;
  final String modality;
  final String? tutorName;
  final String? resolutionNumber;
  final String status;
  final int currentChapter;
  final int progressPercent;
  final List<ChapterDraft> chapters;
  final List<ObservationModel> activeObservations;

  const ThesisModel({
    required this.id,
    required this.title,
    required this.studentName,
    required this.studentRegistro,
    required this.modality,
    this.tutorName,
    this.resolutionNumber,
    required this.status,
    required this.currentChapter,
    required this.progressPercent,
    this.chapters = const [],
    this.activeObservations = const [],
  });

  factory ThesisModel.sampleStudentMolina() {
    return const ThesisModel(
      id: 1,
      title: 'Sistema Inteligente para la Gestión de Proyectos de Grado y Asignación Automatizada Estudiante-Tutor mediante Machine Learning',
      studentName: 'Molina Cortez Maikol Anthony',
      studentRegistro: '220011559',
      modality: 'Proyecto de Grado',
      tutorName: 'Ing. Rolando Antoni Martínez Canedo',
      resolutionNumber: 'RA-FICCT-0482/2026',
      status: 'OBSERVADO',
      currentChapter: 3,
      progressPercent: 65,
      chapters: [
        ChapterDraft(
          id: 100,
          deliverableType: 'COMPLETO',
          chapterNumber: 0,
          title: 'Documento Borrador Completo (Consolidado de Tesis)',
          version: 1,
          status: 'EN_REVISION',
          date: '18/11/2026',
          mainFileName: 'Borrador_Consolidado_Tesis_Molina.pdf',
          mainFileSize: '4.2 MB',
          mainFileUrl: '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf',
          previewExtract: 'Documento de tesis consolidado que abarca los 13 capítulos estructurados de acuerdo con los requerimientos de la Carrera de Ingeniería en Sistemas y el marco SCRUM. Incluye carátulas individuales y modelos UML 2.5.',
          complementaryFiles: [
            ComplementaryFile(
              name: 'Sistema_Gestion_Proyectos_Grado.eap',
              size: '1.8 MB',
              url: '/storage/drafts/Sistema_Gestion_Proyectos_Grado.eap',
              type: 'OTHER',
            ),
            ComplementaryFile(
              name: 'Codigo_Fuente_SIS_GradMatch.zip',
              size: '6.4 MB',
              url: '/storage/drafts/Codigo_Fuente_SIS_GradMatch.zip',
              type: 'ZIP',
            ),
          ],
        ),
        ChapterDraft(
          id: 1,
          deliverableType: 'CAPITULO',
          chapterNumber: 1,
          title: 'Introducción, Planteamiento y Alcance',
          version: 2,
          status: 'APROBADO',
          date: '02/11/2026',
          mainFileName: 'Borrador_Capitulo1_v2_Molina.pdf',
          mainFileSize: '1.4 MB',
          mainFileUrl: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
          previewExtract: 'Definición del problema de asignación manual de tutores en la UAGRM, formulación del objetivo general, objetivos específicos y límites del proyecto de grado.',
        ),
        ChapterDraft(
          id: 2,
          deliverableType: 'CAPITULO',
          chapterNumber: 2,
          title: 'Marco Teórico y Estado del Arte',
          version: 1,
          status: 'APROBADO',
          date: '09/11/2026',
          mainFileName: 'Borrador_Capitulo2_v1_Molina.pdf',
          mainFileSize: '2.1 MB',
          mainFileUrl: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
          previewExtract: 'Fundamentos de Inteligencia Artificial, procesamiento de lenguaje natural (NLP) con BERT/Transformers multilingüe, cálculo de similitud coseno y optimización de carga docente.',
        ),
        ChapterDraft(
          id: 3,
          deliverableType: 'CAPITULO',
          chapterNumber: 3,
          title: 'Metodología, Arquitectura C4 y Pruebas McCabe',
          version: 2,
          status: 'OBSERVADO',
          date: '16/11/2026',
          mainFileName: 'Borrador_Capitulo3_v2_Molina.pdf',
          mainFileSize: '2.8 MB',
          mainFileUrl: '/storage/drafts/Borrador_Capitulo3_v2_Molina.pdf',
          previewExtract: 'La arquitectura del sistema SIS-GradMatch desacopla el motor analítico de similitud coseno de los servicios transaccionales. Los vectores densos de 768 dimensiones se almacenan en tablas con índices IVFFlat en PostgreSQL 16 con pgvector.',
          complementaryFiles: [
            ComplementaryFile(
              name: 'Matriz_Pruebas_McCabe.xlsx',
              size: '145 KB',
              url: '/storage/drafts/Matriz_Pruebas_McCabe.xlsx',
              type: 'EXCEL',
            ),
            ComplementaryFile(
              name: 'Diagrama_C4_Contenedores.png',
              size: '890 KB',
              url: '/storage/drafts/Diagrama_C4_Contenedores.png',
              type: 'IMAGE',
            ),
            ComplementaryFile(
              name: 'Scripts_Carga_Embeddings.sql',
              size: '32 KB',
              url: '/storage/drafts/Scripts_Carga_Embeddings.sql',
              type: 'SQL',
            ),
          ],
        ),
        ChapterDraft(
          id: 201,
          deliverableType: 'ANEXO',
          chapterNumber: 0,
          title: 'Anexo A: Matriz de Pruebas de Caja Blanca McCabe y Cobertura',
          version: 1,
          status: 'APROBADO',
          date: '17/11/2026',
          mainFileName: 'AnexoA_Matriz_Pruebas_McCabe.pdf',
          mainFileSize: '1.1 MB',
          mainFileUrl: '/storage/drafts/AnexoA_Matriz_Pruebas_McCabe.pdf',
          previewExtract: 'Detalle de los grafos de flujo de control (CFG), cálculo de complejidad ciclomática V(G)=4 para el algoritmo de asignación de tutores y matriz de casos de prueba con cobertura del 100% de aristas.',
          complementaryFiles: [
            ComplementaryFile(
              name: 'Grafo_Flujo_Control.png',
              size: '640 KB',
              url: '/storage/drafts/Grafo_Flujo_Control.png',
              type: 'IMAGE',
            ),
          ],
        ),
        ChapterDraft(
          id: 301,
          deliverableType: 'MANUAL',
          chapterNumber: 0,
          title: 'Manual de Despliegue en Infraestructura Cloud GCP',
          version: 1,
          status: 'PENDIENTE',
          date: '18/11/2026',
          mainFileName: 'Manual_Despliegue_Cloud_GCP.pdf',
          mainFileSize: '1.9 MB',
          mainFileUrl: '/storage/drafts/Borrador_Consolidado_Tesis_Molina.pdf',
          previewExtract: 'Guía paso a paso para el aprovisionamiento de Cloud Run, base de datos Cloud SQL PostgreSQL 16 con extensión pgvector, reglas de IAM y almacenamiento de borradores en Cloud Storage.',
        ),
      ],
      activeObservations: [
        ObservationModel(
          id: 101,
          type: 'TECNICA',
          page: 42,
          section: '3.4 Diagrama C4 Contenedores',
          comment: 'Detallar la latencia y los hiperparámetros de indexación IVFFlat para la búsqueda vectorial sobre los 768 atributos densos.',
          date: '16/11/2026',
          isResolved: false,
        ),
        ObservationModel(
          id: 102,
          type: 'METODOLOGICA',
          page: 49,
          section: '3.6 Pruebas de Caja Blanca McCabe',
          comment: 'Incluir la tabla de cobertura de aristas y caminos independientes del Grafo de Flujo de Control con V(G)=4.',
          date: '17/11/2026',
          isResolved: false,
        ),
      ],
    );
  }

  factory ThesisModel.fromJson(Map<String, dynamic> json) {
    var rawCh = json['chapters'] as List? ?? [];
    List<ChapterDraft> chList = rawCh
        .map((c) => ChapterDraft.fromJson(c as Map<String, dynamic>))
        .toList();

    var rawObs = json['activeObservations'] as List? ?? [];
    List<ObservationModel> obsList = rawObs
        .map((o) => ObservationModel.fromJson(o as Map<String, dynamic>))
        .toList();

    return ThesisModel(
      id: json['id'] ?? 1,
      title: json['title'] ?? '',
      studentName: json['studentName'] ?? 'Molina Cortez Maikol Anthony',
      studentRegistro: json['studentRegistro'] ?? '220011559',
      modality: json['modality'] ?? 'Proyecto de Grado',
      tutorName: json['tutorName'] ?? 'Ing. Rolando Antoni Martínez Canedo',
      resolutionNumber: json['resolutionNumber'] ?? 'RA-FICCT-0482/2026',
      status: json['status'] ?? 'OBSERVADO',
      currentChapter: json['currentChapter'] ?? 3,
      progressPercent: json['progressPercent'] ?? 65,
      chapters: chList,
      activeObservations: obsList,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'studentName': studentName,
    'studentRegistro': studentRegistro,
    'modality': modality,
    'tutorName': tutorName,
    'resolutionNumber': resolutionNumber,
    'status': status,
    'currentChapter': currentChapter,
    'progressPercent': progressPercent,
    'chapters': chapters.map((c) => c.toJson()).toList(),
    'activeObservations': activeObservations.map((o) => o.toJson()).toList(),
  };

  ThesisModel copyWith({
    int? id,
    String? title,
    String? studentName,
    String? studentRegistro,
    String? modality,
    String? tutorName,
    String? resolutionNumber,
    String? status,
    int? currentChapter,
    int? progressPercent,
    List<ChapterDraft>? chapters,
    List<ObservationModel>? activeObservations,
  }) {
    return ThesisModel(
      id: id ?? this.id,
      title: title ?? this.title,
      studentName: studentName ?? this.studentName,
      studentRegistro: studentRegistro ?? this.studentRegistro,
      modality: modality ?? this.modality,
      tutorName: tutorName ?? this.tutorName,
      resolutionNumber: resolutionNumber ?? this.resolutionNumber,
      status: status ?? this.status,
      currentChapter: currentChapter ?? this.currentChapter,
      progressPercent: progressPercent ?? this.progressPercent,
      chapters: chapters ?? this.chapters,
      activeObservations: activeObservations ?? this.activeObservations,
    );
  }
}
