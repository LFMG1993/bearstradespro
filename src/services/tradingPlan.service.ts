import { supabase } from '../lib/supabase';
import type { TradingPlan, UpdatePlanInput } from "../types";

export const tradingPlanService = {
    // Obtener el plan del usuario actual
    getPlan: async (): Promise<TradingPlan> => {
        const { data, error } = await supabase
            .from('trading_plans')
            .select('*')
            .maybeSingle();

        if (error) {
            console.error("Error fetching plan:", error);
            throw error;
        }

        // Si data es null, es que es un usuario nuevo -> Devolvemos el Default
        if (!data) {
            return {
                id: '',
                initial_capital: 1000,
                risk_per_trade: 1.0,
                risk_reward_ratio: 2.0,
                withdrawal_percentage: 30.0,
                updated_at: new Date().toISOString()
            };
        }

        return data;
    },

    // Guardar o Actualizar
    savePlan: async (plan: UpdatePlanInput) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

        const { data, error } = await supabase
            .from('trading_plans')
            .upsert({
                user_id: user.id,
                ...plan,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};