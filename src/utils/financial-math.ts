import type {PlanConfig} from "../types";

export const calculateTradeMetrics = (config: PlanConfig) => {
    const riskAmount = config.initialCapital * (config.riskPerTrade / 100);
    const rewardAmount = riskAmount * config.riskReward;
    // Breakeven WinRate = 1 / (1 + RiskReward)
    const breakEvenWinRate = (1 / (1 + config.riskReward)) * 100;

    return {
        riskAmount,
        rewardAmount,
        breakEvenWinRate
    };
};

export const calculateProjection = (config: PlanConfig, months: number = 12) => {
    let currentBalance = config.initialCapital;
    const projection = [];

    // Fórmula de Esperanza Matemática por Trade:
    // Ganancia Esperada = (%Riesgo * R:B * WinRate) - (%Riesgo * LossRate)
    // Asumiendo WinRate 50% para ser conservadores (como el Excel parece sugerir)
    const winRate = 0.5;
    const avgGainPerTradePercent = (config.riskPerTrade * config.riskReward * winRate) - (config.riskPerTrade * (1 - winRate));

    let totalWithdrawn = 0;

    for (let i = 1; i <= months; i++) {
        const startBalance = currentBalance;

        // Crecimiento bruto del mes (Interés Compuesto sobre los trades del mes)
        // Simplificación: Balance * (1 + %GananciaPromedio)^Trades
        // Ojo: En excel suele ser lineal mes a mes, aquí lo haremos preciso.
        const monthlyGrowthFactor = 1 + (avgGainPerTradePercent / 100 * config.tradesPerMonth);
        let endBalanceGross = startBalance * monthlyGrowthFactor;

        const grossProfit = endBalanceGross - startBalance;

        // Cálculo del Retiro
        let withdrawalAmount = 0;
        if (grossProfit > 0) {
            withdrawalAmount = grossProfit * (config.withdrawalPercentage / 100);
        }

        // Balance Final Neto (Lo que queda para interés compuesto del mes siguiente)
        const endBalanceNet = endBalanceGross - withdrawalAmount;

        projection.push({
            month: i,
            startBalance,
            profit: grossProfit,
            withdrawal: withdrawalAmount,
            endBalance: endBalanceNet,
            growthPercent: ((endBalanceNet - startBalance) / startBalance) * 100
        });

        currentBalance = endBalanceNet;
        totalWithdrawn += withdrawalAmount;
    }

    return { projection, finalBalance: currentBalance, totalWithdrawn };
};