export interface PlanConfig {
    initialCapital: number;
    riskPerTrade: number; // Porcentaje (ej: 1 para 1%)
    riskReward: number;   // Ej: 2 para 1:2
    tradesPerMonth: number; // Ej: 20 operaciones al mes
    withdrawalPercentage: number; // % de la ganancia a retirar
}

export interface TradingPlan {
    id: string;
    initial_capital: number;
    risk_per_trade: number;      // %
    risk_reward_ratio: number;   // 1:X
    withdrawal_percentage: number; // %
    updated_at: string;
}

export type UpdatePlanInput = Partial<Omit<TradingPlan, 'id' | 'updated_at'>>;
