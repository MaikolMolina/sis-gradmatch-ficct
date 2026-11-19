"""
SIS-GradMatch: Módulo de Notificaciones Push Web y Móvil
Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones - UAGRM
Autor: Molina Cortez Maikol Anthony
"""

from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notificaciones Push"])

# Simulación en memoria de suscripciones push y bandeja de notificaciones
_PUSH_SUBSCRIPTIONS: List[Dict[str, Any]] = []
_NOTIFICATION_HISTORY: List[Dict[str, Any]] = [
    {
        "id": "notif-01",
        "title": "Observación en Capítulo 2",
        "message": "El tutor Ing. Rolando Martínez ha emitido una observación en el entregable.",
        "type": "OBSERVATION",
        "timestamp": "2026-11-18 16:30",
        "read": False,
        "action_url": "/portal/#drafts"
    },
    {
        "id": "notif-02",
        "title": "Resolución de Tutoría Aprobada",
        "message": "Se ha emitido la Resolución Digital N° 084/2026 con código QR de verificación.",
        "type": "RESOLUTION",
        "timestamp": "2026-11-15 10:15",
        "read": True,
        "action_url": "/portal/#thesis"
    }
]

class PushSubscriptionPayload(BaseModel):
    endpoint: str
    keys: Optional[Dict[str, str]] = None
    user_id: Optional[str] = "220012345"
    device_type: Optional[str] = "WEB_BROWSER"

class SendPushRequest(BaseModel):
    title: str
    body: str
    target_role: Optional[str] = "ESTUDIANTE"
    action_url: Optional[str] = "/portal"

@router.post("/subscribe")
def subscribe_push(payload: PushSubscriptionPayload):
    """
    Registra el token o endpoint de Web Push Notification del navegador o dispositivo móvil.
    """
    for sub in _PUSH_SUBSCRIPTIONS:
        if sub.get("endpoint") == payload.endpoint:
            return {"status": "already_subscribed", "message": "El dispositivo ya se encuentra suscrito a notificaciones."}
            
    entry = {
        "endpoint": payload.endpoint,
        "keys": payload.keys or {},
        "user_id": payload.user_id,
        "device_type": payload.device_type,
        "subscribed_at": datetime.now().isoformat()
    }
    _PUSH_SUBSCRIPTIONS.append(entry)
    return {
        "status": "success",
        "message": "Dispositivo suscrito exitosamente a notificaciones Push de la FICCT.",
        "total_active_subscribers": len(_PUSH_SUBSCRIPTIONS)
    }

@router.post("/send-push")
def send_push_notification(payload: SendPushRequest):
    """
    Emite una notificación push a los dispositivos suscritos y la almacena en el historial.
    """
    new_notif = {
        "id": f"notif-{len(_NOTIFICATION_HISTORY) + 1:02d}",
        "title": payload.title,
        "message": payload.body,
        "type": "ACADEMIC_ALERT",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "read": False,
        "action_url": payload.action_url
    }
    _NOTIFICATION_HISTORY.insert(0, new_notif)
    
    return {
        "status": "sent",
        "notification": new_notif,
        "subscribers_notified": len(_PUSH_SUBSCRIPTIONS),
        "channel": "WebPush_ServiceWorker + Firebase_Ready"
    }

@router.get("/history")
def list_notifications():
    """
    Lista el historial de notificaciones y alertas institucionales del usuario.
    """
    return {
        "notifications": _NOTIFICATION_HISTORY,
        "unread_count": sum(1 for n in _NOTIFICATION_HISTORY if not n.get("read"))
    }
