export interface Signal {
    id: number;
    created_at: string;
    updated_at?: string; // Nuevo
    symbol: string;
    signal_type: 'BUY' | 'SELL';
    price: number;

    // Gestión de Riesgo (Nuevos)
    stop_loss: number;
    take_profit: number;
    estimated_profit?: number; // El dinero que calculó el bot
    estimated_loss?: number;
    lotage: number;

    // Estado del Trade
    status: 'ACTIVE' | 'WON' | 'LOST';
    close_price?: number;
    organization_id: string;
}