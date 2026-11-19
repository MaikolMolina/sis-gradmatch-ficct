from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_complete_draft_review_lifecycle():
    """Test full cycle: student submits draft -> tutor leaves observation -> tutor issues approval dictum."""
    # 1. Login as Student
    res_est = client.post("/api/v1/auth/login", json={"username": "estudiante.molina", "password": "Estudiante2026*"})
    assert res_est.status_code == 200
    token_est = res_est.json()["access_token"]
    headers_est = {"Authorization": f"Bearer {token_est}"}

    # 2. Get Student Assignment
    res_profiles = client.get("/api/v1/perfiles/listar", headers=headers_est)
    assert res_profiles.status_code == 200
    profile_id = res_profiles.json()[0]["id"]

    # 3. Submit Chapter 1 Draft
    res_draft = client.post("/api/v1/borradores/submit", headers=headers_est, json={
        "assignment_id": 1,
        "chapter_number": 1,
        "chapter_title": "Capítulo 1: Perfil y Marco Metodológico del Proyecto",
        "content_text": "Este capítulo define el marco metodológico PUDS y el árbol de problemas para la titulación en Sistemas.",
        "version": "v1.0"
    })
    assert res_draft.status_code == 200
    draft_id = res_draft.json()["id"]
    assert res_draft.json()["status"] == "EN_REVISION"

    # 4. Login as Teacher / Tutor
    res_doc = client.post("/api/v1/auth/login", json={"username": "docente.martinez", "password": "Docente2026*"})
    assert res_doc.status_code == 200
    token_doc = res_doc.json()["access_token"]
    headers_doc = {"Authorization": f"Bearer {token_doc}"}

    # 5. Teacher reads inbox
    res_inbox = client.get("/api/v1/docentes/mi-bandeja", headers=headers_doc)
    assert res_inbox.status_code == 200
    assert len(res_inbox.json()) > 0

    # 6. Teacher adds pedagogical observation
    res_obs = client.post("/api/v1/borradores/observaciones", headers=headers_doc, json={
        "draft_id": draft_id,
        "page_number": 12,
        "section_name": "1.3 Objetivos Específicos",
        "observation_type": "METODOLOGICA",
        "comment": "Debe formular el objetivo específico 2 con verbo en infinitivo medible conforme al estándar PUDS."
    })
    assert res_obs.status_code == 200
    assert res_obs.json()["observation_type"] == "METODOLOGICA"

    # 7. Check observations list
    res_obs_list = client.get(f"/api/v1/borradores/observaciones/{draft_id}", headers=headers_doc)
    assert res_obs_list.status_code == 200
    assert len(res_obs_list.json()) == 1

    # 8. Teacher approves chapter draft
    res_dictum = client.post("/api/v1/borradores/dictamen", headers=headers_doc, json={
        "draft_id": draft_id,
        "verdict": "APROBADO",
        "notes": "Observaciones subsanadas con éxito."
    })
    assert res_dictum.status_code == 200
    assert res_dictum.json()["status"] == "APROBADO"

def test_analytics_and_cpd_endpoints():
    """Test institutional analytics and simulated CPD registry endpoint."""
    res_ana = client.get("/api/v1/analytics/summary")
    assert res_ana.status_code == 200
    data_ana = res_ana.json()
    assert data_ana["total_students_enrolled"] > 0
    assert data_ana["average_similarity_pct"] == 94.2

    # CPD Check
    res_cpd = client.get("/api/v1/cpd-uagrm/habilitacion/21901234")
    assert res_cpd.status_code == 200
    assert res_cpd.json()["is_eligible"] is True
