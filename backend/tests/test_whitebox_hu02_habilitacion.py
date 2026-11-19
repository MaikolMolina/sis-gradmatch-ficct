from backend.app.services.academic_validation_service import validate_student_degree_eligibility

def test_path_1_student_not_regular_rejected():
    """Camino 1: 1 -> 2 -> 3 -> 9. Postulante no regular en CPD es rechazado."""
    record = {
        "student_code": "21703412",
        "is_regular": False,
        "current_semester": 10,
        "pending_prerequisites": []
    }
    verdict = validate_student_degree_eligibility(record)
    assert verdict.is_eligible is False
    assert verdict.code == "RECHAZO_NO_REGULAR"
    assert "no cuenta con matrícula regular" in verdict.message

def test_path_2_student_semester_less_than_9_rejected():
    """Camino 2: 1 -> 2 -> 4 -> 5 -> 9. Postulante regular pero con semestre < 9 es rechazado."""
    record = {
        "student_code": "22004567",
        "is_regular": True,
        "current_semester": 7,
        "pending_prerequisites": []
    }
    verdict = validate_student_degree_eligibility(record)
    assert verdict.is_eligible is False
    assert verdict.code == "RECHAZO_SEMESTRE_INSUFICIENTE"
    assert "cursa el semestre 7" in verdict.message

def test_path_3_student_with_pending_prerequisites_rejected():
    """Camino 3: 1 -> 2 -> 4 -> 6 -> 7 -> 9. Postulante en 9no semestre pero con materias pendientes es rechazado."""
    record = {
        "student_code": "21808910",
        "is_regular": True,
        "current_semester": 9,
        "pending_prerequisites": ["INF412-Compiladores", "INF418-Sistemas de Informacion II"]
    }
    verdict = validate_student_degree_eligibility(record)
    assert verdict.is_eligible is False
    assert verdict.code == "RECHAZO_PRERREQUISITOS_PENDIENTES"
    assert "INF412-Compiladores" in verdict.message

def test_path_4_student_meets_all_rules_approved():
    """Camino 4: 1 -> 2 -> 4 -> 6 -> 8 -> 9. Postulante regular, semestre >= 9 y sin materias adeudadas es habilitado."""
    record = {
        "student_code": "21901234",
        "is_regular": True,
        "current_semester": 10,
        "pending_prerequisites": []
    }
    verdict = validate_student_degree_eligibility(record)
    assert verdict.is_eligible is True
    assert verdict.code == "HABILITADO_MODALIDAD_GRADO"
    assert "Postulante habilitado satisfactoriamente" in verdict.message
