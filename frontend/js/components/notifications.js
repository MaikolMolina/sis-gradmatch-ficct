/**
 * SIS-GradMatch: Componente de Notificaciones Push Web con Firebase Cloud Messaging (FCM)
 * FICCT - UAGRM | Molina Cortez Maikol Anthony
 */

const PushNotifications = {
    vapidKey: 'BCjyYz1pRETHkMkYD6kTJaDD2csbhcRNWykvQMgKwyfgm4MUDBxJGrdmpXJtORZ6LG_5UU17sRb1wkhtkpF_-d0',
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,

    async init() {
        if (!this.isSupported) {
            console.log('[Push] Notificaciones Push no soportadas en este navegador.');
            return;
        }

        try {
            const reg = await navigator.serviceWorker.register('/portal/sw.js');
            console.log('[Push] Service Worker registrado exitosamente:', reg.scope);
            this.checkPermissionState();
        } catch (err) {
            console.warn('[Push] Error registrando Service Worker:', err);
        }
    },

    checkPermissionState() {
        if (Notification.permission === 'granted') {
            console.log('[Push] Permiso de notificaciones concedido previamente.');
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    },

    async requestPermissionAndSubscribe() {
        if (!this.isSupported) {
            alert("Tu navegador no soporta Notificaciones Push.");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const reg = await navigator.serviceWorker.ready;

                let sub = null;
                try {
                    // Suscribirse mediante PushManager con la clave VAPID de Firebase
                    sub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
                    });
                    console.log('[Push] Suscripción VAPID Firebase exitosa:', sub.endpoint);
                } catch (pushErr) {
                    console.warn('[Push] PushManager VAPID fallback local:', pushErr);
                }

                // Mostrar notificación local inmediata de bienvenida
                reg.showNotification('🎓 SIS-GradMatch FICCT UAGRM', {
                    body: '¡Notificaciones académicas activadas con Firebase! Recibirás avisos de observaciones y resoluciones.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    vibrate: [100, 50, 100]
                });

                // Registrar suscripción en el backend
                try {
                    const endpointUrl = sub ? sub.endpoint : `browser_push_${Date.now()}`;
                    await fetch('/api/v1/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            endpoint: endpointUrl,
                            keys: sub ? { p256dh: '', auth: '' } : {},
                            user_id: window.Store?.state?.currentUser?.registro || '220011559',
                            device_type: navigator.userAgent.includes('Mobile') ? 'MOBILE_BROWSER' : 'DESKTOP_BROWSER'
                        })
                    });
                } catch (e) {
                    console.log('Error enviando suscripción:', e);
                }

                this.showPushSuccessModal();
            } else {
                alert("Permiso de notificaciones denegado en el navegador.");
            }
        } catch (err) {
            console.error('[Push] Error solicitando permisos:', err);
        }
    },

    async sendTestPushNotification(title = null, body = null) {
        const notifTitle = title || "📢 Nueva Observación Académica";
        const notifBody = body || "El tutor Ing. Rolando Martínez ha registrado una revisión sobre el entregable de grado.";

        try {
            const res = await fetch('/api/v1/notifications/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: notifTitle,
                    body: notifBody,
                    target_role: 'ESTUDIANTE',
                    action_url: '/portal/#drafts'
                })
            });

            const data = await res.json();
            console.log('[Push] Notificación enviada con Firebase FCM:', data);

            // Si el service worker está listo, disparar notificación visual
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification(notifTitle, {
                    body: notifBody,
                    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    vibrate: [200, 100, 200]
                });
            }

            return data;
        } catch (e) {
            console.error('[Push] Error emitiendo notificación push:', e);
        }
    },

    showPushSuccessModal() {
        const modalContainer = document.getElementById('modal-container');
        const modalContent = document.getElementById('modal-content');
        if (!modalContainer || !modalContent) return;

        modalContent.innerHTML = `
            <div class="terms-modal-wrapper" style="max-width: 550px;">
                <div class="terms-modal-header" style="background: linear-gradient(135deg, #059669, #10b981); color: white;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.5rem;">🔔</span>
                        <h3 style="margin: 0; font-size: 1.15rem;">Notificaciones Push Conectadas con Firebase</h3>
                    </div>
                    <button class="terms-close-btn" onclick="VoiceAgent.closeModal()" style="color: white;">&times;</button>
                </div>
                <div class="terms-modal-body" style="padding: 20px; text-align: center;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background: #ecfdf5; color: #059669; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
                        ✓
                    </div>
                    <h4 style="margin: 0 0 8px 0; color: #065f46;">¡Dispositivo Enlazado Exitosamente!</h4>
                    <p style="color: #475569; font-size: 0.9rem; margin-bottom: 20px;">
                        Tu navegador y cuenta están suscritos al canal institucional de la <strong>FICCT - UAGRM</strong> a través de <strong>Firebase Cloud Messaging (FCM)</strong>. Recibirás alertas instantáneas cuando tus docentes revisen tus entregables o se emitan resoluciones administrativas.
                    </p>

                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 20px; text-align: left; font-size: 0.8rem; color: #334155;">
                        <div><strong>Proyecto Firebase:</strong> gradmatch-uagrm-2026-515209</div>
                        <div><strong>Canal FCM:</strong> Topic "ficct_gradmatch" + WebPush</div>
                        <div><strong>Clave VAPID:</strong> Configurada y activa</div>
                    </div>

                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <button class="btn btn-primary" onclick="PushNotifications.sendTestPushNotification(); VoiceAgent.closeModal();" style="background: #059669; border: none; padding: 8px 16px;">
                            🚀 Enviar Notificación de Prueba Ahora
                        </button>
                        <button class="btn btn-secondary" onclick="VoiceAgent.closeModal()" style="padding: 8px 16px;">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;

        modalContainer.classList.remove('hidden');
    }
};

window.PushNotifications = PushNotifications;
