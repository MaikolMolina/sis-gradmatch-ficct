from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Teacher, User, EvaluationTribunal, DegreeProfile
from backend.app.schemas.schemas import AnalyticsSummary, TribunalAssignRequest, StudentEligibilityResponse
from backend.app.api.deps import get_current_user, require_role
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.academic_validation_service import validate_student_degree_eligibility

# Teachers Router
teachers_router = APIRouter(prefix="/docentes", tags=["Gestión Docente"])

@teachers_router.get("/listar")
def list_teachers(db: Session = Depends(get_db)):
    """List all teachers with their specialty areas and capacity."""
    teachers = db.query(Teacher).all()
    out = []
    for t in teachers:
        u = t.user
        areas = [{"area_name": exp.area.name, "domain_level": exp.domain_level} for exp in t.expertises if exp.area]
        out.append({
            "id": t.id,
            "teacher_code": t.teacher_code,
            "full_name": f"{u.first_name} {u.last_name}" if u else "Docente",
            "department": t.department,
            "max_quota": t.max_quota,
            "current_quota": t.current_quota,
            "quota_available": max(0, t.max_quota - t.current_quota),
            "is_available": t.is_available,
            "areas": areas
        })
    return out

@teachers_router.get("/mi-bandeja")
def get_teacher_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DOCENTE_TUTOR", "ADMIN"]))
):
    """Get inbox for authenticated teacher with assigned degree projects and pending drafts."""
    teacher = current_user.teacher
    if not teacher and "ADMIN" not in (current_user.role.name if current_user.role else ""):
        raise HTTPException(status_code=403, detail="El usuario no es docente.")

    teacher_id = teacher.id if teacher else 1
    t = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    
    assigned_theses = []
    for asig in t.assignments:
        p = asig.profile
        su = p.student.user if p.student else None
        
        drafts_info = []
        for d in asig.drafts:
            drafts_info.append({
                "draft_id": d.id,
                "chapter_number": d.chapter_number,
                "chapter_title": d.chapter_title,
                "version": d.version,
                "status": d.status,
                "submitted_at": d.submitted_at,
                "observations_count": len(d.observations)
            })

        assigned_theses.append({
            "assignment_id": asig.id,
            "resolution_number": asig.resolution_number,
            "profile_id": p.id,
            "profile_title": p.title,
            "student_name": f"{su.first_name} {su.last_name}" if su else "Estudiante",
            "student_code": p.student.student_code if p.student else "REG-00",
            "status": p.status,
            "drafts": drafts_info
        })
    return assigned_theses

# Tribunals Router
tribunals_router = APIRouter(prefix="/tribunales", tags=["Tribunales Evaluadores"])

@tribunals_router.post("/designar")
def designate_tribunal(
    req: TribunalAssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DIRECTOR_CARRERA", "ADMIN"]))
):
    """Designate 3-member evaluation committee for a thesis."""
    if len(req.teacher_ids) != 3:
        raise HTTPException(status_code=400, detail="Debe designar exactamente 3 docentes para conformar el tribunal.")

    profile = db.query(DegreeProfile).filter(DegreeProfile.id == req.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")

    roles = ["PRESIDENTE", "SECRETARIO", "VOCAL"]
    # Clear existing
    db.query(EvaluationTribunal).filter(EvaluationTribunal.profile_id == req.profile_id).delete()
    for t_id, r in zip(req.teacher_ids, roles):
        trib = EvaluationTribunal(
            profile_id=req.profile_id,
            teacher_id=t_id,
            tribunal_role=r,
            dictum="PENDIENTE"
        )
        db.add(trib)
    profile.status = "FINALIZADO"
    db.commit()
    return {"message": "Tribunal evaluador de 3 miembros conformado exitosamente.", "profile_id": req.profile_id}

# Analytics Router
analytics_router = APIRouter(prefix="/analytics", tags=["Métricas y Analítica"])

@analytics_router.get("/summary", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """Return institutional summary analytics for accreditation."""
    data = AnalyticsService.get_institutional_summary(db)
    return AnalyticsSummary(**data)

# CPD Academic Registry Router (Simulated External System)
cpd_router = APIRouter(prefix="/cpd-uagrm", tags=["Sistema Externo CPD UAGRM"])

@cpd_router.get("/habilitacion/{student_code}", response_model=StudentEligibilityResponse)
def check_cpd_eligibility(student_code: str):
    """External UAGRM CPD mock endpoint to check student graduation eligibility."""
    # Simulation database for testing
    sim_db = {
        "21901234": {"student_code": "21901234", "is_regular": True, "current_semester": 9, "pending_prerequisites": []},
        "22004567": {"student_code": "22004567", "is_regular": True, "current_semester": 7, "pending_prerequisites": []},
        "21808910": {"student_code": "21808910", "is_regular": True, "current_semester": 9, "pending_prerequisites": ["INF412-Compiladores"]},
        "21703412": {"student_code": "21703412", "is_regular": False, "current_semester": 10, "pending_prerequisites": []},
    }
    record = sim_db.get(student_code, {
        "student_code": student_code,
        "is_regular": True,
        "current_semester": 9,
        "pending_prerequisites": []
    })
    
    verdict = validate_student_degree_eligibility(record)
    return StudentEligibilityResponse(
        student_code=student_code,
        is_regular=record["is_regular"],
        current_semester=record["current_semester"],
        pending_prerequisites=record["pending_prerequisites"],
        is_eligible=verdict.is_eligible,
        verdict=verdict.message
    )
