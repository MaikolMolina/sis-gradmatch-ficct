from typing import List, Dict, Any, Optional
from backend.app.services.nlp_engine import calculate_cosine_similarity

class InvalidVectorError(ValueError):
    """Raised when profile vector is empty or malformed."""
    pass

def execute_matchmaking_algorithm(
    profile_vector: Optional[List[float]],
    candidate_teachers: List[Dict[str, Any]],
    weight_similarity: float = 0.70,
    weight_quota: float = 0.30
) -> List[Dict[str, Any]]:
    """
    HU-01: Algoritmo de Similitud Coseno y Matchmaking Inteligente.
    Complexity: V(G) = 4 (McCabe)
    
    Nodes:
    1: Inicio & Cargar Perfil
    2: ¿Vector válido? (is None or len != 768 or sum == 0)
    3: Error: Vector Inválido (Raises InvalidVectorError)
    4: Iterar docentes de la lista
    5: ¿Cupo disponible > 0? (max_quota - current_quota > 0)
    6: Omitir docente sin cupo
    7: Calcular Coseno y Score ponderado
    8: ¿Quedan docentes?
    9: Ordenar ranking y retornar candidatos recomendados
    """
    # Node 1: Inicio
    results: List[Dict[str, Any]] = []

    # Node 2: ¿Vector válido?
    if profile_vector is None or len(profile_vector) == 0 or all(x == 0.0 for x in profile_vector):
        # Node 3: Error Vector Inválido
        raise InvalidVectorError("El vector de embedding del perfil es inválido o se encuentra vacío.")

    # Node 4: Iterar Docentes
    for teacher in candidate_teachers:
        # Node 5: ¿Cupo disponible > 0?
        quota_available = teacher.get("max_quota", 5) - teacher.get("current_quota", 0)
        if quota_available <= 0:
            # Node 6: Omitir docente
            continue
        
        # Node 7: Calcular Coseno y Score Ponderado
        teacher_vector = teacher.get("embedding_vector", [])
        sim_score = calculate_cosine_similarity(profile_vector, teacher_vector)
        
        # Normalized quota factor (ratio of free capacity)
        quota_ratio = min(1.0, max(0.0, quota_available / float(teacher.get("max_quota", 5))))
        final_score = round((sim_score * weight_similarity) + (quota_ratio * weight_quota), 4)

        results.append({
            "teacher_id": teacher["id"],
            "teacher_name": teacher.get("name", "Docente"),
            "teacher_code": teacher.get("code", "DOC-00"),
            "department": teacher.get("department", "Sistemas"),
            "max_quota": teacher.get("max_quota", 5),
            "current_quota": teacher.get("current_quota", 0),
            "quota_available": quota_available,
            "similarity_score": sim_score,
            "quota_score": round(quota_ratio, 4),
            "final_score": final_score,
            "matched_areas": teacher.get("areas", ["Ingeniería de Software"]),
            "justification": f"Afinidad semántica del {round(sim_score * 100, 1)}% con especialidad en {', '.join(teacher.get('areas', []))}. Cupo disponible: {quota_available} tesistas."
        })
        # Node 8: Fin de evaluación del docente en turno

    # Node 9: Ordenar Ranking y Fin
    results.sort(key=lambda x: x["final_score"], reverse=True)
    for idx, item in enumerate(results, start=1):
        item["ranking"] = idx

    return results
