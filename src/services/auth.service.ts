import {supabase} from '../lib/supabase';
import type {LoginCredentials} from '../types';

const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID;

export const authService = {
    login: async ({email, password}: LoginCredentials) => {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    register: async ({email, password, fullName, phone, organizationId}: LoginCredentials & { fullName: string; phone: string; organizationId?: string }) => {
        const targetOrgId = organizationId || DEFAULT_ORG_ID;
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone: phone,
                    organizationId: targetOrgId,
                },
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error("No se pudo crear el usuario");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/init-trial`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({userId: data.user.id})
            });

            if (!response.ok) {
                const resJson = await response.json();
                console.error("⚠️ Error en onboarding:", resJson);
                throw new Error(resJson.error || "Error configurando la cuenta");
            }
        } catch (e) {
            console.error("Error conectando con onboarding:", e);
        }
        return data;
    },

    // Login Social con Google
    loginWithGoogle: async () => {
        const {data, error} = await supabase.auth.signInWithOAuth({
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
        const {error} = await supabase.auth.signOut();
        if (error) throw error;
    }
};