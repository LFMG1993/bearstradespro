import {supabase} from '../lib/supabase';
import type {AdminUser, Plan, Subscription} from '../types';

const getAuthHeader = async () => {
    const {data: {session}} = await supabase.auth.getSession();
    if (!session) throw new Error("Sesión expirada");
    return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
    };
};

export const adminService = {
    /**
     * Obtiene la lista de todos los usuarios globales
     */
    async getUsers(): Promise<AdminUser[]> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {headers});
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al obtener usuarios");
        return json.data;
    },

    /**
     * Obtiene la lista de organizaciones disponibles
     */
    async getOrganizations(): Promise<any[]> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orgs-list`, {headers});
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al obtener organizaciones");
        return json.data;
    },

    /**
     * Crea o Actualiza un usuario (Upsert)
     */
    async saveUser(userData: any): Promise<void> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`, {
            method: 'POST',
            headers,
            body: JSON.stringify(userData)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al guardar usuario");
    },
    /**
     * Obtiene la lista de todos los planes de suscripción
     */
    async getPlans(): Promise<Plan[]> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/plans`, {headers});
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al obtener planes");
        return json.data.map((plan: any) => ({
            ...plan,
            // Convertir precio de string "29.00" a número 29.00
            price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
            // Parsear features si viene como string JSON, si ya es objeto lo dejamos igual
            features: typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || {}),
            // Normalizar nombres de propiedades (snake_case -> camelCase)
            organizationId: plan.organization_id || plan.organizationId,
            organizationName: plan.organization_name || plan.organization?.name || plan.organizationName
        }));
    },

    /**
     * Crea o actualiza un plan de suscripción
     */
    async savePlan(planData: Partial<Plan>): Promise<void> {
        const headers = await getAuthHeader();
        const url = planData.id
            ? `${import.meta.env.VITE_API_URL}/api/admin/plans/${planData.id}`
            : `${import.meta.env.VITE_API_URL}/api/admin/plans`;
        const method = planData.id ? 'PUT' : 'POST';

        const payload = {
            ...planData,
            // El backend espera organization_id
            organization_id: planData.organizationId
        };

        const res = await fetch(url, {method, headers, body: JSON.stringify(payload)});
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al guardar el plan");
    },

    /**
     * Obtiene la lista de todas las suscripciones
     */
    async getSubscriptions(): Promise<Subscription[]> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions`, {headers});
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Error al obtener suscripciones");
        return json.data.map((sub: any) => ({
            user_id: sub.user_id,
            user_full_name: sub.profiles?.full_name || 'Sin Nombre',
            user_email: sub.profiles?.email || 'Sin Email',
            user_avatar: sub.profiles?.avatar_url,

            plan_name: sub.plans?.name || 'Sin Plan',
            plan_code: sub.plans?.code || 'N/A',

            organization_name: sub.organizations?.name || 'Sin Organización',

            status: sub.status,
            payment_provider: sub.payment_provider,
            current_period_end: sub.current_period_end,
            trial_ends_at: sub.trial_ends_at,
            created_at: sub.created_at,
            external_id: sub.external_id
        }));
    },

    /**
     * Elimina un usuario por ID
     */
    async deleteUser(userId: string): Promise<void> {
        const headers = await getAuthHeader();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) {
            const json = await res.json();
            throw new Error(json.error || "Error al eliminar usuario");
        }
    }
};