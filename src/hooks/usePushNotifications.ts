import {pushService} from '../services/push.service';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const subscribeToPush = async (userId: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error("Este navegador no soporta notificaciones push.");
    }

    try {
        const vapidPublicKey = await pushService.getVapidPublicKey();

        if (!vapidPublicKey) {
            throw new Error("El servidor no devolvió una VAPID public key válida.");
        }

        // Registrar Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {scope: '/'});

        // Esperar a que el SW esté activo
        await navigator.serviceWorker.ready;

        // Pedir permiso y suscribirse en el navegador
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log("✅ Suscripción VAPID generada:", subscription);

        await pushService.saveSubscription(userId, subscription);

        console.log("🚀 Notificaciones activadas exitosamente en BD");
        return true;

    } catch (error) {
        console.error("❌ Error en subscribeToPush:", error);
        throw error;
    }
};