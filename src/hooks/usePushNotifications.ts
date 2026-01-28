import { pushService } from '../services/push.service';

/**
 * Convierte un string base64URL a Uint8Array de forma segura.
 * Esta es la implementación estándar recomendada.
 */
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

interface DebugInfo {
    timestamp: string;
    step: string;
    data?: any;
    error?: string;
}

const debugLog: DebugInfo[] = [];

function addDebug(step: string, data?: any, error?: string) {
    const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        step,
        ...(data && { data }),
        ...(error && { error })
    };
    debugLog.push(info);
    console.log(`[${step}]`, data || error || '✓');
}

export const subscribeToPush = async (userId: string) => {
    debugLog.length = 0; // Limpiar logs anteriores

    try {
        // 1. Verificar soporte
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            throw new Error('Navegador no soporta notificaciones.');
        }

        // 2. Registrar Service Worker (Idempotente: si ya existe, devuelve el activo)
        addDebug('REGISTER_SW');

        // IMPORTANTE: En producción, asegúrate de que el archivo existe en /sw.js
        const registration = await navigator.serviceWorker.register('/sw.js');

        addDebug('WAIT_FOR_SW');
        await navigator.serviceWorker.ready; // Espera a que el SW esté activo

        // 3. Verificar si YA existe una suscripción
        addDebug('CHECK_EXISTING');
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            addDebug('EXISTING_FOUND', { endpoint: subscription.endpoint.slice(0, 30) + '...' });

            // Opcional: Podrías verificar si la VAPID key cambió, pero por ahora asumimos que es la misma.
            // Si ya existe, NO nos desuscribimos. Simplemente actualizamos el backend.
        } else {
            // 4. Si NO existe, creamos una nueva
            addDebug('GET_VAPID_KEY');
            const vapidPublicKey = await pushService.getVapidPublicKey();

            addDebug('CONVERT_VAPID');
            const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

            addDebug('SUBSCRIBE_PUSH_NEW');
            try {
                // Aquí es donde ocurría el error. Ahora solo pasa si no había suscripción previa.
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey
                });
            } catch (subError: any) {
                // Si falla aquí, suele ser bloqueo de permisos o error de key
                if (Notification.permission === 'denied') {
                    throw new Error('El usuario denegó los permisos de notificación.');
                }
                throw subError;
            }
        }

        // 5. Enviar al Backend (Siempre actualizamos para asegurar que el userId esté vinculado)
        addDebug('SAVE_TO_BACKEND');
        if (subscription) {
            await pushService.saveSubscription(userId, subscription);
        }

        addDebug('COMPLETE', { success: true });
        console.log('✅ Notificaciones sincronizadas correctamente');
        return true;

    } catch (error: any) {
        console.error('❌ Error en subscribeToPush:', error);
        console.error('📋 Debug Log:', debugLog);
        throw error;
    }
};

export const getDebugLog = () => debugLog;