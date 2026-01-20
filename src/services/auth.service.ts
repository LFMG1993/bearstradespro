import { supabase } from '../lib/supabase';
import type { LoginCredentials } from '../types';

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
    register: async ({ email, password, fullName, phone }: LoginCredentials & { fullName: string; phone: string }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName, // Esto lo lee el trigger handle_new_user
                    phone: phone,
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
                redirectTo: window.location.origin, // Redirige al Home después del login
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