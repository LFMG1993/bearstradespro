const API_URL = import.meta.env.VITE_API_URL;

export const publicService = {
    /**
     * Obtener los planes activos de una organización de forma pública
     */
    async getPlans(organizationId: string) {
        const response = await fetch(`${API_URL}/api/public/plans?organizationId=${organizationId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al obtener planes");
        }

        return data.data;
    },

    /**
     * Validar un cupón
     */
    async validateCoupon(code: string, organizationId: string, planCode?: string) {
        const response = await fetch(`${API_URL}/api/public/validate-coupon`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, organizationId, planCode })
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Cupón inválido");
        }

        return data.data;
    },

    /**
     * Obtener la Tasa Representativa del Mercado (TRM)
     */
    async getExchangeRate() {
        const response = await fetch(`${API_URL}/api/public/trm`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al obtener TRM");
        }

        return data.value;
    }
};
