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
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                password,
                fullName,
                phone,
                organizationId: targetOrgId,
                redirectTo: `${window.location.origin}/login`
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || "Error al registrar el usuario");
        }

        return await response.json();
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