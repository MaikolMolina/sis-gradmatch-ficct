"""
Pruebas Automatizadas para el Motor de IA, Agente por Voz, Notificaciones y Descarga de APK
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_ai_classify_area_endpoint():
    payload = {
        "title": "Sistema de Detección de Intrusos con Redes Neuronales Profundas",
        "abstract": "Investigación sobre machine learning y deep learning para análisis de tráfico en la red de la UAGRM."
    }
    response = client.post("/api/v1/ai/classify-area", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Inteligencia Artificial" in data["primary_area"]
    assert data["confidence"] > 50.0
    assert len(data["keywords_detected"]) > 0
    assert "methodological_recommendation" in data

def test_ai_predict_graduation_time_endpoint():
    payload = {
        "completed_chapters": 3,
        "total_chapters": 5,
        "pending_observations": 1,
        "resolved_observations": 4,
        "words_count": 18500,
        "tutor_active_load": 2,
        "student_response_speed_days": 2.0
    }
    response = client.post("/api/v1/ai/predict-graduation-time", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_days_to_defense"] > 0
    assert data["risk_level"] in ["BAJO", "MEDIO", "ALTO"]
    assert data["completion_percentage"] == 60.0
    assert len(data["optimization_recommendations"]) > 0

def test_ai_voice_agent_query_report_intent():
    payload = {
        "transcript": "Generar reporte de avance de grado por favor",
        "current_user_role": "ESTUDIANTE",
        "student_code": "220012345"
    }
    response = client.post("/api/v1/ai/voice-agent-query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "GENERATE_DYNAMIC_REPORT"
    assert "reporte dinámico" in data["spoken_response"]
    assert data["action"] == "OPEN_REPORT_MODAL"
    assert data["data"]["student_name"] == "Molina Cortez Maikol Anthony"

def test_ai_voice_agent_query_observations_intent():
    payload = {
        "transcript": "¿Cuáles son mis observaciones pendientes?",
        "current_user_role": "ESTUDIANTE"
    }
    response = client.post("/api/v1/ai/voice-agent-query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == "VIEW_OBSERVATIONS"
    assert "observación" in data["spoken_response"].lower()

def test_notifications_subscribe_and_push_workflow():
    # 1. Subscribe
    sub_payload = {
        "endpoint": "https://push.example.com/test-token-12345",
        "keys": {"p256dh": "dummy_key", "auth": "dummy_auth"},
        "user_id": "220012345",
        "device_type": "DESKTOP_BROWSER"
    }
    res_sub = client.post("/api/v1/notifications/subscribe", json=sub_payload)
    assert res_sub.status_code == 200
    assert res_sub.json()["status"] in ["success", "already_subscribed"]

    # 2. Send push
    push_payload = {
        "title": "Aviso de Revisión de Tesis",
        "body": "Tu tutor ha revisado el Capítulo 2.",
        "target_role": "ESTUDIANTE",
        "action_url": "/portal/#drafts"
    }
    res_push = client.post("/api/v1/notifications/send-push", json=push_payload)
    assert res_push.status_code == 200
    assert res_push.json()["status"] == "sent"

    # 3. List history
    res_hist = client.get("/api/v1/notifications/history")
    assert res_hist.status_code == 200
    assert len(res_hist.json()["notifications"]) >= 2

def test_apk_download_endpoint():
    response = client.get("/api/v1/download/apk", follow_redirects=False)
    assert response.status_code in [200, 302]
    if response.status_code == 302:
        assert "storage.googleapis.com" in response.headers["location"]
        assert "SIS-GradMatch-UAGRM.apk" in response.headers["location"]
    else:
        assert "application/vnd.android.package-archive" in response.headers["content-type"]
        assert "SIS-GradMatch-UAGRM.apk" in response.headers["content-disposition"]
