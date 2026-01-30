import {supabase} from '../lib/supabase';
import type {AdminUser} from '../types';

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