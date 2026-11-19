import uuid
from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import User, Student, DegreeProfile
from backend.app.schemas.schemas import ProfileCreateRequest, ProfileResponse
from backend.app.api.deps import get_current_user, require_role
from backend.app.services.nlp_engine import generate_dense_embedding

router = APIRouter(prefix="/perfiles", tags=["Perfiles de Proyecto de Grado"])

@router.post("/crear", response_model=ProfileResponse)
def create_profile(
    req: ProfileCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ESTUDIANTE", "ADMIN"]))
):
    """Register degree profile and trigger vectorization."""
    student = current_user.student
    if not student:
        raise HTTPException(status_code=400, detail="El usuario activo no tiene perfil de estudiante.")

    if not student.is_eligible_degree:
        raise HTTPException(
            status_code=400,
            detail="El estudiante no se encuentra habilitado para registrar perfil según el CPD UAGRM."
        )

    # Generate profile code
    year = datetime.now().year
    count = db.query(DegreeProfile).count() + 1
    code = f"PRF-SIS-{year}-{count:03d}"

    # Generate dense semantic vector
    combined_text = f"{req.title} {req.summary} {req.objectives or ''} {req.keywords or ''}"
    vector_768 = generate_dense_embedding(combined_text)

    profile = DegreeProfile(
        profile_code=code,
        student_id=student.id,
        title=req.title,
        summary=req.summary,
        objectives=req.objectives,
        keywords=req.keywords,
        embedding_json=vector_768,
        status="REGISTRADO",
        submitted_at=datetime.now(timezone.utc)
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    return ProfileResponse(
        id=profile.id,
        profile_code=profile.profile_code,
        student_id=student.id,
        student_name=f"{current_user.first_name} {current_user.last_name}",
        student_code=student.student_code,
        title=profile.title,
        summary=profile.summary,
        keywords=profile.keywords,
        status=profile.status,
        submitted_at=profile.submitted_at
    )

@router.get("/listar", response_model=List[ProfileResponse])
def list_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List profiles based on role."""
    role = current_user.role.name if current_user.role else "ESTUDIANTE"
    
    if role == "ESTUDIANTE" and current_user.student:
        profiles = db.query(DegreeProfile).filter(DegreeProfile.student_id == current_user.student.id).all()
    else:
        # Directors, Admins and Teachers see all profiles
        profiles = db.query(DegreeProfile).order_by(DegreeProfile.submitted_at.desc()).all()

    response = []
    for p in profiles:
        student_user = p.student.user if p.student else None
        student_name = f"{student_user.first_name} {student_user.last_name}" if student_user else "Estudiante"
        student_code = p.student.student_code if p.student else "REG-00"
        
        tutor_name = None
        resolution_number = None
        if p.assignment and p.assignment.teacher and p.assignment.teacher.user:
            tu = p.assignment.teacher.user
            tutor_name = f"{tu.first_name} {tu.last_name}"
            resolution_number = p.assignment.resolution_number

        response.append(ProfileResponse(
            id=p.id,
            profile_code=p.profile_code,
            student_id=p.student_id,
            student_name=student_name,
            student_code=student_code,
            title=p.title,
            summary=p.summary,
            keywords=p.keywords,
            status=p.status,
            submitted_at=p.submitted_at,
            tutor_name=tutor_name,
            resolution_number=resolution_number
        ))
    return response

@router.get("/{profile_id}", response_model=ProfileResponse)
def get_profile_by_id(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get profile details by ID."""
    p = db.query(DegreeProfile).filter(DegreeProfile.id == profile_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")

    student_user = p.student.user if p.student else None
    student_name = f"{student_user.first_name} {student_user.last_name}" if student_user else "Estudiante"
    student_code = p.student.student_code if p.student else "REG-00"
    
    tutor_name = None
    resolution_number = None
    if p.assignment and p.assignment.teacher and p.assignment.teacher.user:
        tu = p.assignment.teacher.user
        tutor_name = f"{tu.first_name} {tu.last_name}"
        resolution_number = p.assignment.resolution_number

    return ProfileResponse(
        id=p.id,
        profile_code=p.profile_code,
        student_id=p.student_id,
        student_name=student_name,
        student_code=student_code,
        title=p.title,
        summary=p.summary,
        keywords=p.keywords,
        status=p.status,
        submitted_at=p.submitted_at,
        tutor_name=tutor_name,
        resolution_number=resolution_number
    )
