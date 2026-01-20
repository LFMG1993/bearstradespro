import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

type UpdateProfilePayload = {
    full_name?: string;
    phone?: string;
    // Agrega otros campos que quieras que sean actualizables
};

export const profileService = {
    updateProfile: async (userId: string, updates: UpdateProfilePayload) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data as UserProfile;
    },
};