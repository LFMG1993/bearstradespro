export interface Signal {
    id: number;
    created_at: string;
    updated_at?: string;
    symbol: string;
    signal_type: 'BUY' | 'SELL';
    price: number;

    // Gestión de Riesgo
    stop_loss: number;
    take_profit: number;
    estimated_profit?: number;
    estimated_loss?: number;
    realized_profit?: number;
    lotage: number;

    // Estado del Trade
    status: 'ACTIVE' | 'WON' | 'LOST' | 'SECURED' | 'CANCELLED';
    close_price?: number;
    organization_id: string;
}

// Interfaz para las estadísticas por símbolo
export interface SymbolStat {
    symbol: string;
    winRate: number;
    totalTrades: number;
    wins: number;
    losses: number;
    netProfit: number;
}