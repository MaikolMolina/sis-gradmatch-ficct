"""
SIS-GradMatch: Módulo de Notificaciones Push Web y Móvil con Firebase Cloud Messaging (FCM)
Facultad de Ingeniería en Ciencias de la Computación y Telecomunicaciones - UAGRM
Autor: Molina Cortez Maikol Anthony
"""

import os
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/notifications", tags=["Notificaciones Push"])

# VAPID Key para Web Push
VAPID_PUBLIC_KEY = "BCjyYz1pRETHkMkYD6kTJaDD2csbhcRNWykvQMgKwyfgm4MUDBxJGrdmpXJtORZ6LG_5UU17sRb1wkhtkpF_-d0"

# Inicialización segura de Firebase Admin SDK
firebase_initialized = False
firebase_app = None

try:
    import firebase_admin
    from firebase_admin import credentials, messaging

    # Buscar clave de cuenta de servicio de Firebase
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".."))
    candidates = [
        os.path.join(base_dir, "gradmatch-uagrm-2026-515209-firebase-adminsdk-fbsvc-853db2312e.json"),
        os.path.join(os.getcwd(), "gradmatch-uagrm-2026-515209-firebase-adminsdk-fbsvc-853db2312e.json"),
        os.path.join(base_dir, "backend", "gradmatch-uagrm-2026-515209-firebase-adminsdk-fbsvc-853db2312e.json"),
        os.path.join(base_dir, "firebase-admin-key.json")
    ]
    key_path = next((p for p in candidates if os.path.exists(p)), None)

    if key_path:
        if not firebase_admin._apps:
            cred = credentials.Certificate(key_path)
            firebase_app = firebase_admin.initialize_app(cred)
            firebase_initialized = True
            print(f"[Firebase] Firebase Admin SDK inicializado exitosamente con: {os.path.basename(key_path)}")
        else:
            firebase_app = firebase_admin.get_app()
            firebase_initialized = True
    else:
        print("[Firebase] Aviso: Llave de Firebase Admin no encontrada en rutas candidatas.")
except Exception as ex:
    print(f"[Firebase] Error inicializando Firebase Admin SDK: {ex}")

# Persistencia en memoria de suscripciones push y bandeja de notificaciones
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
    user_id: Optional[str] = "220011559"
    device_type: Optional[str] = "WEB_BROWSER"
    fcm_token: Optional[str] = None

class SendPushRequest(BaseModel):
    title: str
    body: str
    target_role: Optional[str] = "ESTUDIANTE"
    action_url: Optional[str] = "/portal"
    fcm_token: Optional[str] = None

@router.get("/vapid-key")
def get_vapid_key():
    """
    Retorna la clave pública VAPID para suscripciones Web Push en el navegador.
    """
    return {
        "vapid_public_key": VAPID_PUBLIC_KEY,
        "project_id": "gradmatch-uagrm-2026-515209",
        "firebase_connected": firebase_initialized
    }

@router.post("/subscribe")
def subscribe_push(payload: PushSubscriptionPayload):
    """
    Registra el token o endpoint de Web Push Notification del navegador o dispositivo móvil Android.
    """
    for sub in _PUSH_SUBSCRIPTIONS:
        if sub.get("endpoint") == payload.endpoint or (payload.fcm_token and sub.get("fcm_token") == payload.fcm_token):
            return {
                "status": "already_subscribed",
                "message": "El dispositivo ya se encuentra suscrito a notificaciones.",
                "total_active_subscribers": len(_PUSH_SUBSCRIPTIONS),
                "firebase_connected": firebase_initialized
            }
            
    entry = {
        "endpoint": payload.endpoint,
        "keys": payload.keys or {},
        "user_id": payload.user_id,
        "device_type": payload.device_type,
        "fcm_token": payload.fcm_token,
        "subscribed_at": datetime.now().isoformat()
    }
    _PUSH_SUBSCRIPTIONS.append(entry)
    return {
        "status": "success",
        "message": "Dispositivo suscrito exitosamente a notificaciones Push de la FICCT.",
        "total_active_subscribers": len(_PUSH_SUBSCRIPTIONS),
        "firebase_connected": firebase_initialized
    }

@router.post("/send-push")
def send_push_notification(payload: SendPushRequest):
    """
    Emite una notificación push a través de Firebase Cloud Messaging (FCM)
    y la almacena en el historial del expediente.
    """
    fcm_message_id = None
    fcm_status = "uninitialized"

    if firebase_initialized:
        try:
            from firebase_admin import messaging

            # Si se envía un token específico, enviar directamente al dispositivo
            if payload.fcm_token:
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=payload.title,
                        body=payload.body
                    ),
                    data={
                        "action_url": payload.action_url or "/portal",
                        "target_role": payload.target_role or "ESTUDIANTE",
                        "timestamp": datetime.now().isoformat()
                    },
                    token=payload.fcm_token
                )
                fcm_message_id = messaging.send(message)
                fcm_status = "sent_to_token"
            else:
                # Transmitir al topic institucional "ficct_gradmatch"
                message = messaging.Message(
                    notification=messaging.Notification(
                        title=payload.title,
                        body=payload.body
                    ),
                    data={
                        "action_url": payload.action_url or "/portal",
                        "target_role": payload.target_role or "ESTUDIANTE",
                        "timestamp": datetime.now().isoformat()
                    },
                    topic="ficct_gradmatch"
                )
                fcm_message_id = messaging.send(message)
                fcm_status = "broadcast_to_topic"
        except Exception as e:
            fcm_status = f"error: {str(e)}"
            print(f"[Firebase] Error enviando mensaje FCM: {e}")

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
        "fcm_status": fcm_status,
        "fcm_message_id": fcm_message_id,
        "notification": new_notif,
        "subscribers_notified": len(_PUSH_SUBSCRIPTIONS),
        "channel": "Firebase_Cloud_Messaging_v1 + WebPush_ServiceWorker"
    }

@router.get("/history")
def list_notifications():
    """
    Lista el historial de notificaciones y alertas institucionales del usuario.
    """
    return {
        "notifications": _NOTIFICATION_HISTORY,
        "unread_count": sum(1 for n in _NOTIFICATION_HISTORY if not n.get("read")),
        "firebase_connected": firebase_initialized
    }
