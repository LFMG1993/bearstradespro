import type { Signal } from '../types';

export const calculateMonthlyStats = (signals: Signal[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 1. Filtramos solo las de los últimos 30 días
    const recentSignals = signals.filter(signal => {
        const signalDate = new Date(signal.created_at);
        return signalDate >= thirtyDaysAgo;
    });

    let wins = 0;
    let losses = 0;
    let totalProfit = 0;

    recentSignals.forEach(signal => {
        // Solo contamos operaciones cerradas
        if (signal.status === 'WON') {
            wins++;
            // Sumamos la ganancia estimada
            totalProfit += (signal.estimated_profit || 0);
        } else if (signal.status === 'LOST') {
            losses++;
            // Restamos el riesgo (Asumiendo Ratio 1:2, el riesgo es la mitad del profit)
            totalProfit -= ((signal.estimated_profit || 0) / 2);
        }
    });

    const totalClosed = wins + losses;
    const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;

    return {
        totalSignals: recentSignals.length,
        winRate: Math.round(winRate),
        netProfit: totalProfit,
        trend: totalProfit >= 0 ? 'up' : 'down' // Si es positivo, flechita arriba
    };
};

// Nueva interfaz para las estadísticas por símbolo
export interface SymbolStat {
    symbol: string;
    winRate: number;
    totalTrades: number;
    wins: number;
    losses: number;
    netProfit: number;
}

export const calculateSymbolStats = (signals: Signal[], date: Date = new Date()): SymbolStat[] => {
    const targetMonth = date.getMonth();
    const targetYear = date.getFullYear();

    // 1. Filtrar solo señales del mes actual y que estén cerradas (WON/LOST)
    const monthlySignals = signals.filter(s => {
        const signalDate = new Date(s.created_at);
        return signalDate.getMonth() === targetMonth &&
            signalDate.getFullYear() === targetYear &&
            (s.status === 'WON' || s.status === 'LOST');
    });

    // 2. Agrupar por símbolo
    const groups: Record<string, Signal[]> = {};
    monthlySignals.forEach(s => {
        if (!groups[s.symbol]) groups[s.symbol] = [];
        groups[s.symbol].push(s);
    });

    // 3. Calcular estadísticas por grupo
    const stats: SymbolStat[] = Object.keys(groups).map(symbol => {
        const group = groups[symbol];
        const totalTrades = group.length;
        const wins = group.filter(s => s.status === 'WON').length;
        const losses = group.filter(s => s.status === 'LOST').length;

        // Calcular profit neto del símbolo
        const netProfit = group.reduce((acc, curr) => {
            if (curr.status === 'WON') return acc + (curr.estimated_profit || 0);
            if (curr.status === 'LOST') return acc - (curr.estimated_loss || 0);
            return acc;
        }, 0);

        return {
            symbol,
            totalTrades,
            wins,
            losses,
            winRate: totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0,
            netProfit
        };
    });

    // 4. Ordenar por Win Rate descendente (y luego por cantidad de trades para desempatar)
    return stats.sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.totalTrades - a.totalTrades;
    });
};