from typing import List, Dict, Any

class AcademicEligibilityVerdict:
    def __init__(self, is_eligible: bool, code: str, message: str, details: Dict[str, Any]):
        self.is_eligible = is_eligible
        self.code = code
        self.message = message
        self.details = details

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_eligible": self.is_eligible,
            "verdict_code": self.code,
            "message": self.message,
            "details": self.details
        }

def validate_student_degree_eligibility(
    student_record: Dict[str, Any]
) -> AcademicEligibilityVerdict:
    """
    HU-02: Validación de Habilitación Académica y Reglas CPD UAGRM.
    Complexity: V(G) = 4 (McCabe)
    
    Nodes:
    1: Iniciar Validación
    2: ¿Alumno Regular UAGRM?
    3: Rechazo: No Regular (Path 1)
    4: ¿Semestre >= 9?
    5: Rechazo: Semestre insuficiente (Path 2)
    6: ¿Materias prerrequisito aprobadas?
    7: Rechazo: Faltan materias prerrequisito (Path 3)
    8: Habilitar Postulación (Path 4)
    9: Retornar Dictamen y Fin
    """
    student_code = student_record.get("student_code", "")
    is_regular = student_record.get("is_regular", False)
    current_semester = student_record.get("current_semester", 0)
    pending_prerequisites: List[str] = student_record.get("pending_prerequisites", [])

    # Node 1 -> Node 2: ¿Alumno Regular UAGRM?
    if not is_regular:
        # Node 3: Rechazo por regularidad
        return AcademicEligibilityVerdict(
            is_eligible=False,
            code="RECHAZO_NO_REGULAR",
            message="El postulante no cuenta con matrícula regular activa en la gestión académica UAGRM.",
            details={"student_code": student_code, "is_regular": False}
        )

    # Node 4: ¿Semestre >= 9?
    if current_semester < 9:
        # Node 5: Rechazo por semestre insuficiente
        return AcademicEligibilityVerdict(
            is_eligible=False,
            code="RECHAZO_SEMESTRE_INSUFICIENTE",
            message=f"El estudiante cursa el semestre {current_semester}; la modalidad de grado requiere cursar 9no o 10mo semestre.",
            details={"student_code": student_code, "current_semester": current_semester, "required": 9}
        )

    # Node 6: ¿Materias prerrequisito aprobadas?
    if len(pending_prerequisites) > 0:
        # Node 7: Rechazo por materias pendientes
        return AcademicEligibilityVerdict(
            is_eligible=False,
            code="RECHAZO_PRERREQUISITOS_PENDIENTES",
            message=f"El estudiante registra materias prerrequisito no aprobadas: {', '.join(pending_prerequisites)}.",
            details={"student_code": student_code, "pending": pending_prerequisites}
        )

    # Node 8: Habilitar Postulación (Éxito)
    return AcademicEligibilityVerdict(
        is_eligible=True,
        code="HABILITADO_MODALIDAD_GRADO",
        message="Postulante habilitado satisfactoriamente para inscribir Perfil de Grado en Ingeniería en Sistemas.",
        details={"student_code": student_code, "current_semester": current_semester, "status": "HABILITADO"}
    )
