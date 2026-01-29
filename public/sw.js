// 1. Event: install
self.addEventListener('install', (event) => {
    console.log('[SW] Install event - forzando activación');
    event.waitUntil(self.skipWaiting());
});

// 2. Event: activate
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    event.waitUntil(self.clients.claim());
});

// 3. Event: push (CRÍTICO para push notifications)
self.addEventListener('push', (event) => {
    console.log('[SW] Push event recibido:', event);

    // Validar que hay data
    if (!event.data) {
        console.error('[SW] Push event sin data');
        return;
    }

    let notificationData = {};

    try {
        // Intentar parsear como JSON
        notificationData = event.data.json();
        console.log('[SW] Notification data (JSON):', notificationData);
    } catch (e) {
        // Si falla, usar como texto plano
        notificationData = {
            body: event.data.text()
        };
        console.log('[SW] Notification data (text):', notificationData);
    }

    const title = notificationData.title || 'Nueva Notificación';
    const options = {
        body: notificationData.body || 'Tienes una nueva notificación',
        icon: notificationData.icon || '/icon.png',
        badge: notificationData.badge || '/badge.png',
        tag: notificationData.tag || 'notification',
        requireInteraction: notificationData.requireInteraction || false,
        data: notificationData.data || {},
        ...notificationData
    };

    console.log('[SW] Mostrando notificación:', {
        title,
        options
    });

    // Mostrar la notificación
    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log('[SW] Notificación mostrada exitosamente'))
            .catch((error) => console.error('[SW] Error mostrando notificación:', error))
    );
});

// 4. Event: notificationclick
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event);

    event.notification.close();

    // Redirigir a una URL si está especificada
    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Buscar si ya hay una ventana abierta
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Si no hay, abrir una nueva
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
            .then(() => console.log('[SW] Notificación clickeada - navegando a:', urlToOpen))
            .catch((error) => console.error('[SW] Error en notificationclick:', error))
    );
});

// 5. Event: notificationclose
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification cerrada:', event.notification.tag);
});

// 6. Event: message (para comunicación desde cliente)
self.addEventListener('message', (event) => {
    console.log('[SW] Mensaje recibido del cliente:', event.data);

    if (event.data && event.data.type === 'PING') {
        console.log('[SW] Respondiendo a PING');
        event.ports[0].postMessage({ type: 'PONG' });
    }
});

// 7. Event: sync (Background Sync - opcional)
self.addEventListener('sync', (event) => {
    console.log('[SW] Sync event:', event.tag);

    if (event.tag === 'sync-push-subscriptions') {
        event.waitUntil(
            // Aquí puedes sincronizar suscripciones si es necesario
            Promise.resolve()
                .then(() => console.log('[SW] Sync completado'))
        );
    }
});

console.log('[SW] Service Worker cargado completamente');