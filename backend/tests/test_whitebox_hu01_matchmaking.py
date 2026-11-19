import pytest
from backend.app.services.matchmaking_service import execute_matchmaking_algorithm, InvalidVectorError
from backend.app.services.nlp_engine import generate_dense_embedding

def test_path_1_invalid_vector_raises_error():
    """Camino 1: 1 -> 2 -> 3 -> 9. Vector nulo o vacío debe disparar InvalidVectorError."""
    with pytest.raises(InvalidVectorError):
        execute_matchmaking_algorithm(
            profile_vector=None,
            candidate_teachers=[{"id": 1, "name": "Docente Test", "max_quota": 5, "current_quota": 0}]
        )

    with pytest.raises(InvalidVectorError):
        execute_matchmaking_algorithm(
            profile_vector=[],
            candidate_teachers=[{"id": 1, "name": "Docente Test", "max_quota": 5, "current_quota": 0}]
        )

def test_path_2_teacher_without_quota_is_skipped():
    """Camino 2: 1 -> 2 -> 4 -> 5 -> 6 -> 8 -> 9. Docente con cupo agotado (0) es omitido del ranking."""
    valid_vector = generate_dense_embedding("Sistema inteligente con redes neuronales y machine learning")
    teacher_saturated = {
        "id": 10,
        "name": "Ing. Saturado",
        "code": "DOC-99",
        "department": "Computación",
        "max_quota": 5,
        "current_quota": 5, # No free capacity
        "embedding_vector": valid_vector,
        "areas": ["IA"]
    }
    results = execute_matchmaking_algorithm(
        profile_vector=valid_vector,
        candidate_teachers=[teacher_saturated]
    )
    assert len(results) == 0, "Un docente con cupo disponible igual a 0 debe ser omitido del ranking."

def test_path_3_teacher_with_available_quota_computes_score():
    """Camino 3: 1 -> 2 -> 4 -> 5 -> 7 -> 8 -> 9. Docente con cupo disponible recibe cálculo de similitud y score."""
    vec_profile = generate_dense_embedding("Sistema inteligente de visión artificial y machine learning")
    vec_teacher = generate_dense_embedding("Especialidad en visión artificial, redes neuronales y machine learning")
    
    teacher_available = {
        "id": 1,
        "name": "Ing. Rolando Martínez Canedo",
        "code": "DOC-01",
        "department": "Computación",
        "max_quota": 5,
        "current_quota": 2, # 3 spots available
        "embedding_vector": vec_teacher,
        "areas": ["Inteligencia Artificial", "Ingeniería de Software"]
    }
    results = execute_matchmaking_algorithm(
        profile_vector=vec_profile,
        candidate_teachers=[teacher_available]
    )
    assert len(results) == 1
    match = results[0]
    assert match["teacher_id"] == 1
    assert match["similarity_score"] > 0.80, "La similitud semántica con tema afín debe ser superior al 80%."
    assert match["quota_available"] == 3
    assert match["final_score"] > 0.70
    assert match["ranking"] == 1

def test_path_4_multiple_teachers_iteration_and_descending_ranking():
    """Camino 4: 1 -> 2 -> 4 -> 5 -> 7 -> 8 -> 4... -> 9. Evaluación de múltiples docentes y ordenamiento decreciente."""
    vec_profile = generate_dense_embedding("Proyecto de seguridad en redes y protocolos criptograficos")
    
    vec_security = generate_dense_embedding("Especialidad en ciberseguridad, criptografia y redes")
    vec_database = generate_dense_embedding("Especialidad en bases de datos sql y postgresql")
    
    teachers = [
        {
            "id": 1, "name": "Docente Bases Datos", "code": "DOC-BD",
            "department": "Computación", "max_quota": 5, "current_quota": 1,
            "embedding_vector": vec_database, "areas": ["Bases de Datos"]
        },
        {
            "id": 2, "name": "Docente Ciberseguridad", "code": "DOC-SEC",
            "department": "Redes", "max_quota": 5, "current_quota": 1,
            "embedding_vector": vec_security, "areas": ["Ciberseguridad"]
        }
    ]
    results = execute_matchmaking_algorithm(
        profile_vector=vec_profile,
        candidate_teachers=teachers
    )
    assert len(results) == 2
    # The security teacher must be ranked #1
    assert results[0]["teacher_id"] == 2
    assert results[0]["ranking"] == 1
    assert results[0]["final_score"] >= results[1]["final_score"]
