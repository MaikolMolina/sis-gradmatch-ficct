/**
 * SIS-GradMatch: Componente de Notificaciones Push Web
 * FICCT - UAGRM | Molina Cortez Maikol Anthony
 */

const PushNotifications = {
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window,

    async init() {
        if (!this.isSupported) {
            console.log('[Push] Notificaciones Push no soportadas en este entorno.');
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
            console.log('[Push] Permiso de notificaciones previamente concedido.');
        }
    },

    async requestPermissionAndSubscribe() {
        if (!this.isSupported) {
            if (window.showToast) window.showToast("Tu navegador no soporta Notificaciones Push.", "error");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                if (window.showToast) window.showToast("🔔 Notificaciones Push activadas exitosamente.", "success");
                
                // Mostrar notificación local inmediata de bienvenida
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification('🎓 SIS-GradMatch FICCT UAGRM', {
                    body: '¡Notificaciones académicas activadas! Recibirás avisos de observaciones y resoluciones.',
                    icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    vibrate: [100, 50, 100]
                });

                // Registrar suscripción en backend
                try {
                    await fetch('/api/v1/notifications/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            endpoint: `browser_push_${Date.now()}`,
                            user_id: window.Store?.currentUser?.studentCode || '220012345',
                            device_type: navigator.userAgent.includes('Mobile') ? 'MOBILE_BROWSER' : 'DESKTOP_BROWSER'
                        })
                    });
                } catch (e) {
                    console.log('Error enviando suscripción:', e);
                }
            } else {
                if (window.showToast) window.showToast("Permiso de notificaciones denegado.", "info");
            }
        } catch (err) {
            console.error('[Push] Error solicitando permisos:', err);
        }
    }
};

window.PushNotifications = PushNotifications;
