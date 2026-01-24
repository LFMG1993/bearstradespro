export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    organization_id: string;
    roles?: string[]; // Nombres de roles para facilitar UI
    phone?: string;
    trial_ends_at?: string;
    plan_type?: string;
    avatar_url?: string;
}

export interface UserTrade {
    id: string;
    signal_id: number;
    risk_amount: number;
    reward_amount: number;
    created_at: string;
    // Join con la señal para saber si ganó o perdió
    signal: {
        symbol: string;
        signal_type: 'BUY' | 'SELL';
        status: 'ACTIVE' | 'WON' | 'LOST';
        price: number;
        close_price?: number;
    }
}