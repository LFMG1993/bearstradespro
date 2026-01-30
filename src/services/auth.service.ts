import { supabase } from '../lib/supabase';
import type { LoginCredentials } from '../types';

const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID;

export const authService = {
    // Login con Email y Contraseña
    login: async ({ email, password }: LoginCredentials) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    // Registro (Importante: enviamos full_name para el Trigger de la DB)
    register: async ({ email, password, fullName, phone, organizationId, planCode }: LoginCredentials & { fullName: string; phone: string; organizationId?: string; planCode?: string }) => {

        const targetOrgId = organizationId || DEFAULT_ORG_ID;

        if (!targetOrgId) {
            console.error("❌ No organization ID defined for registration");
            throw new Error("Error de configuración: Sin ID de organización");
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    organizationId: targetOrgId,
                    planCode: planCode || 'pro',
                },
            },
        });
        if (error) throw error;
        return data;
    },

    // Login Social con Google
    loginWithGoogle: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
        if (error) throw error;
        return data;
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};