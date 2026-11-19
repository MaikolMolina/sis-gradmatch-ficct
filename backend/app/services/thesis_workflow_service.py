import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import (
    DegreeProfile, MatchmakingResult, TutorAssignment, DraftSubmission,
    ReviewObservation, Teacher, Student, EvaluationTribunal
)
from backend.app.services.nlp_engine import generate_dense_embedding
from backend.app.services.matchmaking_service import execute_matchmaking_algorithm

class ThesisWorkflowService:
    @staticmethod
    def run_matchmaking_for_profile(db: Session, profile_id: int) -> List[Dict[str, Any]]:
        """Calculate and store matchmaking results for a student profile."""
        profile = db.query(DegreeProfile).filter(DegreeProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Perfil de proyecto con ID {profile_id} no encontrado.")

        # Ensure embedding exists
        if not profile.embedding_json:
            combined_text = f"{profile.title} {profile.summary} {profile.objectives or ''} {profile.keywords or ''}"
            profile.embedding_json = generate_dense_embedding(combined_text)
            db.commit()

        # Query all active teachers
        teachers = db.query(Teacher).filter(Teacher.is_available == True).all()
        candidate_data = []
        for t in teachers:
            # Build representative teacher vector from their expertises
            area_names = [exp.area.name for exp in t.expertises if exp.area]
            keywords = " ".join([exp.keywords or "" for exp in t.expertises])
            teacher_text = f"{t.department} {' '.join(area_names)} {keywords}"
            t_vector = generate_dense_embedding(teacher_text)
            
            candidate_data.append({
                "id": t.id,
                "name": f"{t.user.first_name} {t.user.last_name}",
                "code": t.teacher_code,
                "department": t.department,
                "max_quota": t.max_quota,
                "current_quota": t.current_quota,
                "embedding_vector": t_vector,
                "areas": area_names or ["Ingeniería de Software"]
            })

        results = execute_matchmaking_algorithm(
            profile_vector=profile.embedding_json,
            candidate_teachers=candidate_data
        )

        # Clear existing results and persist new ones
        db.query(MatchmakingResult).filter(MatchmakingResult.profile_id == profile_id).delete()
        for r in results:
            mr = MatchmakingResult(
                profile_id=profile_id,
                teacher_id=r["teacher_id"],
                similarity_score=r["similarity_score"],
                quota_score=r["quota_score"],
                final_score=r["final_score"],
                ranking=r["ranking"],
                justification=r["justification"]
            )
            db.add(mr)
        
        profile.status = "EVALUANDO"
        db.commit()
        return results

    @staticmethod
    def confirm_tutor_assignment(
        db: Session,
        profile_id: int,
        teacher_id: int,
        notes: Optional[str] = None
    ) -> TutorAssignment:
        """Confirm tutor assignment and issue formal resolution."""
        profile = db.query(DegreeProfile).filter(DegreeProfile.id == profile_id).first()
        teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
        if not profile or not teacher:
            raise ValueError("Perfil o Docente no encontrado.")

        # Generate official resolution code
        year = datetime.now().year
        res_code = f"RES-FICCT-SISTEMAS-{year}-{profile.id:04d}"

        assignment = db.query(TutorAssignment).filter(TutorAssignment.profile_id == profile_id).first()
        if not assignment:
            assignment = TutorAssignment(
                profile_id=profile_id,
                teacher_id=teacher_id,
                resolution_number=res_code,
                resolution_status="APROBADA",
                approved_at=datetime.now(timezone.utc),
                notes=notes or f"Resolución formal aprobada por la Dirección de Carrera de Ingeniería en Sistemas."
            )
            db.add(assignment)
            # Update teacher current quota
            teacher.current_quota += 1
            if teacher.current_quota >= teacher.max_quota:
                teacher.is_available = False
        else:
            assignment.teacher_id = teacher_id
            assignment.resolution_number = res_code
            assignment.resolution_status = "APROBADA"
            assignment.approved_at = datetime.now(timezone.utc)

        profile.status = "ASIGNADO"
        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def submit_chapter_draft(
        db: Session,
        assignment_id: int,
        chapter_number: int,
        chapter_title: str,
        content_text: str,
        version: str = "v1.0"
    ) -> DraftSubmission:
        """Submit a chapter draft for iterative teacher review."""
        assignment = db.query(TutorAssignment).filter(TutorAssignment.id == assignment_id).first()
        if not assignment:
            raise ValueError(f"Asignación de tutoría {assignment_id} no encontrada.")

        draft = DraftSubmission(
            assignment_id=assignment_id,
            chapter_number=chapter_number,
            chapter_title=chapter_title,
            version=version,
            content_text=content_text,
            status="EN_REVISION",
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(draft)
        assignment.profile.status = "EN_CURSO"
        db.commit()
        db.refresh(draft)
        return draft

    @staticmethod
    def add_pedagogical_observation(
        db: Session,
        draft_id: int,
        teacher_id: int,
        page_number: int,
        section_name: Optional[str],
        observation_type: str,
        comment: str
    ) -> ReviewObservation:
        """Add geo-located pedagogical observation on PDF chapter."""
        obs = ReviewObservation(
            draft_id=draft_id,
            teacher_id=teacher_id,
            page_number=page_number,
            section_name=section_name or f"Capítulo - Página {page_number}",
            observation_type=observation_type,
            comment=comment,
            is_resolved=False,
            created_at=datetime.now(timezone.utc)
        )
        db.add(obs)
        # Update draft status
        draft = db.query(DraftSubmission).filter(DraftSubmission.id == draft_id).first()
        if draft:
            draft.status = "OBSERVADO"
        db.commit()
        db.refresh(obs)
        return obs

    @staticmethod
    def issue_chapter_dictum(
        db: Session,
        draft_id: int,
        verdict: str, # APROBADO or OBSERVADO
        notes: Optional[str] = None
    ) -> DraftSubmission:
        """Issue formal teacher dictum for a chapter."""
        draft = db.query(DraftSubmission).filter(DraftSubmission.id == draft_id).first()
        if not draft:
            raise ValueError("Borrador no encontrado.")
        draft.status = verdict.upper()
        db.commit()
        db.refresh(draft)
        return draft
