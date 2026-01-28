import { pushService } from '../services/push.service';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    try {
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
    } catch(error) {
        console.error('❌ Error decodificando VAPID key:', error);
        throw new Error(`Invalid VAPID key format: ${base64String.slice(0, 20)}...`);
    }
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
    debugLog.length = 0; // Clear previous logs

    try {
        // 1. Verificar soporte
        addDebug('CHECK_SUPPORT');
        if (!('serviceWorker' in navigator)) {
            addDebug('CHECK_SUPPORT', undefined, 'serviceWorker not supported');
            throw new Error('Este navegador no soporta Service Workers.');
        }
        if (!('PushManager' in window)) {
            addDebug('CHECK_SUPPORT', undefined, 'PushManager not supported');
            throw new Error('Este navegador no soporta Push Notifications.');
        }

        // 2. Obtener VAPID key
        addDebug('GET_VAPID_KEY');
        const vapidPublicKey = await pushService.getVapidPublicKey();

        if (!vapidPublicKey) {
            addDebug('GET_VAPID_KEY', undefined, 'No public key received');
            throw new Error('El servidor no devolvió una VAPID public key válida.');
        }

        addDebug('VALIDATE_VAPID_FORMAT', {
            length: vapidPublicKey.length,
            preview: vapidPublicKey.slice(0, 20) + '...'
        });

        // Validar que sea base64url
        if (!/^[A-Za-z0-9_-]+$/.test(vapidPublicKey)) {
            addDebug('VALIDATE_VAPID_FORMAT', undefined, 'Not URL-safe base64');
            throw new Error(
                `VAPID key no tiene formato URL-safe. ` +
                `Contiene caracteres especiales: ${vapidPublicKey.slice(0, 30)}`
            );
        }

        if (vapidPublicKey.length < 80 || vapidPublicKey.length > 90) {
            addDebug('VALIDATE_VAPID_FORMAT', undefined, `Invalid length: ${vapidPublicKey.length}`);
            throw new Error(
                `VAPID key tiene longitud inválida: ${vapidPublicKey.length}. ` +
                `Debe estar entre 87-88 caracteres.`
            );
        }

        // 3. Registrar Service Worker
        addDebug('REGISTER_SW');
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        addDebug('REGISTER_SW', {
            state: registration.installing ? 'installing' : 'registered',
            scope: registration.scope
        });

        // 4. Esperar a que esté activo
        addDebug('WAIT_FOR_SW');
        await navigator.serviceWorker.ready;
        addDebug('WAIT_FOR_SW', { active: true });

        // 5. Limpiar suscripción anterior
        addDebug('CLEANUP_EXISTING');
        try {
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                addDebug('CLEANUP_EXISTING', {
                    endpoint: existingSubscription.endpoint.slice(0, 50) + '...'
                });
                await existingSubscription.unsubscribe();
                addDebug('CLEANUP_EXISTING', { status: 'unsubscribed' });
            } else {
                addDebug('CLEANUP_EXISTING', { status: 'no_existing_subscription' });
            }
        } catch(unsubError) {
            addDebug('CLEANUP_EXISTING', undefined, (unsubError as Error).message);
            // Continuar de todas formas
        }

        // 6. Convertir VAPID key a Uint8Array
        addDebug('CONVERT_VAPID');
        let applicationServerKey: Uint8Array;
        try {
            applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
            addDebug('CONVERT_VAPID', {
                arrayLength: applicationServerKey.length
            });
        } catch(convError) {
            addDebug('CONVERT_VAPID', undefined, (convError as Error).message);
            throw convError;
        }

        // 7. Suscribirse al push service
        addDebug('SUBSCRIBE_PUSH');
        let subscription: PushSubscription;
        try {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as any
            });
            addDebug('SUBSCRIBE_PUSH', {
                endpoint: subscription.endpoint.slice(0, 50) + '...',
                hasKeys: !!subscription.toJSON().keys
            });
        } catch(subError) {
            const err = subError as Error;
            addDebug('SUBSCRIBE_PUSH', undefined, err.message);

            // Error diagnostics
            if (err.name === 'AbortError') {
                console.error('⚠️ Posibles causas:');
                console.error('1. VAPID key inválida o corrupta');
                console.error('2. Service Worker no está correctamente registrado');
                console.error('3. Permiso de notificaciones denegado');
                console.error('4. Push service no disponible (revisa internet/firewall)');
            }

            console.error('📋 Debug log:', debugLog);
            throw new Error(
                `Failed to subscribe to push: ${err.message}. ` +
                `Check console for debug information.`
            );
        }

        // 8. Guardar en backend
        addDebug('SAVE_SUBSCRIPTION');
        try {
            await pushService.saveSubscription(userId, subscription);
            addDebug('SAVE_SUBSCRIPTION', { status: 'saved' });
        } catch(saveError) {
            addDebug('SAVE_SUBSCRIPTION', undefined, (saveError as Error).message);
            throw saveError;
        }

        addDebug('COMPLETE', { success: true });
        console.log('✅ Notificaciones activadas exitosamente');
        console.log('📋 Debug info:', debugLog);

        return true;

    } catch (error) {
        console.error('❌ Error en subscribeToPush:', error);
        console.error('📋 Debug log completo:', debugLog);

        if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            console.error('Tipo:', error.name);
        }

        throw error;
    }
};

// Función para exportar debug log
export const getDebugLog = () => debugLog;

// Función para limpiar suscripciones antiguas manualmente
export const unsubscribePush = async () => {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            console.log('✅ Desuscrito correctamente');
            return true;
        }

        console.log('ℹ️ No hay suscripción activa');
        return false;
    } catch(error) {
        console.error('❌ Error al desuscribir:', error);
        throw error;
    }
};