from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import DegreeProfile, User
from backend.app.schemas.schemas import (
    MatchmakingResponse, MatchCandidate, AssignmentConfirmRequest, AssignmentResponse
)
from backend.app.api.deps import require_role
from backend.app.services.thesis_workflow_service import ThesisWorkflowService

router = APIRouter(prefix="/matchmaking", tags=["Motor de Matchmaking y Asignación"])

@router.post("/calculate/{profile_id}", response_model=MatchmakingResponse)
def calculate_matches(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DIRECTOR_CARRERA", "ADMIN"]))
):
    """Execute AI Semantic Matchmaking for a degree profile."""
    profile = db.query(DegreeProfile).filter(DegreeProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")

    try:
        raw_candidates = ThesisWorkflowService.run_matchmaking_for_profile(db, profile_id)
        candidates = [MatchCandidate(**c) for c in raw_candidates]
        
        return MatchmakingResponse(
            profile_id=profile.id,
            profile_title=profile.title,
            calculated_at=datetime.now(timezone.utc),
            candidates=candidates
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el cálculo de afinidad semántica: {str(e)}")

@router.post("/confirmar-asignacion", response_model=AssignmentResponse)
def confirm_assignment(
    req: AssignmentConfirmRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DIRECTOR_CARRERA", "ADMIN"]))
):
    """Confirm tutor assignment and issue formal resolution."""
    try:
        assignment = ThesisWorkflowService.confirm_tutor_assignment(
            db, profile_id=req.profile_id, teacher_id=req.teacher_id, notes=req.notes
        )
        tu = assignment.teacher.user
        teacher_name = f"{tu.first_name} {tu.last_name}" if tu else "Docente"
        su = assignment.profile.student.user if assignment.profile.student else None
        student_name = f"{su.first_name} {su.last_name}" if su else "Estudiante"

        return AssignmentResponse(
            id=assignment.id,
            profile_id=assignment.profile_id,
            teacher_id=assignment.teacher_id,
            teacher_name=teacher_name,
            student_name=student_name,
            resolution_number=assignment.resolution_number,
            resolution_status=assignment.resolution_status,
            approved_at=assignment.approved_at
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
