const API_URL = import.meta.env.VITE_API_URL;

export const pushService = {
    /**
     * Obtiene la clave pública VAPID del servidor para iniciar el proceso de suscripción.
     */
    async getVapidPublicKey(): Promise<string> {
        const response = await fetch(`${API_URL}/vapid-public-key`);
        if (!response.ok) {
            throw new Error('No se pudo obtener la VAPID key del servidor.');
        }
        const { publicKey } = await response.json();
        return publicKey;
    },

    /**
     * Envía la suscripción generada por el navegador y el ID del usuario al backend.
     */
    async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
        const response = await fetch(`${API_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, subscription }),
        });

        if (!response.ok) {
            throw new Error('Error al guardar suscripción en el servidor');
        }
    }
};