/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

// Definición manual para el evento de cambio de suscripción que falta en las libs por defecto
interface PushSubscriptionChangeEvent extends ExtendableEvent {
    readonly newSubscription?: PushSubscription | null;
    readonly oldSubscription?: PushSubscription | null;
}

console.log('[SW] Service Worker cargado');

// 1. Event: install
self.addEventListener('install', (event: ExtendableEvent) => {
    console.log('[SW] Instalando...');
    event.waitUntil(self.skipWaiting());
});

// 2. Event: activate
self.addEventListener('activate', (event: ExtendableEvent) => {
    console.log('[SW] Activando...');
    event.waitUntil(self.clients.claim());
});

// 3. Event: push (CRÍTICO para push notifications)
self.addEventListener('push', (event: PushEvent) => {
    console.log('[SW] Push event recibido:', event);

    if (!event.data) {
        console.warn('[SW] Push sin data');
        return;
    }

    let notificationData: any = {};

    try {
        notificationData = event.data.json();
    } catch (e) {
        notificationData = {
            body: event.data.text()
        };
    }

    const title = notificationData.title || 'Nueva Notificación';
    const options: NotificationOptions = {
        body: notificationData.body || 'Tienes una nueva notificación',
        icon: notificationData.icon || '/icon.png',
        badge: notificationData.badge || '/badge.png',
        tag: notificationData.tag || 'notification',
        requireInteraction: notificationData.requireInteraction || false,
        data: notificationData.data || {},
        ...notificationData
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log('[SW] Notificación mostrada'))
            .catch((error) => console.error('[SW] Error:', error))
    );
});

// 4. Event: notificationclick
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (let i = 0; i < clientList.length; i++) {
                    const client = clientList[i] as WindowClient;
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow(urlToOpen);
                }
            })
    );
});

// 5. Event: notificationclose
self.addEventListener('notificationclose', (_event: NotificationEvent) => {
    console.log('[SW] Notificación cerrada');
});

// 6. Event: message
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'PING' && event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'PONG' });
    }
});

// 7. Event: pushsubscriptionchange (importante para VAPID)
self.addEventListener('pushsubscriptionchange', (_event: PushSubscriptionChangeEvent) => {
    console.log('[SW] Push subscription cambió');
});
