import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SIS-GradMatch FICCT UAGRM"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "uagrm_ficct_sis_gradmatch_secret_key_2026_super_secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./gradmatch.db")
    DOCUMENTS_DIR: str = os.getenv("DOCUMENTS_DIR", "./storage/documents")

settings = Settings()
os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
