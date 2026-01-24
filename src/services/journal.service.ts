import { supabase } from '../lib/supabase';
import type {UserTrade} from "../types";

export const journalService = {
    // 1. Registrar que tomé una señal ("Copiar")
    logTrade: async (signalId: number, risk: number, reward: number) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data, error } = await supabase
            .from('user_trades')
            .insert({
                user_id: user.id,
                signal_id: signalId,
                risk_amount: risk,
                reward_amount: reward
            })
            .select()
            .single();

        if (error) {
            // Si ya existe (código 23505), no hacemos nada, solo retornamos true
            if (error.code === '23505') return null;
            throw error;
        }
        return data;
    },

    // 2. Obtener mi historial (Bitácora)
    getMyTrades: async (): Promise<UserTrade[]> => {
        const { data, error } = await supabase
            .from('user_trades')
            .select(`
                *,
                signal:signals (
                    symbol,
                    signal_type,
                    status,
                    price,
                    close_price
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as UserTrade[];
    }
};