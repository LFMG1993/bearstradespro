export interface Signal {
    id: number;
    pair: string;
    type: 'BUY' | 'SELL' | 'BUY_LIMIT' | 'SELL_LIMIT';
    entry_price: number;
    stop_loss: number;
    take_profit_1: number;
    take_profit_2?: number | null;
    take_profit_3?: number | null;
    status: 'PENDING' | 'ACTIVE' | 'WON' | 'LOST' | 'CANCELLED';
    result_pips: number;
    notes?: string | null;
    image_url?: string | null;
    is_free: boolean | number;
    created_at: string;
    closed_at?: string | null;
}

