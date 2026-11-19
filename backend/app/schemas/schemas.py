from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    username: str

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool

# Student & CPD Schemas
class StudentEligibilityResponse(BaseModel):
    student_code: str
    is_regular: bool
    current_semester: int
    pending_prerequisites: List[str]
    is_eligible: bool
    verdict: str

# Profile Schemas
class ProfileCreateRequest(BaseModel):
    title: str
    summary: str
    objectives: Optional[str] = None
    keywords: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    profile_code: str
    student_id: int
    student_name: str
    student_code: str
    title: str
    summary: str
    keywords: Optional[str]
    status: str
    submitted_at: datetime
    tutor_name: Optional[str] = None
    resolution_number: Optional[str] = None

# Matchmaking Schemas
class MatchCandidate(BaseModel):
    teacher_id: int
    teacher_name: str
    teacher_code: str
    department: str
    max_quota: int
    current_quota: int
    quota_available: int
    similarity_score: float
    quota_score: float
    final_score: float
    ranking: int
    matched_areas: List[str]
    justification: str

class MatchmakingResponse(BaseModel):
    profile_id: int
    profile_title: str
    calculated_at: datetime
    candidates: List[MatchCandidate]

class AssignmentConfirmRequest(BaseModel):
    profile_id: int
    teacher_id: int
    notes: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: int
    profile_id: int
    teacher_id: int
    teacher_name: str
    student_name: str
    resolution_number: str
    resolution_status: str
    approved_at: datetime

# Draft & Review Schemas
class DraftSubmitRequest(BaseModel):
    assignment_id: int
    chapter_number: int
    chapter_title: str
    content_text: str
    version: Optional[str] = "v1.0"

class DraftResponse(BaseModel):
    id: int
    assignment_id: int
    chapter_number: int
    chapter_title: str
    version: str
    status: str
    content_text: Optional[str]
    submitted_at: datetime
    observations_count: int

class ObservationCreateRequest(BaseModel):
    draft_id: int
    page_number: int
    section_name: Optional[str] = None
    observation_type: str = "METODOLOGICA"
    comment: str

class ObservationResponse(BaseModel):
    id: int
    draft_id: int
    teacher_name: str
    page_number: int
    section_name: Optional[str]
    observation_type: str
    comment: str
    is_resolved: bool
    created_at: datetime

class DictumRequest(BaseModel):
    draft_id: int
    verdict: str  # APROBADO or OBSERVADO
    notes: Optional[str] = None

# Tribunal Schemas
class TribunalAssignRequest(BaseModel):
    profile_id: int
    teacher_ids: List[int] # Expects 3 teachers

# Analytics
class AnalyticsSummary(BaseModel):
    total_students_enrolled: int
    active_profiles: int
    assigned_tutors: int
    in_review_theses: int
    defense_ready: int
    average_similarity_pct: float
    average_assignment_hours: float
    thematic_distribution: List[dict]
