import { pushService } from '../services/push.service';

/**
 * Convierte base64URL a Uint8Array de forma ROBUSTA
 * Esta implementación maneja edge cases y valida la entrada
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    // 1. Validar entrada
    if (!base64String || typeof base64String !== 'string') {
        throw new Error('Invalid VAPID key: must be a non-empty string');
    }

    // 2. Limpiar posibles espacios/saltos de línea
    const cleaned = base64String.trim();

    // 3. Agregar padding correcto (solo si es necesario)
    const padding = '='.repeat((4 - (cleaned.length % 4)) % 4);

    // 4. Convertir base64url a base64 estándar
    const base64 = (cleaned + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // 5. Decodificar con manejo de errores
    let rawData: string;
    try {
        rawData = window.atob(base64);
    } catch (e) {
        console.error('❌ Error decodificando VAPID key:', e);
        throw new Error('Invalid VAPID key format - cannot decode base64');
    }

    // 6. Validar longitud (debe ser 65 bytes para P-256 uncompressed)
    if (rawData.length !== 65) {
        console.warn(`⚠️ VAPID key tiene ${rawData.length} bytes, esperados 65`);
    }

    // 7. Convertir a Uint8Array
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
    debugLog.length = 0;

    try {
        // 1. Verificar soporte
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers no soportados en este navegador');
        }
        if (!('PushManager' in window)) {
            throw new Error('Push API no soportada en este navegador');
        }
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
            throw new Error('Notificaciones no soportadas');
        }

        addDebug('BROWSER_SUPPORT', {
            sw: true,
            push: true,
            notifications: true
        });

        // 2. Verificar permisos ANTES de registrar SW
        if (Notification.permission === 'denied') {
            throw new Error('Permisos de notificación denegados por el usuario');
        }

        // 3. Obtener el Service Worker que Vite ya registró automáticamente
        addDebug('GET_SW_REGISTRATION');
        // .ready espera a que el SW esté activo, no necesitamos registrarlo manualmente
        const registration = await navigator.serviceWorker.ready;

        addDebug('SW_READY', { scope: registration.scope });

        // 5. Obtener VAPID key del backend
        addDebug('GET_VAPID_KEY');
        const vapidPublicKey = await pushService.getVapidPublicKey();

        addDebug('VAPID_RECEIVED', {
            length: vapidPublicKey.length,
            preview: vapidPublicKey.slice(0, 20) + '...'
        });

        // 6. Convertir VAPID key
        addDebug('CONVERT_VAPID');
        let applicationServerKey: Uint8Array;
        try {
            applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
            addDebug('VAPID_CONVERTED', {
                bytes: applicationServerKey.length,
                firstByte: applicationServerKey[0]
            });
        } catch (conversionError: any) {
            addDebug('VAPID_CONVERSION_FAILED', null, conversionError.message);
            throw new Error(`Error convirtiendo VAPID key: ${conversionError.message}`);
        }

        // 7. Verificar suscripción existente
        addDebug('CHECK_EXISTING');
        let subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            addDebug('EXISTING_FOUND', {
                endpoint: subscription.endpoint.slice(0, 50) + '...'
            });

            // Verificar si la key coincide comparando el applicationServerKey
            const existingKey = subscription.options.applicationServerKey;
            if (existingKey && existingKey instanceof ArrayBuffer) {
                const existingArray = new Uint8Array(existingKey);
                const keysMatch = existingArray.length === applicationServerKey.length &&
                    existingArray.every((val, idx) => val === applicationServerKey[idx]);

                if (!keysMatch) {
                    addDebug('KEY_MISMATCH', { action: 'unsubscribing' });
                    await subscription.unsubscribe();
                    subscription = null;
                }
            }
        }

        if (!subscription) {
            // 8. Pedir permisos si no los tiene
            if (Notification.permission === 'default') {
                addDebug('REQUEST_PERMISSION');
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    throw new Error('Usuario denegó permisos de notificación');
                }
            }

            // 9. Crear nueva suscripción
            addDebug('SUBSCRIBE_PUSH_NEW');
            try {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey as any
                });

                addDebug('SUBSCRIPTION_CREATED', {
                    endpoint: subscription.endpoint.slice(0, 50) + '...',
                    hasKeys: !!(subscription.toJSON().keys)
                });
            } catch (subError: any) {
                addDebug('SUBSCRIPTION_FAILED', null, subError.message);

                // Mensajes de error más específicos
                if (subError.name === 'AbortError') {
                    throw new Error('Error de servicio Push: verifica que las VAPID keys sean válidas');
                } else if (subError.name === 'NotAllowedError') {
                    throw new Error('Permisos denegados');
                } else {
                    throw new Error(`Error creando suscripción: ${subError.message}`);
                }
            }
        }

        // 10. Guardar en backend
        if (!subscription) {
            throw new Error('No se pudo obtener suscripción');
        }

        addDebug('SAVE_TO_BACKEND');
        await pushService.saveSubscription(userId, subscription);

        addDebug('COMPLETE', { success: true });
        console.log('✅ Suscripción Push completada exitosamente');

        return true;

    } catch (error: any) {
        console.error('❌ Error en subscribeToPush:', error);
        console.error('📋 Debug Log completo:', debugLog);
        throw error;
    }
};

/**
 * Desuscribirse de notificaciones
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return false;

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return false;

        const result = await subscription.unsubscribe();
        console.log('✅ Desuscripción exitosa');
        return result;
    } catch (error) {
        console.error('❌ Error al desuscribirse:', error);
        return false;
    }
};

export const getDebugLog = () => debugLog;