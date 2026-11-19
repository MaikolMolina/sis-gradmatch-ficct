from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, Float, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(200), nullable=True)
    permissions = Column(JSON, default=list)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(80), nullable=False)
    last_name = Column(String(80), nullable=False)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    role = relationship("Role", back_populates="users")
    student = relationship("Student", back_populates="user", uselist=False)
    teacher = relationship("Teacher", back_populates="user", uselist=False)

class Student(Base):
    __tablename__ = "estudiantes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    student_code = Column(String(30), unique=True, index=True, nullable=False) # Registro universitario
    career = Column(String(100), default="Ingeniería en Sistemas")
    current_semester = Column(Integer, default=9)
    is_eligible_degree = Column(Boolean, default=True)
    enrolled_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="student")
    profiles = relationship("DegreeProfile", back_populates="student")

class Teacher(Base):
    __tablename__ = "docentes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    teacher_code = Column(String(30), unique=True, index=True, nullable=False)
    department = Column(String(100), default="Departamento de Computación")
    max_quota = Column(Integer, default=5)
    current_quota = Column(Integer, default=0)
    is_available = Column(Boolean, default=True)

    user = relationship("User", back_populates="teacher")
    expertises = relationship("TeacherExpertise", back_populates="teacher")
    assignments = relationship("TutorAssignment", back_populates="teacher")
    tribunals = relationship("EvaluationTribunal", back_populates="teacher")

class KnowledgeArea(Base):
    __tablename__ = "areas_conocimiento"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    weight = Column(Float, default=1.0)

    expertises = relationship("TeacherExpertise", back_populates="area")

class TeacherExpertise(Base):
    __tablename__ = "especialidades_docente"
    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("docentes.id"), nullable=False)
    area_id = Column(Integer, ForeignKey("areas_conocimiento.id"), nullable=False)
    domain_level = Column(Integer, default=8) # 1 - 10
    years_experience = Column(Integer, default=5)
    keywords = Column(Text, nullable=True) # comma separated

    teacher = relationship("Teacher", back_populates="expertises")
    area = relationship("KnowledgeArea", back_populates="expertises")

class DegreeProfile(Base):
    __tablename__ = "perfiles_proyecto"
    id = Column(Integer, primary_key=True, index=True)
    profile_code = Column(String(30), unique=True, index=True, nullable=False)
    student_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    objectives = Column(Text, nullable=True)
    keywords = Column(String(255), nullable=True)
    pdf_file_path = Column(String(500), nullable=True)
    embedding_json = Column(JSON, nullable=True) # 768-d vector representation
    status = Column(String(40), default="REGISTRADO") # REGISTRADO, EVALUANDO, ASIGNADO, EN_CURSO, FINALIZADO
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="profiles")
    match_results = relationship("MatchmakingResult", back_populates="profile")
    assignment = relationship("TutorAssignment", back_populates="profile", uselist=False)
    tribunals = relationship("EvaluationTribunal", back_populates="profile")

class MatchmakingResult(Base):
    __tablename__ = "matchmaking_resultados"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("perfiles_proyecto.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("docentes.id"), nullable=False)
    similarity_score = Column(Float, nullable=False) # 0.0 - 1.0
    quota_score = Column(Float, nullable=False)      # 0.0 - 1.0
    final_score = Column(Float, nullable=False)      # Combined weighted
    ranking = Column(Integer, default=1)
    justification = Column(Text, nullable=True)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("DegreeProfile", back_populates="match_results")
    teacher = relationship("Teacher")

class TutorAssignment(Base):
    __tablename__ = "asignaciones_tutor"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("perfiles_proyecto.id"), unique=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey("docentes.id"), nullable=False)
    resolution_number = Column(String(50), unique=True, nullable=False)
    resolution_status = Column(String(30), default="APROBADA") # APROBADA, EN_TRAMITE, REVOCADA
    approved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    profile = relationship("DegreeProfile", back_populates="assignment")
    teacher = relationship("Teacher", back_populates="assignments")
    drafts = relationship("DraftSubmission", back_populates="assignment")

class DraftSubmission(Base):
    __tablename__ = "borradores_avance"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("asignaciones_tutor.id"), nullable=False)
    chapter_number = Column(Integer, nullable=False)
    chapter_title = Column(String(150), nullable=False)
    version = Column(String(20), default="v1.0")
    file_path = Column(String(500), nullable=True)
    content_text = Column(Text, nullable=True)
    status = Column(String(30), default="EN_REVISION") # EN_REVISION, OBSERVADO, APROBADO
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    assignment = relationship("TutorAssignment", back_populates="drafts")
    observations = relationship("ReviewObservation", back_populates="draft")

class ReviewObservation(Base):
    __tablename__ = "observaciones_revision"
    id = Column(Integer, primary_key=True, index=True)
    draft_id = Column(Integer, ForeignKey("borradores_avance.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("docentes.id"), nullable=False)
    page_number = Column(Integer, default=1)
    section_name = Column(String(100), nullable=True)
    observation_type = Column(String(40), default="METODOLOGICA") # METODOLOGICA, TECNICA, FORMATO
    comment = Column(Text, nullable=False)
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    draft = relationship("DraftSubmission", back_populates="observations")
    teacher = relationship("Teacher")

class EvaluationTribunal(Base):
    __tablename__ = "tribunales_evaluadores"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("perfiles_proyecto.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("docentes.id"), nullable=False)
    tribunal_role = Column(String(30), default="VOCAL") # PRESIDENTE, SECRETARIO, VOCAL
    dictum = Column(String(30), default="PENDIENTE")    # HABILITADO, OBSERVADO, PENDIENTE
    grade = Column(Float, nullable=True)
    designated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("DegreeProfile", back_populates="tribunals")
    teacher = relationship("Teacher", back_populates="tribunals")
