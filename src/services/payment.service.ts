import { supabase } from '../lib/supabase';

export const paymentService = {
    /**
     * Crea una preferencia de pago en Mercado Pago
     * @param planCode Código del plan (ej: 'pro')
     * @param organizationId ID de la organización
     */
    async createPreference(planCode: string, organizationId: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Debes iniciar sesión para suscribirte.");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-preference`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                userId: session.user.id,
                planCode,
                organizationId
            })
        });

        const json = await response.json();

        if (!response.ok) {
            throw new Error(json.error || "Error al iniciar el pago");
        }

        return json.data; // Retorna { init_point, sandbox_init_point, preference_id }
    }
};