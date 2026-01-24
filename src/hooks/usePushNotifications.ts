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

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
        throw new Error("Falta la VITE_VAPID_PUBLIC_KEY en el archivo .env");
    }

    try {
        // 2. Registrar Service Worker (Debe estar en la carpeta /public)
        const registration = await navigator.serviceWorker.register('/sw.js', {scope: '/'});

        // Esperar a que el SW esté activo
        await navigator.serviceWorker.ready;

        // 3. Pedir permiso y suscribirse en el navegador
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });

        console.log("✅ Suscripción VAPID generada:", subscription);

        // 4. Enviar suscripción + userId al Backend
        const response = await fetch(import.meta.env.VITE_API_URL + '/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
                subscription: subscription
            }),
        });

        if (!response.ok) {
            throw new Error('Error al guardar suscripción en el servidor');
        }

        console.log("🚀 Notificaciones activadas exitosamente en BD");
        return true;

    } catch (error) {
        console.error("❌ Error en subscribeToPush:", error);
        throw error;
    }
};