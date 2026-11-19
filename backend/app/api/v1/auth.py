from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.core.security import verify_password, create_access_token
from backend.app.models.models import User
from backend.app.schemas.schemas import LoginRequest, Token, UserResponse
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Autenticación y Seguridad"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with username and password, return signed JWT."""
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas: usuario o contraseña no válidos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta inactiva. Contacte a la Dirección de Carrera."
        )

    role_name = user.role.name if user.role else "ESTUDIANTE"
    token = create_access_token(subject=user.username, role=role_name)

    return Token(
        access_token=token,
        token_type="bearer",
        role=role_name,
        user_id=user.id,
        full_name=f"{user.first_name} {user.last_name}",
        username=user.username
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user information."""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        role=current_user.role.name if current_user.role else "ESTUDIANTE",
        is_active=current_user.is_active
    )
