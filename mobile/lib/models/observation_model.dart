library;

/// Modelo de Observación Pedagógica SIS-GradMatch
/// Desarrollador Único: Molina Cortez Maikol Anthony
/// Modalidad: Proyecto de Grado (Plan 187-3)

class ObservationModel {
  final int id;
  final String type; // TECNICA, METODOLOGICA, FORMATO
  final int page;
  final String section;
  final String comment;
  final String date;
  final bool isResolved;

  const ObservationModel({
    required this.id,
    required this.type,
    required this.page,
    required this.section,
    required this.comment,
    required this.date,
    this.isResolved = false,
  });

  factory ObservationModel.fromJson(Map<String, dynamic> json) {
    return ObservationModel(
      id: json['id'] ?? 0,
      type: json['tipo'] ?? json['type'] ?? 'TECNICA',
      page: json['pagina'] ?? json['page'] ?? 1,
      section: json['seccion'] ?? json['section'] ?? '',
      comment: json['comentario'] ?? json['comment'] ?? '',
      date: json['fecha'] ?? json['date'] ?? '18/11/2026',
      isResolved: json['resuelta'] ?? json['isResolved'] ?? json['resolved'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'type': type,
    'page': page,
    'section': section,
    'comment': comment,
    'date': date,
    'isResolved': isResolved,
  };
}
