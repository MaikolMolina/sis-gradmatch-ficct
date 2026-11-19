// SIS-GradMatch: Service Worker para Notificaciones Push y Alertas en Segundo Plano
// FICCT - UAGRM | Molina Cortez Maikol Anthony

const CACHE_NAME = 'sis-gradmatch-cache-v1';
const OFFLINE_URLS = [
    '/portal/',
    '/portal/css/styles.css',
    '/portal/js/app.js'
];

self.addEventListener('install', (event) => {
    console.log('[SW] Service Worker instalado.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker activado.');
    event.waitUntil(clients.claim());
});

// Evento Push recibido del servidor
self.addEventListener('push', (event) => {
    console.log('[SW] Notificación Push recibida:', event);
    let data = {
        title: 'SIS-GradMatch FICCT UAGRM',
        body: 'Nueva actualización en tu expediente de grado.',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        action_url: '/portal/'
    };

    if (event.data) {
        try {
            const json = event.data.json();
            data = { ...data, ...json };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            action_url: data.action_url || '/portal/'
        },
        actions: [
            { action: 'open', title: 'Ver en Portal' },
            { action: 'dismiss', title: 'Cerrar' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clic en la notificación
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Clic en notificación push:', event.notification.tag);
    event.notification.close();

    const targetUrl = event.notification.data?.action_url || '/portal/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(targetUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
