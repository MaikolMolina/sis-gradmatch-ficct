import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_root_and_health():
    """Verify API root metadata and health check endpoints."""
    res_root = client.get("/")
    assert res_root.status_code == 200
    data = res_root.json()
    assert data["desarrollador"] == "Molina Cortez Maikol Anthony"
    assert data["status"] == "OPERACIONAL (200 OK)"

    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

def test_api_auth_login():
    """Verify login and JWT token generation for director and student."""
    # Login Director
    res_dir = client.post("/api/v1/auth/login", json={
        "username": "director.sistemas",
        "password": "Director2026*"
    })
    assert res_dir.status_code == 200
    data_dir = res_dir.json()
    assert "access_token" in data_dir
    assert data_dir["role"] == "DIRECTOR_CARRERA"

    # Login Student
    res_est = client.post("/api/v1/auth/login", json={
        "username": "estudiante.molina",
        "password": "Estudiante2026*"
    })
    assert res_est.status_code == 200
    assert res_est.json()["role"] == "ESTUDIANTE"

def test_api_matchmaking_and_assignment_workflow():
    """Verify complete flow: authenticate director -> calculate matches -> confirm assignment."""
    # 1. Login as Director
    res_login = client.post("/api/v1/auth/login", json={
        "username": "director.sistemas",
        "password": "Director2026*"
    })
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Query available profiles
    res_profiles = client.get("/api/v1/perfiles/listar", headers=headers)
    assert res_profiles.status_code == 200
    profiles = res_profiles.json()
    assert len(profiles) > 0
    profile_id = profiles[0]["id"]

    # 3. Calculate Matches
    res_match = client.post(f"/api/v1/matchmaking/calculate/{profile_id}", headers=headers)
    assert res_match.status_code == 200
    match_data = res_match.json()
    assert len(match_data["candidates"]) > 0
    best_candidate = match_data["candidates"][0]
    assert best_candidate["ranking"] == 1
    assert best_candidate["similarity_score"] > 0.0

    # 4. Confirm Assignment
    res_confirm = client.post("/api/v1/matchmaking/confirmar-asignacion", headers=headers, json={
        "profile_id": profile_id,
        "teacher_id": best_candidate["teacher_id"],
        "notes": "Asignación validada por coincidencia temática alta en Ingeniería de Software e IA."
    })
    assert res_confirm.status_code == 200
    asig_data = res_confirm.json()
    assert "RES-FICCT-SISTEMAS" in asig_data["resolution_number"]
    assert asig_data["resolution_status"] == "APROBADA"
