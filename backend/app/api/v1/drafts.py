from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import DraftSubmission, User, TutorAssignment
from backend.app.schemas.schemas import (
    DraftSubmitRequest, DraftResponse, ObservationCreateRequest, ObservationResponse, DictumRequest
)
from backend.app.api.deps import get_current_user, require_role
from backend.app.services.thesis_workflow_service import ThesisWorkflowService

router = APIRouter(prefix="/borradores", tags=["Flujo de Borradores y Revisión Pedagógica"])

@router.post("/submit", response_model=DraftResponse)
def submit_draft(
    req: DraftSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ESTUDIANTE", "ADMIN"]))
):
    """Submit a chapter draft for teacher review."""
    try:
        draft = ThesisWorkflowService.submit_chapter_draft(
            db,
            assignment_id=req.assignment_id,
            chapter_number=req.chapter_number,
            chapter_title=req.chapter_title,
            content_text=req.content_text,
            version=req.version or "v1.0"
        )
        res_draft = DraftResponse(
            id=draft.id,
            assignment_id=draft.assignment_id,
            chapter_number=draft.chapter_number,
            chapter_title=draft.chapter_title,
            version=draft.version,
            status=draft.status,
            content_text=draft.content_text,
            submitted_at=draft.submitted_at,
            observations_count=0
        )

        # Disparar Push Notification al Docente Tutor
        try:
            from backend.app.api.v1.notifications import send_push_notification, SendPushRequest
            send_push_notification(SendPushRequest(
                title="📥 Nueva Entrega de Tesista",
                body=f"El estudiante ha presentado el borrador del Capítulo {req.chapter_number} ({req.chapter_title}) para tu revisión.",
                target_role="DOCENTE_TUTOR",
                action_url="/portal/#tutor-reviewer"
            ))
        except Exception as ep:
            print("[FCM submit notice]", ep)

        return res_draft
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/asignacion/{assignment_id}", response_model=List[DraftResponse])
def get_drafts_by_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all chapter drafts for an assignment."""
    drafts = db.query(DraftSubmission).filter(
        DraftSubmission.assignment_id == assignment_id
    ).order_by(DraftSubmission.chapter_number.asc(), DraftSubmission.submitted_at.desc()).all()

    return [
        DraftResponse(
            id=d.id,
            assignment_id=d.assignment_id,
            chapter_number=d.chapter_number,
            chapter_title=d.chapter_title,
            version=d.version,
            status=d.status,
            content_text=d.content_text,
            submitted_at=d.submitted_at,
            observations_count=len(d.observations)
        )
        for d in drafts
    ]

@router.post("/observaciones", response_model=ObservationResponse)
def add_observation(
    req: ObservationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DOCENTE_TUTOR", "TRIBUNAL", "ADMIN"]))
):
    """Add pedagogical observation on a chapter draft."""
    teacher = current_user.teacher
    if not teacher and "ADMIN" not in (current_user.role.name if current_user.role else ""):
        raise HTTPException(status_code=403, detail="Solo los docentes pueden emitir observaciones.")

    teacher_id = teacher.id if teacher else 1
    obs = ThesisWorkflowService.add_pedagogical_observation(
        db,
        draft_id=req.draft_id,
        teacher_id=teacher_id,
        page_number=req.page_number,
        section_name=req.section_name,
        observation_type=req.observation_type,
        comment=req.comment
    )

    tu = obs.teacher.user if obs.teacher else None
    t_name = f"{tu.first_name} {tu.last_name}" if tu else "Docente"

    # Disparar Push Notification al Estudiante
    try:
        from backend.app.api.v1.notifications import send_push_notification, SendPushRequest
        send_push_notification(SendPushRequest(
            title="📝 Nueva Observación en tu Borrador",
            body=f"El docente {t_name} ha registrado correcciones en tu borrador: '{req.comment[:60]}...'",
            target_role="ESTUDIANTE",
            action_url="/portal/#student-observations"
        ))
    except Exception as ep:
        print("[FCM observation notice]", ep)

    return ObservationResponse(
        id=obs.id,
        draft_id=obs.draft_id,
        teacher_name=t_name,
        page_number=obs.page_number,
        section_name=obs.section_name,
        observation_type=obs.observation_type,
        comment=obs.comment,
        is_resolved=obs.is_resolved,
        created_at=obs.created_at
    )

@router.get("/observaciones/{draft_id}", response_model=List[ObservationResponse])
def get_observations_for_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all observations for a draft."""
    draft = db.query(DraftSubmission).filter(DraftSubmission.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Borrador no encontrado.")

    results = []
    for obs in draft.observations:
        tu = obs.teacher.user if obs.teacher else None
        t_name = f"{tu.first_name} {tu.last_name}" if tu else "Docente"
        results.append(ObservationResponse(
            id=obs.id,
            draft_id=obs.draft_id,
            teacher_name=t_name,
            page_number=obs.page_number,
            section_name=obs.section_name,
            observation_type=obs.observation_type,
            comment=obs.comment,
            is_resolved=obs.is_resolved,
            created_at=obs.created_at
        ))
    return results

@router.post("/dictamen", response_model=DraftResponse)
def issue_dictum(
    req: DictumRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["DOCENTE_TUTOR", "ADMIN"]))
):
    """Issue formal approval or correction dictum for a chapter."""
    draft = ThesisWorkflowService.issue_chapter_dictum(db, req.draft_id, req.verdict, req.notes)
    # Disparar Push Notification al Estudiante sobre el dictamen
    try:
        from backend.app.api.v1.notifications import send_push_notification, SendPushRequest
        verdict_str = "APROBADO con Visto Bueno" if req.verdict == "APROBADO" else "OBSERVADO"
        send_push_notification(SendPushRequest(
            title=f"⚖️ Dictamen Emitido: {verdict_str}",
            body=f"Tu docente tutor ha emitido el dictamen del Capítulo {draft.chapter_number}: {verdict_str}. Revisa tu línea de tiempo.",
            target_role="ESTUDIANTE",
            action_url="/portal/#student-timeline"
        ))
    except Exception as ep:
        print("[FCM dictum notice]", ep)

    return DraftResponse(
        id=draft.id,
        assignment_id=draft.assignment_id,
        chapter_number=draft.chapter_number,
        chapter_title=draft.chapter_title,
        version=draft.version,
        status=draft.status,
        content_text=draft.content_text,
        submitted_at=draft.submitted_at,
        observations_count=len(draft.observations)
    )
