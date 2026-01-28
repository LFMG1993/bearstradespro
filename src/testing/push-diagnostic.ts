// testing/push-diagnostic.ts
// Ejecuta esto en DevTools Console para diagnosticar el problema

export const pushDiagnostics = {
    /**
     * Test 1: Verificar que el Service Worker está correctamente registrado
     */
    async testServiceWorkerRegistration() {
        console.log('\n=== TEST 1: Service Worker Registration ===\n');

        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('✅ Registrations found:', registrations.length);

            if (registrations.length === 0) {
                console.warn('⚠️ No Service Workers registrados. Necesitas registrar /sw.js');
                return false;
            }

            for (const reg of registrations) {
                console.log('📋 Registration:', {
                    scope: reg.scope,
                    active: !!reg.active,
                    installing: !!reg.installing,
                    waiting: !!reg.waiting,
                    updateViaCache: reg.updateViaCache
                });

                if (reg.active) {
                    console.log('✅ Service Worker activo');
                } else {
                    console.warn('⚠️ Service Worker NO está activo');
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Error checking registrations:', error);
            return false;
        }
    },

    /**
     * Test 2: Verificar que /sw.js es accesible
     */
    async testServiceWorkerFile() {
        console.log('\n=== TEST 2: Service Worker File Accessibility ===\n');

        try {
            const response = await fetch('/sw.js');
            console.log('Status:', response.status);

            if (!response.ok) {
                console.error(`❌ /sw.js retorna ${response.status}. El archivo no es accesible.`);
                return false;
            }

            const content = await response.text();
            console.log('✅ /sw.js es accesible');
            console.log(`File size: ${content.length} bytes`);
            console.log(`Contains 'push' listener: ${content.includes('addEventListener')}`);

            if (!content.includes('push')) {
                console.warn('⚠️ El SW no contiene listener para eventos "push"');
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error fetching /sw.js:', error);
            return false;
        }
    },

    /**
     * Test 3: Verificar que el Service Worker responde a mensajes
     */
    async testServiceWorkerCommunication() {
        console.log('\n=== TEST 3: Service Worker Communication ===\n');

        try {
            const registration = await navigator.serviceWorker.ready;

            if (!registration.active) {
                console.error('❌ No hay Service Worker activo para comunicarse');
                return false;
            }

            // Enviar mensaje y esperar respuesta
            const messageChannel = new MessageChannel();

            const responsePromise = new Promise((resolve) => {
                messageChannel.port1.onmessage = (event) => {
                    console.log('✅ SW respondió:', event.data);
                    resolve(true);
                };

                // Timeout de 2 segundos
                setTimeout(() => resolve(false), 2000);
            });

            registration.active.postMessage(
                { type: 'PING' },
                [messageChannel.port2]
            );

            const response = await responsePromise;

            if (!response) {
                console.warn('⚠️ El SW no respondió al mensaje PING');
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error comunicándose con SW:', error);
            return false;
        }
    },

    /**
     * Test 4: Verificar soporte del navegador para Push
     */
    async testBrowserSupport() {
        console.log('\n=== TEST 4: Browser Support for Push ===\n');

        const checks = {
            serviceWorker: 'serviceWorker' in navigator,
            pushManager: 'PushManager' in window,
            notifications: 'Notification' in window,
            serviceWorkerContainer: 'serviceWorker' in navigator,
        };

        console.log('Support:', checks);

        const supported = Object.values(checks).every(v => v);

        if (!supported) {
            console.error('❌ Tu navegador no soporta todas las características necesarias');
            console.log('Falta soporte para:');
            Object.entries(checks).forEach(([key, value]) => {
                if (!value) console.log(`  - ${key}`);
            });
            return false;
        }

        console.log('✅ Navegador soporta Push Notifications');
        return true;
    },

    /**
     * Test 5: Verificar VAPID key del servidor
     */
    async testVapidKey() {
        console.log('\n=== TEST 5: VAPID Key Validation ===\n');

        try {
            const response = await fetch('/api/push/vapid-public-key');
            const data = await response.json();

            if (response.status !== 200) {
                console.error(`❌ Servidor retorna ${response.status}:`, data);
                return false;
            }

            const { publicKey } = data;
            console.log('📥 VAPID Key:', publicKey.slice(0, 20) + '...');
            console.log('   Length:', publicKey.length);

            // Validaciones
            const checks = {
                'URL-safe format': /^[A-Za-z0-9_-]+$/.test(publicKey),
                'Correct length (87-88)': publicKey.length >= 87 && publicKey.length <= 88,
                'Not empty': publicKey.length > 0,
            };

            Object.entries(checks).forEach(([check, passes]) => {
                console.log(`   ${passes ? '✅' : '❌'} ${check}`);
            });

            const allPass = Object.values(checks).every(v => v);

            if (!allPass) {
                console.error('❌ VAPID key no es válido');
                return false;
            }

            console.log('✅ VAPID key es válido');
            return true;
        } catch (error) {
            console.error('❌ Error obteniendo VAPID key:', error);
            return false;
        }
    },

    /**
     * Test 6: Verificar permisos de notificaciones
     */
    async testNotificationPermission() {
        console.log('\n=== TEST 6: Notification Permissions ===\n');

        try {
            const permission = Notification.permission;
            console.log('Current permission:', permission);

            if (permission === 'denied') {
                console.error('❌ Permisos de notificaciones DENEGADOS');
                console.log('   Necesitas permitir notificaciones en settings del navegador');
                return false;
            }

            if (permission === 'default') {
                console.warn('⚠️ Permisos no solicitados aún');
                console.log('   Se solicitarán al intentar suscribirse');
                return true;
            }

            console.log('✅ Permisos de notificaciones PERMITIDOS');
            return true;
        } catch (error) {
            console.error('❌ Error checking permissions:', error);
            return false;
        }
    },

    /**
     * Test 7: Simular un push notification (servidor debe enviar)
     */
    async testPushSimulation() {
        console.log('\n=== TEST 7: Push Simulation (requiere servidor) ===\n');

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                console.warn('⚠️ No hay suscripción activa');
                console.log('   Primero debes suscribirse a push notifications');
                return false;
            }

            console.log('✅ Hay suscripción activa');
            console.log('   Endpoint:', subscription.endpoint.slice(0, 50) + '...');
            const jsonSub = subscription.toJSON();
            console.log('   Keys:', {
                p256dh: (jsonSub.keys?.p256dh || '').slice(0, 20) + '...',
                auth: (jsonSub.keys?.auth || '').slice(0, 20) + '...'
            });

            return true;
        } catch (error) {
            console.error('❌ Error en simulación:', error);
            return false;
        }
    },

    /**
     * Ejecutar todos los tests
     */
    async runAllTests() {
        console.log('🧪 INICIANDO DIAGNÓSTICO COMPLETO DE PUSH NOTIFICATIONS\n');

        const results = {
            'Service Worker Registration': await this.testServiceWorkerRegistration(),
            'Service Worker File': await this.testServiceWorkerFile(),
            'Service Worker Communication': await this.testServiceWorkerCommunication(),
            'Browser Support': await this.testBrowserSupport(),
            'VAPID Key': await this.testVapidKey(),
            'Notification Permission': await this.testNotificationPermission(),
            'Push Simulation': await this.testPushSimulation(),
        };

        console.log('\n\n📊 RESUMEN DE RESULTADOS:\n');
        console.table(results);

        const passCount = Object.values(results).filter(v => v).length;
        const totalCount = Object.keys(results).length;

        console.log(`\n✅ Pasaron: ${passCount}/${totalCount}`);

        if (passCount === totalCount) {
            console.log('🎉 ¡Todo está bien! El problema debe estar en la VAPID key del servidor.');
        } else {
            console.log('❌ Hay tests fallando. Revisa los logs arriba para más detalles.');
        }

        return results;
    }
};

// Uso en console:
// await pushDiagnostics.runAllTests()