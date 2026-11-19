library;

/// Modelo de Candidato de Matchmaking Recomendado por IA
/// Desarrollador Único: Molina Cortez Maikol Anthony

class MatchCandidate {
  final int teacherId;
  final String teacherName;
  final String department;
  final double semanticAffinity;
  final int currentQuota;
  final int maxQuota;
  final double compositeScore;
  final int ranking;
  final String justification;

  const MatchCandidate({
    required this.teacherId,
    required this.teacherName,
    required this.department,
    required this.semanticAffinity,
    required this.currentQuota,
    required this.maxQuota,
    required this.compositeScore,
    required this.ranking,
    required this.justification,
  });

  int get availableQuota => maxQuota - currentQuota;

  factory MatchCandidate.fromJson(Map<String, dynamic> json) {
    return MatchCandidate(
      teacherId: json['docente_id'] ?? 0,
      teacherName: json['nombre'] ?? '',
      department: json['departamento'] ?? '',
      semanticAffinity: (json['afinidad_semantica'] as num?)?.toDouble() ?? 0.0,
      currentQuota: json['cupo_actual'] ?? 0,
      maxQuota: json['cupo_maximo'] ?? 5,
      compositeScore: (json['score_balanceo'] as num?)?.toDouble() ?? 0.0,
      ranking: json['ranking'] ?? 1,
      justification: json['justificacion'] ?? '',
    );
  }
}
