import pytest
from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_database

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables and seed database once for test session."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
