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